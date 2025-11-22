"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (res.ok) {
      const data = await res.json();
      // Store token in cookie for protected routes
      document.cookie = `token=${data.access_token}; Path=/;`;
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-white px-8 py-10 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="text-red-600 pt-2 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
