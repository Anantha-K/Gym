import { connectDb } from "@/db";
import Attendance from "@/models/attendance";
import Member from "@/models/member";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ attendance: [] }, { status: 200 });
    }

    const target = new Date(dateParam);
    target.setHours(0, 0, 0, 0);

    const next = new Date(target);
    next.setDate(target.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: target, $lt: next },
    }).populate("memberId", "name");

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { memberId, date } = await req.json();

    if (!memberId || !date) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const attendance = await Attendance.create({
      memberId,
      date: new Date(date),
    });

    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
