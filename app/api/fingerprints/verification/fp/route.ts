import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/db";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const { fingerprintId } = await req.json();

    const id = Number(fingerprintId);
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid fingerprint ID" },
        { status: 400 }
      );
    }

    const member = await Member.findOne({ fingerprintId: id });

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
        },
        { status: 403 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      memberId: member._id,
      date: { $gte: today },
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
          membershipType: member.membershipType,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
