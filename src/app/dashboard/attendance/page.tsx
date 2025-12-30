"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi, usersApi, devicesApi } from "@/lib/api";
import type { Attendance, User, Device } from "@/types";
import { format } from "date-fns";

export default function AttendancePage() {
  const [filters, setFilters] = useState({
    userId: "",
    deviceId: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);

  const { data: usersData } = useQuery({
    queryKey: ["users-select"],
    queryFn: () => usersApi.list({ limit: 1000 }),
  });

  const { data: devicesData } = useQuery({
    queryKey: ["devices-select"],
    queryFn: devicesApi.list,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", filters, page],
    queryFn: () =>
      attendanceApi.list({
        userId: filters.userId || undefined,
        deviceId: filters.deviceId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
        limit: 50,
      }),
  });

  const clearFilters = () => {
    setFilters({
      userId: "",
      deviceId: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.userId || filters.deviceId || filters.startDate || filters.endDate;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Log</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={filters.userId}
              onChange={(e) => {
                setFilters({ ...filters, userId: e.target.value });
                setPage(1);
              }}
              className="w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {usersData?.data.users.map((user: User) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device
            </label>
            <select
              value={filters.deviceId}
              onChange={(e) => {
                setFilters({ ...filters, deviceId: e.target.value });
                setPage(1);
              }}
              className="w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Devices</option>
              {devicesData?.data.map((device: Device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value });
                setPage(1);
              }}
              className="w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value });
                setPage(1);
              }}
              className="w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Device
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Event
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data?.data.attendances.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              data?.data.attendances.map((record: Attendance) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {format(new Date(record.createdAt), "MMM d, yyyy HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {record.user.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.device.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        record.event === "IN"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.event}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.confidence !== null ? `${record.confidence}%` : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.data.pagination && data.data.pagination.pages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Showing {data.data.attendances.length} of{" "}
            {data.data.pagination.total} records
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-600">
              Page {page} of {data.data.pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.data.pagination.pages}
              className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
