import express from "express";
import { payController } from "../controllers/payController"; // Import the handler function

const router = express.Router();

router.post("/webhook", payController.webhookHandler);

export default router;
