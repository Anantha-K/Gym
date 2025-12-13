import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/db";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

export const GET = async (
  _req: NextRequest,
  { params }: { params: { fp: string } }
) => {
  try {
    await connectDb();

    const fp = Number(params.fp);

    if (!fp || isNaN(fp)) {
      return NextResponse.json(
        { error: "Invalid fingerprint ID" },
        { status: 400 }
      );
    }

    const member = await Member.findOne({ fp });

    if (!member) {
      return NextResponse.json(
        { error: "No member found for this fingerprint ID" },
        { status: 404 }
      );
    }

    member.updateStatus();
    await member.save();

    if (member.status !== "Active") {
      return NextResponse.json(
        {
          access: false,
          message: `Access denied. Member is ${member.status}`,
          member: {
            name: member.name,
            status: member.status,
            membershipType: member.membershipType,
            fp: member.fp,
          },
        },
        { status: 403 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      memberId: member._id,
      date: { $gte: today }
    });

    if (!existing) {
      await Attendance.create({ memberId: member._id });
    }

    return NextResponse.json(
      {
        access: true,
        message: "Access granted",
        member: {
          name: member.name,
          phoneNumber: member.phoneNumber,
          membershipType: member.membershipType,
          fp: member.fp,
          subscriptionEndDate: member.subscriptionEndDate,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
