"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

export default function SignupPage() {
  const { user, loading: authLoading, signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading || user) return null;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email: form.email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, otp);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setOtpLoading(true);
    try {
      await api.post("/auth/send-otp", { email: form.email });
      alert("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      <Link 
        href="/" 
        className="absolute top-6 left-6 text-sm text-ink/65 hover:text-ink flex items-center gap-1.5 font-medium transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-1">
          {step === 1 ? "Create your account" : "Verify your email"}
        </h1>
        <p className="text-sm text-ink/60 mb-6">
          {step === 1 
            ? "Start keeping a proper ledger of your tasks." 
            : "Enter the verification code we sent to your email."}
        </p>

        {error && (
          <div className="mb-4 text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-line rounded-sm pl-3 pr-10 py-2 bg-white focus-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/50 hover:text-ink transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 focus-ring"
            >
              {loading ? "Sending code..." : "Sign up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <p className="text-xs text-ink/60 text-center">
              Verification email sent to <strong>{form.email}</strong>
            </p>
            <div>
              <label className="block text-sm mb-1" htmlFor="otp">Verification Code</label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                pattern="\d{6}"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring text-center text-lg tracking-widest font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 focus-ring"
            >
              {loading ? "Verifying..." : "Verify & Sign Up"}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={otpLoading}
                className="text-xs text-accent hover:underline disabled:opacity-50"
              >
                {otpLoading ? "Resending code..." : "Resend code"}
              </button>
            </div>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-ink/50 hover:underline"
              >
                Go back to change details
              </button>
            </div>
          </form>
        )}

        <p className="text-sm text-ink/60 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
