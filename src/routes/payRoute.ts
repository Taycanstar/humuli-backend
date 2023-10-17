import express from "express";
import { payController } from "../controllers/payController"; // Import the handler function

const router = express.Router();

router.post("/webhook", payController.webhookHandler);
router.post("/create-checkout-session", payController.createCheckoutSession);

export default router;
