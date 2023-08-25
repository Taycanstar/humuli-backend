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
    const userId = (req?.user as IUser)?._id;

    // Get task details from the request
    const { name, goal, sessions, laps, color } = req.body;

    try {
      // Find the user
      let user = await User.findById(userId);

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
      if (user?.maxtickerData?.tasks && user.maxtickerData.tasks.length >= 4) {
        return res.status(400).json({
          message: "Suscribe to Maxticker Plus to add unlimited stopwatches",
        });
      }

      // Add new task to the user's tasks
      user?.maxtickerData?.tasks.push(newTask);

      // Save the updated user
      await user.save();

      return res.status(200).json({ message: "Task added successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  getAllTasks: async (req: Request, res: Response) => {
    const userId = (req?.user as IUser)?._id;

    try {
      const user = await User.findById(userId);

      if (!user || !user.maxtickerData)
        return res.status(400).json({ message: "User or user data not found" });

      return res.status(200).json(user?.maxtickerData?.tasks);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  updateTask: async (req: Request, res: Response) => {
    const userId = (req?.user as IUser)?._id;
    const taskId = req.params.id; // Assuming you pass task ID in the URL

    try {
      const user = await User.findById(userId);

      if (!user || !user.maxtickerData)
        return res.status(400).json({ message: "User or user data not found" });

      const taskIndex = user?.maxtickerData?.tasks.findIndex(
        (t) => t._id == taskId
      );
      if (taskIndex === -1)
        return res.status(400).json({ message: "Task not found" });

      // Update the task
      user.maxtickerData.tasks[taskIndex] = req.body;

      await user.save();
      return res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  deleteTask: async (req: Request, res: Response) => {
    const userId = (req?.user as IUser)?._id;
    const taskId = req.params.id; // Assuming you pass task ID in the URL

    try {
      const user = await User.findById(userId);
      if (!user || !user.maxtickerData)
        return res.status(400).json({ message: "User or user data not found" });

      user.maxtickerData.tasks = user.maxtickerData.tasks.filter(
        (t) => t._id !== taskId
      );

      await user.save();
      return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  getSingleTask: async (req: Request, res: Response) => {
    const userId = (req.user as IUser)._id;
    const taskId = req.params.taskId;

    try {
      const user = await User.findById(userId);
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
};
