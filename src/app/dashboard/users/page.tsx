"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import type { User } from "@/types";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", search, page],
    queryFn: () => usersApi.list({ search: search || undefined, page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name, admission number, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Admission No.
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Class
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Batch
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Actions
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
            ) : data?.data.users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              data?.data.users.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.admissionNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.className}
                    {user.section ? ` - ${user.section}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.batch}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
            Showing {data.data.users.length} of {data.data.pagination.total}{" "}
            users
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

      {/* User Form Modal */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            queryClient.invalidateQueries({ queryKey: ["users"] });
          }}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
  onSuccess,
}: {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    admissionNumber: user?.admissionNumber || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    rollNumber: user?.rollNumber || "",
    className: user?.className || "",
    section: user?.section || "",
    batch: user?.batch || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (user) {
        await usersApi.update(user.id, formData);
      } else {
        await usersApi.create(formData);
      }
      onSuccess();
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        setError(err.response.data.message as string);
      } else {
        setError("Failed to save user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {user ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Number *
            </label>
            <input
              type="text"
              value={formData.admissionNumber}
              onChange={(e) =>
                setFormData({ ...formData, admissionNumber: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) =>
                  setFormData({ ...formData, rollNumber: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <input
                type="text"
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) =>
                  setFormData({ ...formData, className: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., A"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : user ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
