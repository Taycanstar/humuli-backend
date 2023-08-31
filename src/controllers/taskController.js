"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
exports.taskController = {
    newTask: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Get task details from the request
        const { name, goal, color } = req.body;
        try {
            // Find the user
            let user = yield User_1.default.findById(userId);
            if (!user || !user.maxtickerData)
                return res.status(400).json({ message: "User or user data not found" });
            // Create new task
            const newTask = {
                name,
                goal,
                color,
                sessions: [], // Initialize sessions as empty
            };
            // Validate tasks array limit
            if (((_b = user === null || user === void 0 ? void 0 : user.maxtickerData) === null || _b === void 0 ? void 0 : _b.tasks) && user.maxtickerData.tasks.length >= 4) {
                return res.status(400).json({
                    message: "Subscribe to Maxticker Plus to add unlimited stopwatches",
                });
            }
            // Add new task to the user's tasks
            (_c = user === null || user === void 0 ? void 0 : user.maxtickerData) === null || _c === void 0 ? void 0 : _c.tasks.push(newTask);
            // Save the updated user
            yield user.save();
            return res.status(200).json({ message: "Task added successfully" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
    getAllTasks: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _d, _e;
        const userId = (_d = req === null || req === void 0 ? void 0 : req.user) === null || _d === void 0 ? void 0 : _d._id;
        try {
            const user = yield User_1.default.findById(userId);
            if (!user || !user.maxtickerData)
                return res.status(400).json({ message: "User or user data not found" });
            return res.status(200).json((_e = user === null || user === void 0 ? void 0 : user.maxtickerData) === null || _e === void 0 ? void 0 : _e.tasks);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
    updateTask: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _f, _g;
        const userId = (_f = req === null || req === void 0 ? void 0 : req.user) === null || _f === void 0 ? void 0 : _f._id;
        const taskId = req.params.id;
        try {
            const user = yield User_1.default.findById(userId);
            if (!user || !user.maxtickerData)
                return res.status(400).json({ message: "User or user data not found" });
            const taskIndex = (_g = user === null || user === void 0 ? void 0 : user.maxtickerData) === null || _g === void 0 ? void 0 : _g.tasks.findIndex((t) => t._id == taskId);
            if (taskIndex === -1)
                return res.status(400).json({ message: "Task not found" });
            // Update the task
            const updatedTask = Object.assign(Object.assign({}, user.maxtickerData.tasks[taskIndex]), req.body);
            user.maxtickerData.tasks[taskIndex] = updatedTask;
            yield user.save();
            return res.status(200).json({ message: "Task updated successfully" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
    deleteTask: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _h;
        const userId = (_h = req === null || req === void 0 ? void 0 : req.user) === null || _h === void 0 ? void 0 : _h._id;
        const taskId = req.params.id; // Assuming you pass task ID in the URL
        try {
            const user = yield User_1.default.findById(userId);
            if (!user || !user.maxtickerData)
                return res.status(400).json({ message: "User or user data not found" });
            //   user.maxtickerData.tasks = user.maxtickerData.tasks.filter(
            //     (t) => t._id !== taskId
            //   );
            user.maxtickerData.tasks = user.maxtickerData.tasks.filter((t) => String(t._id) !== String(taskId));
            yield user.save();
            console.log("task deleted");
            return res.status(200).json({ message: "Task deleted successfully" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
    getSingleTask: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.user._id;
        const taskId = req.params.taskId;
        try {
            const user = yield User_1.default.findById(userId);
            if (!user || !user.maxtickerData)
                return res.status(400).json({ message: "User or user data not found" });
            const task = user.maxtickerData.tasks.find((t) => t._id.toString() === taskId);
            if (!task)
                return res.status(404).json({ message: "Task not found" });
            return res.status(200).json(task);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
    // ... [Other session-related methods]
    updateStreak: (taskId, userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findById(userId);
            if (!user || !user.maxtickerData)
                return false;
            const taskIndex = user.maxtickerData.tasks.findIndex((t) => t._id == taskId);
            if (taskIndex === -1)
                return false;
            const today = new Date();
            const lastActiveDay = user.maxtickerData.tasks[taskIndex].activeDays.slice(-1)[0];
            if (lastActiveDay && isConsecutiveDay(lastActiveDay, today)) {
                user.maxtickerData.tasks[taskIndex].streak++;
                user.maxtickerData.tasks[taskIndex].activeDays.push(today);
                if (user.maxtickerData.tasks[taskIndex].streak >
                    user.maxtickerData.tasks[taskIndex].longestStreak) {
                    user.maxtickerData.tasks[taskIndex].longestStreak =
                        user.maxtickerData.tasks[taskIndex].streak;
                }
            }
            else {
                user.maxtickerData.tasks[taskIndex].streak = 1;
                user.maxtickerData.tasks[taskIndex].activeDays = [today];
            }
            yield user.save();
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }),
    endSession: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _j;
        const userId = (_j = req === null || req === void 0 ? void 0 : req.user) === null || _j === void 0 ? void 0 : _j._id;
        console.log(userId, "id");
        if (!userId) {
            return res.status(400).json({ message: "User ID not found" });
        }
        const taskId = req.params.id;
        if (!taskId) {
            return res.status(400).json({ message: "Task ID not provided" });
        }
        console.log(taskId, "taskid");
        // Get session data from the request body
        const sessionData = req.body;
        console.log(sessionData, "data");
        try {
            const user = yield User_1.default.findById(userId.toString());
            if (!user || !user.maxtickerData) {
                return res.status(400).json({ message: "User or user data not found" });
            }
            const task = user.maxtickerData.tasks.find((t) => t._id.toString() === taskId);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            // Create a new session with the data received from the frontend
            const newSession = {
                status: sessionData.status,
                totalDuration: sessionData.totalDuration,
                breaks: sessionData.breaks,
                timeSpentOnBreaks: sessionData.timeSpentOnBreaks,
                laps: sessionData.laps,
                startTime: sessionData.startTime,
                // Add any other fields you're sending from the frontend
            };
            task.sessions.push(newSession);
            // Save the updated user
            yield user.save();
            console.log("success!");
            return res.status(200).json({
                message: "Session saved successfully",
                session: newSession,
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
};
function isConsecutiveDay(date1, date2) {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}
