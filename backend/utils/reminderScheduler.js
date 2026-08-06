import cron from "node-cron";
import Task from "../models/Task.js";
import User from "../models/User.js";
import sendEmail from "./sendEmail.js";

// Runs every minute, checks for tasks whose reminder time has passed
const startReminderScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const dueTasks = await Task.find({
        reminder: { $lte: now },
        reminderSent: false,
        completed: false,
      }).populate("user", "name email");

      for (const task of dueTasks) {
        if (!task.user?.email) continue;

        try {
          await sendEmail({
            to: task.user.email,
            subject: `Reminder: ${task.title}`,
            text: `Hi ${task.user.name}, this is a reminder for your task "${task.title}" due on ${new Date(
              task.dueDate
            ).toLocaleString()}.`,
          });

          task.reminderSent = true;
          await task.save();
        } catch (err) {
          console.error(`Failed to send reminder for task ${task._id}:`, err.message);
        }
      }
    } catch (error) {
      console.error("Reminder scheduler error:", error.message);
    }
  });

  console.log("Reminder scheduler started (runs every minute)");
};

export default startReminderScheduler;
