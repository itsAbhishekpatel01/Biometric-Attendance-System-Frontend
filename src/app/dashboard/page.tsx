"use client";

import { useQuery } from "@tanstack/react-query";
import { usersApi, devicesApi, attendanceApi } from "@/lib/api";
import { Users, Cpu, ClipboardList } from "lucide-react";

export default function DashboardPage() {
  const { data: usersData } = useQuery({
    queryKey: ["users-count"],
    queryFn: () => usersApi.list({ limit: 1 }),
  });

  const { data: devicesData } = useQuery({
    queryKey: ["devices-count"],
    queryFn: () => devicesApi.list(),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: () => {
      const today = new Date().toISOString().split("T")[0];
      return attendanceApi.list({ startDate: today, limit: 1 });
    },
  });

  const stats = [
    {
      label: "Total Users",
      value: usersData?.data.pagination.total ?? "-",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Devices",
      value: devicesData?.data.length ?? "-",
      icon: Cpu,
      color: "bg-green-500",
    },
    {
      label: "Today's Attendance",
      value: attendanceData?.data.pagination.total ?? "-",
      icon: ClipboardList,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow p-6 flex items-center space-x-4"
            >
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/users"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="text-blue-500 mb-2" size={24} />
            <h3 className="font-medium text-gray-800">Manage Users</h3>
            <p className="text-sm text-gray-500">Add, edit, or remove users</p>
          </a>
          <a
            href="/dashboard/devices"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Cpu className="text-green-500 mb-2" size={24} />
            <h3 className="font-medium text-gray-800">Manage Devices</h3>
            <p className="text-sm text-gray-500">
              Register and configure devices
            </p>
          </a>
          <a
            href="/dashboard/attendance"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="text-purple-500 mb-2" size={24} />
            <h3 className="font-medium text-gray-800">View Attendance</h3>
            <p className="text-sm text-gray-500">Browse attendance records</p>
          </a>
        </div>
      </div>
    </div>
  );
}
