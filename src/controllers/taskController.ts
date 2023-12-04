import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import Confirmation from "../models/Confirmation";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
import crypto from "crypto";
import sendEmail from "../utils/email";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const taskController = {
  newTask: async (req: Request, res: Response) => {
    const userId = req.body.deviceId;
    const { name, goal, color } = req.body;

    try {
      let user = await User.findOne({ deviceId: userId });

      if (!user || !user.maxtickerData)
        return res.status(400).json({ message: "User or user data not found" });

      const newTask = {
        name,
        goal,
        color,
        sessions: [],
      };

      // // Check user's subscription status
      // if (user.subscription !== 'plus' && user.maxtickerData.tasks.length >= 4) {
      //   return res.status(400).json({
      //     message: "Subscribe to Maxticker Plus to add unlimited stopwatches",
      //   });
      // }

      user.maxtickerData.tasks.push(newTask);
      await user.save();

      return res.status(200).json({ message: "Task added successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  getAllTasks: async (req: Request, res: Response) => {
    // const userId = (req?.user as IUser)?._id;
    const userId = req.params.id;
    try {
      // const user = await User.findById(userId);
      let user = await User.findOne({ deviceId: userId });

      if (!user || !user.maxtickerData)
        return res.status(400).json({ message: "User or user data not found" });

      return res.status(200).json(user?.maxtickerData?.tasks);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  updateTask: async (req: Request, res: Response) => {
    // const userId = (req?.user as IUser)?._id;
    const userId = req.body.deviceId;
    const taskId = req.params.id;

    try {
      // const user = await User.findById(userId);
      let user = await User.findOne({ deviceId: userId });

      if (!user || !user.maxtickerData)
        return res.status(400).json({ message: "User or user data not found" });

      const taskIndex = user?.maxtickerData?.tasks.findIndex(
        (t) => t._id == taskId
      );
      if (taskIndex === -1)
        return res.status(400).json({ message: "Task not found" });

      // Update the task
      const updatedTask = {
        ...user.maxtickerData.tasks[taskIndex],
        ...req.body,
      };

      user.maxtickerData.tasks[taskIndex] = updatedTask;

      await user.save();
      return res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  deleteTask: async (req: Request, res: Response) => {
    // const userId = (req?.user as IUser)?._id;
    const taskId = req.params.id; // Assuming you pass task ID in the URL
    // const deviceId = req.body.deviceId;
    const userId = req.body.deviceId;
    try {
      // const user = await User.findById(userId);
      let user = await User.findOne({ deviceId: userId });
      if (!user || !user.maxtickerData)
        return res.status(400).json({ message: "User or user data not found" });

      //   user.maxtickerData.tasks = user.maxtickerData.tasks.filter(
      //     (t) => t._id !== taskId
      //   );

      user.maxtickerData.tasks = user.maxtickerData.tasks.filter(
        (t) => String(t._id) !== String(taskId)
      );

      await user.save();
      console.log("task deleted");
      return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  getSingleTask: async (req: Request, res: Response) => {
    // const userId = (req.user as IUser)._id;
    const userId = req.body.deviceId;
    const taskId = req.params.taskId;

    try {
      // const user = await User.findById(userId);
      let user = await User.findOne({ deviceId: userId });
      if (!user || !user.maxtickerData)
        return res.status(400).json({ message: "User or user data not found" });

      const task = user.maxtickerData.tasks.find(
        (t) => t._id.toString() === taskId
      );

      if (!task) return res.status(404).json({ message: "Task not found" });

      return res.status(200).json(task);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // ... [Other session-related methods]

  updateStreak: async (taskId: string, userId: string) => {
    try {
      // const user = await User.findById(userId);
      let user = await User.findOne({ deviceId: userId });

      if (!user || !user.maxtickerData) return false;

      const taskIndex = user.maxtickerData.tasks.findIndex(
        (t) => t._id == taskId
      );
      if (taskIndex === -1) return false;

      const today = new Date();
      const lastActiveDay =
        user.maxtickerData.tasks[taskIndex].activeDays.slice(-1)[0];

      if (lastActiveDay && isConsecutiveDay(lastActiveDay, today)) {
        user.maxtickerData.tasks[taskIndex].streak++;
        user.maxtickerData.tasks[taskIndex].activeDays.push(today);

        if (
          user.maxtickerData.tasks[taskIndex].streak >
          user.maxtickerData.tasks[taskIndex].longestStreak
        ) {
          user.maxtickerData.tasks[taskIndex].longestStreak =
            user.maxtickerData.tasks[taskIndex].streak;
        }
      } else {
        user.maxtickerData.tasks[taskIndex].streak = 1;
        user.maxtickerData.tasks[taskIndex].activeDays = [today];
      }

      await user.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  endSession: async (req: Request, res: Response) => {
    // const userId = (req?.user as IUser)?._id;
    const userId = req.body.deviceId;
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
      // const user = await User.findById(userId.toString());
      let user = await User.findOne({ deviceId: userId });
      if (!user || !user.maxtickerData) {
        return res.status(400).json({ message: "User or user data not found" });
      }

      const task = user.maxtickerData.tasks.find(
        (t) => t._id.toString() === taskId
      );
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
      await user.save();
      console.log("success!");
      return res.status(200).json({
        message: "Session saved successfully",
        session: newSession,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

function isConsecutiveDay(date1: Date, date2: Date) {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}
