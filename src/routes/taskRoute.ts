import express from "express";
import { taskController } from "../controllers/taskController";
import { requireLogin } from "../middleware/auth";
const router = express.Router();

router.post("/newTask", requireLogin, taskController.newTask);

export default router;
