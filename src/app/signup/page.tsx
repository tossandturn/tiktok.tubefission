"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setSuccess(true);
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to signup");
    }
  };

  const handleOAuthSignup = (provider: "github" | "google") => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
                <path
                  d="M24.5 8.5c-2.5 0-4.8-1.3-6.1-3.3v11.8c0 5.2-4.2 9.5-9.5 9.5S-.6 22.2-.6 17s4.2-9.5 9.5-9.5c.5 0 1 0 1.5.1v5.2c-.5-.1-1-.2-1.5-.2-2.4 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3V0h5.1c.7 3.2 3.2 5.7 6.4 6.4v2.1z"
                  transform="translate(6, 4)"
                  fill="url(#tiktok-gradient)"
                />
                <defs>
                  <linearGradient id="tiktok-gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#00f2ea" />
                    <stop offset="50%" stopColor="#00f2ea" />
                    <stop offset="50%" stopColor="#ff0050" />
                    <stop offset="100%" stopColor="#ff0050" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-white uppercase">
                TikTok
              </span>
              <span className="text-xs font-bold tracking-[0.2em] text-[#00f2ea] uppercase">
                Intelligence
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8"
        >
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Create Account
          </h1>
          <p className="text-zinc-400 text-center text-sm mb-6">
            Get unlimited video analysis and trend insights
          </p>

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              Account created! Redirecting...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4 mb-6">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="creatorname"
                className="w-full bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl"
                required
                minLength={8}
              />
              <p className="text-zinc-500 text-xs mt-1">Must be at least 8 characters</p>
            </div>
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-[#ff0050] to-[#ff4080] hover:from-[#ff0040] hover:to-[#ff3070] text-white font-semibold py-6 rounded-xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 w-5 h-5" />
                  Create Free Account
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-zinc-950 text-zinc-500">Or sign up with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignup("github")}
              className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 py-5 rounded-xl"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignup("google")}
              className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 py-5 rounded-xl"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#00f2ea] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
