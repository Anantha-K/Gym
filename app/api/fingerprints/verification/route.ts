import { connectDb } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import Member from "@/models/member";

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const { fingerprintId } = await req.json();

    if (!fingerprintId || typeof fingerprintId !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing fingerprint ID" },
        { status: 400 }
      );
    }

    const member = await Member.findOne({ fingerprintId });

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
            fingerprintId: member.fingerprintId,
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        access: true,
        message: "Access granted",
        member: {
          name: member.name,
          phoneNumber: member.phoneNumber,
          membershipType: member.membershipType,
          fingerprintId: member.fingerprintId,
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
      { fingerprintId: { $exists: true, $ne: null } },
      {
        name: 1,
        phoneNumber: 1,
        membershipType: 1,
        status: 1,
        fingerprintId: 1,
        subscriptionEndDate: 1,
        subscriptionStartDate: 1,
        _id: 1,
      }
    ).sort({ name: 1 });

    if (!membersWithFingerprint.length) {
      return NextResponse.json(
        { message: "No members with fingerprint IDs found", members: [] },
        { status: 404 }
      );
    }

    return NextResponse.json({ members: membersWithFingerprint }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching members with fingerprint IDs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
