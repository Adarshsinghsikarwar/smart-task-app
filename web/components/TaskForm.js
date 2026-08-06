"use client";

import { useState, useEffect } from "react";
import api from "../lib/api";

const emptyForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  category: "General",
  reminder: "",
};

export default function TaskForm({ initialTask, onSubmit, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [suggesting, setSuggesting] = useState(false);
  const [reasoning, setReasoning] = useState("");

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 16) : "",
        priority: initialTask.priority || "Medium",
        category: initialTask.category || "General",
        reminder: initialTask.reminder ? initialTask.reminder.slice(0, 16) : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Asks AI to suggest a priority + category based on the title/description typed so far
  const handleAISuggest = async () => {
    if (!form.title) return;
    setSuggesting(true);
    setReasoning("");
    try {
      const { data } = await api.post("/ai/suggest", {
        title: form.title,
        description: form.description,
      });
      setForm((f) => ({ ...f, priority: data.priority, category: data.category }));
      setReasoning(data.reasoning || "");
    } catch (err) {
      setReasoning("Couldn't get an AI suggestion right now.");
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-20">
      <div className="bg-paper w-full max-w-md rounded-md border border-line p-6">
        <h2 className="font-display text-xl mb-4">
          {initialTask ? "Edit task" : "New task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Due date</label>
              <input
                required
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Reminder</label>
              <input
                type="datetime-local"
                value={form.reminder}
                onChange={(e) => setForm({ ...form, reminder: e.target.value })}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/50">{reasoning}</span>
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={!form.title || suggesting}
              className="text-xs text-accent border border-accent/30 bg-accent/5 px-2.5 py-1 rounded-sm hover:bg-accent/10 transition-colors disabled:opacity-40 focus-ring"
            >
              {suggesting ? "Thinking..." : "✨ AI: suggest priority & category"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus-ring"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-accent text-white py-2.5 rounded-sm hover:opacity-90 transition-opacity focus-ring"
            >
              {initialTask ? "Save changes" : "Create task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-line py-2.5 rounded-sm hover:border-accent transition-colors focus-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
