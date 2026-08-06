"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import TaskCard from "../../components/TaskCard";
import TaskForm from "../../components/TaskForm";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [completed, setCompleted] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [order, setOrder] = useState("asc");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const fetchTasks = useCallback(async () => {
    const params = { sortBy, order };
    if (search) params.search = search;
    if (priority) params.priority = priority;
    if (completed) params.completed = completed;

    const { data } = await api.get("/tasks", { params });
    setTasks(data.tasks);
  }, [search, priority, completed, sortBy, order]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  const handleCreateOrUpdate = async (form) => {
    if (editingTask) {
      await api.put(`/tasks/${editingTask._id}`, form);
    } else {
      await api.post("/tasks", form);
    }
    setShowForm(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleToggleComplete = async (task) => {
    await api.put(`/tasks/${task._id}`, { completed: !task.completed });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  // AI Quick Add: turns a plain sentence into a structured task and creates it directly
  const handleAIQuickAdd = async (e) => {
    e.preventDefault();
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const { data } = await api.post("/ai/parse-task", { text: aiText });
      await api.post("/tasks", data);
      setAiText("");
      fetchTasks();
    } catch (err) {
      setAiError(err.response?.data?.message || "Couldn't parse that with AI. Try the manual form instead.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl">Your tasks</h1>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="bg-accent text-white px-4 py-2 rounded-sm hover:opacity-90 transition-opacity focus-ring text-sm"
          >
            + New task
          </button>
        </div>

        {/* AI Quick Add */}
        <form onSubmit={handleAIQuickAdd} className="mb-6">
          <div className="flex gap-2">
            <input
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder='Try: "Submit client report by Friday 5pm, high priority"'
              className="flex-1 border border-accent/30 bg-accent/5 rounded-sm px-3 py-2.5 text-sm focus-ring"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiText.trim()}
              className="bg-accent text-white px-4 py-2.5 rounded-sm text-sm hover:opacity-90 transition-opacity disabled:opacity-50 focus-ring whitespace-nowrap"
            >
              {aiLoading ? "Adding..." : "✨ Add with AI"}
            </button>
          </div>
          {aiError && <p className="text-xs text-warn mt-1.5">{aiError}</p>}
        </form>

        {/* Search, filter, sort controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 bg-white text-sm flex-1 min-w-[180px] focus-ring"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus-ring"
          >
            <option value="">All priorities</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select
            value={completed}
            onChange={(e) => setCompleted(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus-ring"
          >
            <option value="">All statuses</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>
          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [field, ord] = e.target.value.split("-");
              setSortBy(field);
              setOrder(ord);
            }}
            className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus-ring"
          >
            <option value="dueDate-asc">Due date (earliest)</option>
            <option value="dueDate-desc">Due date (latest)</option>
            <option value="priority-asc">Priority (A-Z)</option>
            <option value="createdAt-desc">Recently added</option>
          </select>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {tasks.length ? (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => {
                  setEditingTask(t);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p className="text-sm text-ink/50 border border-dashed border-line rounded-md px-4 py-10 text-center">
              No tasks match these filters yet.
            </p>
          )}
        </div>

        {showForm && (
          <TaskForm
            initialTask={editingTask}
            onSubmit={handleCreateOrUpdate}
            onClose={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}
      </main>
    </>
  );
}
