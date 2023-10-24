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
import User, { IUser } from "./src/models/User";

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

app.post(
  "/webhook",
  express.json({ type: "application/json" }),
  async (request, response) => {
    const event = request.body;

    try {
      // Handle the event
      switch (event.type) {
        case "checkout.session.completed":
          const checkoutSession = event.data.object;
          if (checkoutSession.mode === "subscription") {
            const userId = checkoutSession.metadata.userId;

            if (!userId) {
              console.error("User ID is missing in metadata");
              return response
                .status(400)
                .send("Metadata is missing the user ID");
            }

            const user = await User.findByIdAndUpdate(
              userId,
              { subscription: "plus" },
              { new: true }
            );

            if (!user) {
              console.error(`User not found for ID: ${userId}`);
              return response
                .status(404)
                .send(`User not found for ID: ${userId}`);
            }

            console.log(
              `User subscription updated to 'plus' for user ID: ${userId}`
            );
          }
          break;
        // Handle other event types as needed
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      response.json({ received: true });
    } catch (error) {
      console.error("Error in webhook handler:", error);
      response.status(500).send("Internal Server Error");
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
