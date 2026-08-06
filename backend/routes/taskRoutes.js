import express from "express";
const router = express.Router();
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} from "../controllers/taskController.js";
import protect from "../middleware/auth.js";

router.use(protect); // all task routes require login

router.get("/stats/dashboard", getDashboardStats);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

export default router;
