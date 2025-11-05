"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  User,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import StudentCard from "@/app/(components)/studentCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface StudentData {
  _id: string;
  name: string;
  age?: number;
  phoneNumber?: string;
  email?: string;
  membershipType: "Basic" | "Premium" | "Student" | "Couple";
  status: "Active" | "Expired" | "Suspended";
  subscriptionEndDate: string | number;
  subscriptionStartDate?: string | number;
  paymentAmount?: number;
  daysRemaining?: number;
}

const fetchMembers = async (): Promise<StudentData[]> => {
  const res = await fetch(`/api/members?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isFetching } = useQuery<StudentData[]>({
    queryKey: ["allstudents"],
    queryFn: fetchMembers,
    staleTime: 0,
    gcTime: 0,
  });

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/members?ts=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch members");
      const json = await res.json();
      queryClient.setQueryData(["allstudents"], json);
      await refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStudents =
    data?.filter((student: StudentData) => {
      const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || student.status === statusFilter;
      const matchesMembership =
        membershipFilter === "All" || student.membershipType === membershipFilter;
      return matchesSearch && matchesStatus && matchesMembership;
    }) || [];

  if (isLoading) {
    return (
      <div className="h-screen overflow-y-auto bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" h-0.5 md:h-screen  overflow-y-auto bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Members Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : "The requested member could not be found."}
            </p>
            <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen overflow-y-auto">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl shadow-lg mb-3">
          <User className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 text-center">Members Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors w-full"
              type="text"
              value={searchTerm}
              placeholder="Search by name, ID, or email..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Student">Student</option>
              <option value="Couple">Couple</option>
            </select>

            <Button
              onClick={handleRefresh}
              disabled={isFetching || refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching || refreshing ? "animate-spin" : ""}`} />
              {isFetching || refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredStudents.length} of {data?.length || 0} members</span>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {data && data.length === 0 ? "No members found" : "No members match your criteria"}
          </h3>
          <p className="text-gray-500">
            {data && data.length === 0
              ? "Start by adding new members to your gym"
              : "Try adjusting your search or filter criteria"}
          </p>
        </div>
      ) : (
        <div className="flex max-w-[85vw] flex-wrap gap-16">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student._id}
              id={student._id}
              name={student.name}
              membershipType={student.membershipType}
              status={student.status}
              subscriptionEndDate={String(student.subscriptionEndDate)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;
