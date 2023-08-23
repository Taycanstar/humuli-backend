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
    const { name, goal, start_time, total_duration, status, laps } = req.body;

    try {
      // Find the user
      let user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Create new task
      const newTask = {
        name,
        goal,
        start_time,
        total_duration: total_duration || 0,
        status: status || "stopped",
        laps: laps || [],
        history: [],
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
};
