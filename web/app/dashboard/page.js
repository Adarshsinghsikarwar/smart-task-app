"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.get("/tasks/stats/dashboard").then(({ data }) => setStats(data));
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <h1 className="font-display text-2xl mb-1">
          Good to see you, {user.name.split(" ")[0]}
        </h1>
        <p className="text-ink/60 text-sm mb-8">Here's where things stand today.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="border border-line bg-white rounded-md p-5">
            <p className="text-xs uppercase tracking-wide text-ink/50">Pending</p>
            <p className="font-display text-3xl mt-1">{stats?.pending ?? "–"}</p>
          </div>
          <div className="border border-line bg-white rounded-md p-5">
            <p className="text-xs uppercase tracking-wide text-ink/50">Completed</p>
            <p className="font-display text-3xl mt-1">{stats?.completed ?? "–"}</p>
          </div>
          <div className="border border-line bg-white rounded-md p-5">
            <p className="text-xs uppercase tracking-wide text-ink/50">Upcoming reminders</p>
            <p className="font-display text-3xl mt-1">{stats?.upcomingReminders?.length ?? "–"}</p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg">Upcoming reminders</h2>
          <a href="/tasks" className="text-sm text-accent hover:underline">
            View all tasks
          </a>
        </div>

        <div className="space-y-2">
          {stats?.upcomingReminders?.length ? (
            stats.upcomingReminders.map((task) => (
              <div
                key={task._id}
                className="border border-line bg-white rounded-md px-4 py-3 flex items-center justify-between text-sm"
              >
                <span>{task.title}</span>
                <span className="text-ink/50">
                  {new Date(task.reminder).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/50 border border-dashed border-line rounded-md px-4 py-6 text-center">
              Nothing scheduled. Add a reminder from the Tasks page.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
