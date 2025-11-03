import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDb } from "@/db"
import Payment from "@/models/payments"


export async function GET() {
  try {
    await connectDb()

    const payments = await Payment.find().lean()

    if (!payments.length) {
      return NextResponse.json({ monthlyRevenueData: [], yearlyData: [] })
    }

    const monthlyMap = new Map<string, { month: string; revenue: number; members: Set<string> }>()
    const yearlyMap = new Map<string, { year: string; revenue: number; members: Set<string> }>()

    payments.forEach((payment: any) => {
      const date = new Date(payment.paymentDate)
      const month = date.toLocaleString("default", { month: "short" })
      const year = date.getFullYear().toString()
      const monthKey = `${month}-${year}`

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month, revenue: 0, members: new Set() })
      }
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, { year, revenue: 0, members: new Set() })
      }

      const monthlyData = monthlyMap.get(monthKey)!
      monthlyData.revenue += payment.amount
      monthlyData.members.add(payment.memberId.toString())

      const yearlyData = yearlyMap.get(year)!
      yearlyData.revenue += payment.amount
      yearlyData.members.add(payment.memberId.toString())
    })

    const monthlyRevenueData = Array.from(monthlyMap.values())
      .map(m => ({
        month: m.month,
        revenue: m.revenue,
        members: m.members.size
      }))
      .sort((a, b) => {
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        return months.indexOf(a.month) - months.indexOf(b.month)
      })

    const yearlyData = Array.from(yearlyMap.values())
      .map(y => ({
        year: y.year,
        revenue: y.revenue,
        members: y.members.size
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year))

    return NextResponse.json({ monthlyRevenueData, yearlyData })
  } catch (err) {
    console.error("Analytics API Error:", err)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
