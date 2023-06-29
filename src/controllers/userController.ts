import { Request, Response } from "express";
import User from "../models/User";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

export const userController = {
  signup: async (req: Request, res: Response) => {
    const {
      email,
      password,
      birthday,
      username,
      phoneNumber,
      firstName,
      lastName,
      organizationName,
    } = req.body;

    try {
      // Check if user already exists
      let user =
        (await User.findOne({ email })) || (await User.findOne({ username }));
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // Create a new user
      user = new User({
        email,
        password,
        birthday,
        username,
        phoneNumber,
        firstName,
        lastName,
        organizationName,
      }); // Assume you're saving plain password for simplicity

      // Save the user to the database
      await user.save();

      res.status(200).send("User registered successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },
};
