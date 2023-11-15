"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const router = express_1.default.Router();
router.post("/new-task", taskController_1.taskController.newTask);
router.get("/fetch-all/:id", taskController_1.taskController.getAllTasks);
router.get("/:id", taskController_1.taskController.getSingleTask);
router.put("/:id", taskController_1.taskController.updateTask);
router.delete("/:id", taskController_1.taskController.deleteTask);
router.post("/:id/end-session", taskController_1.taskController.endSession);
exports.default = router;
