"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-display text-xl tracking-tight">
          Ledger
        </Link>

        {user && (
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <Link href="/dashboard" className="hover:text-accent transition-colors focus-ring rounded-sm">
              Dashboard
            </Link>
            <Link href="/tasks" className="hover:text-accent transition-colors focus-ring rounded-sm">
              Tasks
            </Link>
            <button
              onClick={logout}
              className="text-warn hover:opacity-70 transition-opacity focus-ring rounded-sm"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
