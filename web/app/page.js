"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) return null;
  return (
    <div className="min-h-screen bg-paper text-ink font-body flex flex-col justify-between selection:bg-accentSoft selection:text-accent">
      
      {/* Top Navbar */}
      <header className="w-full px-8 py-6 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Flucy<span className="text-accent">.</span>
        </Link>
        <Link href="/login" className="text-sm font-medium hover:text-accent transition-colors">
          Log in
        </Link>
      </header>

      {/* Minimal Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto -mt-16">
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-5 px-3 py-1 bg-accentSoft rounded-full">
          Clarity in every task
        </span>
        
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight max-w-2xl text-ink font-semibold">
          Simplify your day, one task at a time<span className="text-accent">.</span>
        </h1>
        
        <p className="mt-6 text-base sm:text-lg text-ink/70 max-w-xl leading-relaxed">
          Flucy organizes your schedule using natural language AI and gentle reminders. No complexity, no clutter.
        </p>
        
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/signup"
            className="bg-accent text-white px-6 py-3 rounded-sm text-sm hover:opacity-90 transition-opacity focus-ring font-medium shadow-sm"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="border border-line bg-white/50 px-6 py-3 rounded-sm text-sm hover:border-accent hover:bg-white transition-all focus-ring font-medium"
          >
            Log in
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-xs text-ink/40 border-t border-line/40 max-w-5xl mx-auto">
        <p>© 2026 Flucy. All rights reserved. Your productivity, simplified.</p>
      </footer>

    </div>
  );
}
