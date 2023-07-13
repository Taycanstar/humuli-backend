import { Request, Response } from "express";
import User from "../models/User";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const apiController = {
  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await User.find({});
      console.log("Data: ", users);
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch users", JSON.stringify(error, null, 2));
      res.status(500).send({ message: "Failed to fetch users" });
    }
  },

  getUserById: async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const user = await User.findById(id);
      res.json(user);
    } catch (error) {
      console.log("error: ", error);
      res.status(500).send({ message: "Failed to fetch user" });
    }
  },

  getUser: async (req: Request, res: Response) => {
    try {
      // req.user should contain the currently logged-in user object
      res.json(req.user);
    } catch (error) {
      console.log("error: ", error);
      res.status(500).send({ message: "Failed to fetch user" });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { username: req.body.username },
        { new: true }
      );
      res.json(user);
    } catch (error) {
      console.log("error: ", error);
      res.status(500).send({ message: "Failed to update user" });
    }
  },

  getUserByValue: async (req: Request, res: Response) => {
    try {
      const { value } = req.query;
      const user =
        (await User.findOne({ email: value })) ||
        (await User.findOne({ username: value }));

      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user by email" });
    }
  },
};
