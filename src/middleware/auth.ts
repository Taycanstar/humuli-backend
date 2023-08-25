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
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("Authorization header missing");
      return res.status(400).json({ message: "Unauthorized: Token missing" });
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2) {
      console.log("Token format is incorrect");
      return res
        .status(400)
        .json({ message: "Unauthorized: Token format is incorrect" });
    }

    const token = tokenParts[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.SECRET as string) as any;
    } catch (err: any) {
      console.error("Token verification failed:", err.message);
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is invalid" });
    }

    const user = await User.findById(payload._id);
    if (!user) {
      console.log("User with given ID not found");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Unexpected error in requireLogin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
