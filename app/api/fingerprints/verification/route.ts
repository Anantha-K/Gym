import { connectDb } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import Member from "@/models/member";
import Attendance from "@/models/attendance";


export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const { fp } = await req.json();

    if (!fp || typeof fp !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing fingerprint ID" },
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
    console.error("Fingerprint verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};


export const GET = async () => {
  try {
    await connectDb();

    const membersWithFingerprint = await Member.find(
      { fp: { $exists: true, $ne: null } },
      { fp: 1, _id: 0 }
    ).sort({ fp: 1 });

    if (!membersWithFingerprint.length) {
      return NextResponse.json(
        { message: "No members with fingerprint IDs found", members: [] },
        { status: 404 }
      );
    }

    const result = membersWithFingerprint.map(member => ({
      fp: member.fp
    }));

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching members with fingerprint IDs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
