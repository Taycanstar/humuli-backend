import jwt from "jsonwebtoken";
import User from "../models/User";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const requireLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      const payload = jwt.verify(token, process.env.SECRET as string) as any;
      const user = await User.findById(payload._id);
      if (user) {
        req.user = user.toObject(); // Convert the user object to a plain JavaScript object
        next();
      } else {
        res.status(404).json({ message: "user doesn't exist" });
      }
    } else {
      res.status(400).json({ message: "unauthorized" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
