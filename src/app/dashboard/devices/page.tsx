"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devicesApi } from "@/lib/api";
import type { Device } from "@/types";
import { Plus, Trash2, RefreshCw, Copy, Check, X } from "lucide-react";

export default function DevicesPage() {
  const [showModal, setShowModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: devicesApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: devicesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["devices"] }),
  });

  const regenerateMutation = useMutation({
    mutationFn: devicesApi.regenerateToken,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["devices"] }),
  });

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete device "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleRegenerate = (id: string, name: string) => {
    if (
      confirm(
        `Regenerate token for "${name}"? The device will need to be reconfigured.`
      )
    ) {
      regenerateMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Devices</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Device</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No devices registered yet. Add your first device to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((device: Device) => (
            <div key={device.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {device.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Device ID: {device.deviceId}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(device.createdAt).toLocaleDateString()}
                  </p>
                  {device._count && (
                    <p className="text-sm text-gray-600 mt-1">
                      Attendance Records: {device._count.attendance}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRegenerate(device.id, device.name)}
                    disabled={regenerateMutation.isPending}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                    title="Regenerate Token"
                  >
                    <RefreshCw
                      size={18}
                      className={
                        regenerateMutation.isPending ? "animate-spin" : ""
                      }
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(device.id, device.name)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Device"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Token Display */}
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <div className="flex-1 mr-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Device Token (for firmware configuration)
                    </p>
                    <code className="text-sm font-mono text-gray-800 break-all">
                      {device.token}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToken(device.token)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    title="Copy token"
                  >
                    {copiedToken === device.token ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Device Form Modal */}
      {showModal && (
        <DeviceFormModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            queryClient.invalidateQueries({ queryKey: ["devices"] });
          }}
        />
      )}
    </div>
  );
}

function DeviceFormModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    deviceId: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await devicesApi.create(formData);
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
        setError("Failed to create device");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Add Device</h2>
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
              Device Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Main Entrance Scanner"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device ID *
            </label>
            <input
              type="text"
              value={formData.deviceId}
              onChange={(e) =>
                setFormData({ ...formData, deviceId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., dev-01"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              A unique identifier for this device
            </p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
            A secure token will be automatically generated. You&apos;ll need to
            copy this token and configure it in the device firmware.
          </div>
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
              {loading ? "Creating..." : "Create Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
