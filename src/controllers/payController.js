"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payController = void 0;
const stripe_1 = require("stripe");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const stripeInstance = new stripe_1.Stripe(process.env.STRIPE_KEY_TEST, {
    apiVersion: "2023-08-16",
});
exports.payController = {
    webhookHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            const sigHeader = req.headers["stripe-signature"];
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!sigHeader) {
                res.status(400).send(`Webhook Error: Invalid signature header`);
                return;
            }
            let event;
            try {
                event = stripeInstance.webhooks.constructEvent(data, sigHeader, endpointSecret);
            }
            catch (err) {
                res.status(400).send(`Webhook Error: ${err.message}`);
                return;
            }
            console.log("✅ Success:", event.id);
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                // Assume user ID is stored in metadata.userId when the Stripe session was created
                const userId = session.metadata.userId;
                if (!userId) {
                    res.status(400).send("Webhook Error: User ID not found");
                    return;
                }
                const user = yield User_1.default.findByIdAndUpdate(userId, { subscription: "plus" }, { new: true });
                res.status(200).send("Session was successful!");
                return;
            }
            res.status(200);
        }));
    }),
};
// Your route definition remains the same
