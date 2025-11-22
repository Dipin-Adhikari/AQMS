"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    // Get token from cookie
    const match = document.cookie.match(/(?:^| )token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      setError("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      if (res.ok) {
        setSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => router.push("/admin"), 2000);
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to change password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </button>

        <div className="flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-indigo-600" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
