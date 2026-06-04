"use client";

import { useState } from "react";

export function LoginDiagnostics() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("test123");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function testLogin() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log("Testing login with:", { email, password });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setResult(`✅ Login successful!\nUser: ${data.user?.username}\nToken: ${data.token?.substring(0, 20)}...`);
      } else {
        setError(`❌ Login failed (${response.status}): ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setError(`❌ Network error: ${err.message}`);
      console.error("Login test error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-white mb-4">Login Diagnostics</h3>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      <button
        onClick={testLogin}
        disabled={loading}
        className="w-full bg-[#ff0050] hover:bg-[#ff0040] text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Login"}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-green-400 text-sm whitespace-pre-line">
          {result}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 text-xs text-zinc-500">
        <p>Default test account:</p>
        <p>Email: test@example.com</p>
        <p>Password: test123</p>
      </div>
    </div>
  );
}
