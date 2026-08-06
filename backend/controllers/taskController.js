import Task from "../models/Task.js";

// @route GET /api/tasks
// Supports: search, filter (priority, category, completed), sort, pagination
export const getTasks = async (req, res) => {
  try {
    const { search, priority, category, completed, sortBy, order, page, limit } = req.query;

    const query = { user: req.user._id };

    if (search) {
      query.$text = { $search: search };
    }
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (completed !== undefined) query.completed = completed === "true";

    const sortField = sortBy || "dueDate";
    const sortOrder = order === "desc" ? -1 : 1;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    const tasks = await Task.find(query)
      .sort({ [sortField]: sortOrder })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// @route GET /api/tasks/:id
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch task", error: error.message });
  }
};

// @route POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, reminder } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and due date are required" });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate,
      priority,
      category,
      reminder,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

// @route PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const fields = ["title", "description", "dueDate", "priority", "category", "completed", "reminder"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    // If reminder time changes, allow it to be sent again
    if (req.body.reminder !== undefined) task.reminderSent = false;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

// @route DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

// @route GET /api/tasks/stats/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [pending, completed, upcomingReminders] = await Promise.all([
      Task.countDocuments({ user: userId, completed: false }),
      Task.countDocuments({ user: userId, completed: true }),
      Task.find({
        user: userId,
        completed: false,
        reminder: { $gte: new Date() },
      })
        .sort({ reminder: 1 })
        .limit(5),
    ]);

    res.json({ pending, completed, upcomingReminders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};
