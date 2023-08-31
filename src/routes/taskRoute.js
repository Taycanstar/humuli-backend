"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/new-task", auth_1.requireLogin, taskController_1.taskController.newTask);
router.get("/fetch-all", auth_1.requireLogin, taskController_1.taskController.getAllTasks);
router.get("/:id", auth_1.requireLogin, taskController_1.taskController.getSingleTask);
router.put("/:id", auth_1.requireLogin, taskController_1.taskController.updateTask);
router.delete("/:id", auth_1.requireLogin, taskController_1.taskController.deleteTask);
router.post("/:id/end-session", auth_1.requireLogin, taskController_1.taskController.endSession);
exports.default = router;
