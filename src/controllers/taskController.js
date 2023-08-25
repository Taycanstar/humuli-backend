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
        const { name, goal, sessions, laps, color } = req.body;
        try {
            // Find the user
            let user = yield User_1.default.findById(userId);
            if (!user || !user.maxtickerData)
                return res.status(400).json({ message: "User or user data not found" });
            // Create new task
            const newTask = {
                name,
                goal,
                sessions: sessions || [],
                laps: laps || [],
                color,
            };
            // Validate tasks array limit
            if (((_b = user === null || user === void 0 ? void 0 : user.maxtickerData) === null || _b === void 0 ? void 0 : _b.tasks) && user.maxtickerData.tasks.length >= 4) {
                return res.status(400).json({
                    message: "Suscribe to Maxticker Plus to add unlimited stopwatches",
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
        const taskId = req.params.id; // Assuming you pass task ID in the URL
        try {
            const user = yield User_1.default.findById(userId);
            if (!user || !user.maxtickerData)
                return res.status(400).json({ message: "User or user data not found" });
            const taskIndex = (_g = user === null || user === void 0 ? void 0 : user.maxtickerData) === null || _g === void 0 ? void 0 : _g.tasks.findIndex((t) => t._id == taskId);
            if (taskIndex === -1)
                return res.status(400).json({ message: "Task not found" });
            // Update the task
            user.maxtickerData.tasks[taskIndex] = req.body;
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
            user.maxtickerData.tasks = user.maxtickerData.tasks.filter((t) => t._id !== taskId);
            yield user.save();
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
};
