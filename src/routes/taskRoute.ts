import express from "express";
import { taskController } from "../controllers/taskController";
import { requireLogin } from "../middleware/auth";
const router = express.Router();

router.post("/new-task", taskController.newTask);
router.get("/fetch-all/:id", taskController.getAllTasks);
router.get("/:id", taskController.getSingleTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.post("/:id/end-session", taskController.endSession);

export default router;
