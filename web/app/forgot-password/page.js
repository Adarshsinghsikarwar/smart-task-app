"use client";

import { useState } from "react";
import Link from "next/link";
import api from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("If that email exists, a password reset link has been sent to it. Please check your inbox.");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-1">Forgot your password?</h1>
        <p className="text-sm text-ink/60 mb-6">Enter your email address and we'll send you a link to reset it.</p>

        {error && (
          <div className="mb-4 text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 text-sm text-ink bg-accent/10 border border-accent/30 rounded-sm px-3 py-2">
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 focus-ring"
            >
              {loading ? "Submitting..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-sm text-ink/60 mt-6 text-center">
          Back to{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
