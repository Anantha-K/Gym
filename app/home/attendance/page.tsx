"use client";

import React, { useState, useEffect } from "react";
import { Users, CheckCircle, RefreshCw, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Member {
  _id: string;
  name: string;
}

interface AttendanceRecord {
  _id: string;
  memberId: Member;
  date: string;
}

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAttendance = async (date: string = selectedDate) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance?date=${date}`);
      const data = await res.json();
      setAttendanceData(data.attendance || []);
      setLoading(false);
    } catch {
      setAttendanceData([]);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance(selectedDate);
    setRefreshing(false);
  };

  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    await fetchAttendance(newDate);
  };

  const filteredAttendance = attendanceData.filter((record) =>
    record.memberId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveAsCSV = () => {
    if (!filteredAttendance.length) return;

    const headers = ["Member ID", "Name", "Check-in Time", "Date"];
    const rows = filteredAttendance.map((record) => [
      record.memberId._id,
      record.memberId.name,
      new Date(record.date).toLocaleTimeString(),
      new Date(record.date).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `attendance_${selectedDate}.csv`;
    link.click();
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen overflow-y-auto bg-gray-50">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center w-14 h-14 bg-black rounded-2xl shadow-lg mb-3">
          <Users className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 text-center">Attendance Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors w-full"
              type="text"
              placeholder="Search by member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>

            <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>

            <Button onClick={saveAsCSV} disabled={filteredAttendance.length === 0} className="flex items-center gap-2 bg-green-600 hover:bg-green-700" size="sm">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredAttendance.length} of {attendanceData.length} members</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading attendance...</span>
        </div>
      ) : filteredAttendance.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No attendance records</h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Member ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Check-in Time</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record, index) => (
                <tr key={record._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4">{record.memberId?.name}</td>
                  <td className="px-6 py-4">{record.memberId?._id}</td>
                  <td className="px-6 py-4">
                    {new Date(record.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Present
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
