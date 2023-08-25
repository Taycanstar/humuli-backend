import express from "express";
import { taskController } from "../controllers/taskController";
import { requireLogin } from "../middleware/auth";
const router = express.Router();

router.post("/new-task", requireLogin, taskController.newTask);
router.get("/fetch-all", requireLogin, taskController.getAllTasks);
router.get("/:id", requireLogin, taskController.getSingleTask);
router.put("/:id", requireLogin, taskController.updateTask);
router.delete("/:id", requireLogin, taskController.deleteTask);

export default router;
