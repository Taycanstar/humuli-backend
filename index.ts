import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import UserRoute from "./src/routes/userRoute";
import TaskRoute from "./src/routes/taskRoute";
import PayRoute from "./src/routes/payRoute";
import ApiRoute from "./src/routes/apiRoute";
const path = require("path");
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
app.post("/auth", AuthRoute);
app.use("/task", TaskRoute);
app.use("/pay", PayRoute);
// Route to serve the success page
app.get("/success", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "success.html"));
});

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
