import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    reminder: {
      type: Date, // when to send the reminder
      default: null,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Helpful indexes for search / filter / sort
taskSchema.index({ title: "text", description: "text" });
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

export default mongoose.model("Task", taskSchema);
