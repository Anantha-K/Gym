import { connectDb } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import Member from "@/models/member";


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
