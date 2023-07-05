import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import UserRoute from "./src/routes/userRoute";
const path = require("path");

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());
const uri: string = process.env.DB_URI!;
const d: string = process.env.POSTMARK_API_TOKEN!;

console.log(d, "tk");

//init routes
app.use("/u", UserRoute);

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
