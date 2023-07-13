import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import UserRoute from "./src/routes/userRoute";
import ApiRoute from "./src/routes/apiRoute";
import AuthRoute from "./src/routes/authRoute";

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());
const uri: string = process.env.DB_URI!;
const d: string = process.env.POSTMARK_API_TOKEN!;

//init routes
app.use("/u", UserRoute);
app.use("/api", ApiRoute);
app.use("/auth", AuthRoute);

// Connect to MongoDB
mongoose.connect(uri).then(() => {
  console.log("Connected to MongoDB");
}).catch;
