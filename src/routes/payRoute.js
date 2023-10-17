"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payController_1 = require("../controllers/payController"); // Import the handler function
const router = express_1.default.Router();
router.post("/webhook", payController_1.payController.webhookHandler);
router.post("/create-checkout-session", payController_1.payController.createCheckoutSession);
exports.default = router;
