"use client";

const priorityStyles = {
  High: "bg-warn/10 text-warn border-warn/30",
  Medium: "bg-accent/10 text-accent border-accent/30",
  Low: "bg-ink/5 text-ink/60 border-line",
};

const formatDueDate = (dueDateString) => {
  if (!dueDateString) return "";
  const date = new Date(dueDateString);
  if (isNaN(date.getTime())) return "";

  const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateString = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1, d2) => 
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(date, today)) {
    return `Today at ${timeString}`;
  } else if (isSameDay(date, tomorrow)) {
    return `Tomorrow at ${timeString}`;
  } else {
    return `${dateString} at ${timeString}`;
  }
};

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }) {
  const due = new Date(task.dueDate);
  const isOverdue = !task.completed && due < new Date();

  return (
    <div className="border border-line bg-white rounded-md p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className="mt-1 w-4 h-4 accent-accent focus-ring"
            aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`}
          />
          <div>
            <h3 className={`font-medium ${task.completed ? "line-through text-ink/40" : ""}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-ink/60 mt-0.5">{task.description}</p>
            )}
          </div>
        </div>

        <span className={`text-xs border rounded-sm px-2 py-1 whitespace-nowrap ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-ink/50">
        <div className="flex items-center gap-3">
          <span className={isOverdue ? "text-warn font-medium" : ""}>
            Due {formatDueDate(task.dueDate)}
          </span>
          <span className="border-l border-line pl-3">{task.category}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onEdit(task)} className="hover:text-accent focus-ring rounded-sm">
            Edit
          </button>
          <button onClick={() => onDelete(task._id)} className="hover:text-warn focus-ring rounded-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
