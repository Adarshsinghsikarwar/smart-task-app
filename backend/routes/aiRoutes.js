import express from "express";
const router = express.Router();
import { parseTask, suggestPriorityAndCategory } from "../controllers/aiController.js";
import protect from "../middleware/auth.js";

router.use(protect);

router.post("/parse-task", parseTask);
router.post("/suggest", suggestPriorityAndCategory);

export default router;
