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
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const stripeInstance = new stripe_1.Stripe(process.env.STRIPE_KEY_TEST, {
    apiVersion: "2023-08-16",
});
exports.payController = {
    createCheckoutSession: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.body.userId; // Assume userId is sent in the request body
        console.log("createCheckoutSession called with body:", req.body);
        if (!userId) {
            res.status(400).send("User ID is required");
            return;
        }
        try {
            const session = yield stripeInstance.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        // Reference the Price ID from your Stripe Dashboard
                        price: "price_1Nn4FIIkJrKrc9JwAfpAWwYp",
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url: `https://maxticker-55df64f66a64.herokuapp.com/success`,
                cancel_url: `${req.protocol}://${req.get("host")}/cancel`,
                metadata: {
                    userId: userId, // Include userId in metadata
                },
            });
            res.json({ sessionId: session.id, checkoutUrl: session.url });
        }
        catch (error) {
            res.status(500).send(error.message);
            console.log(error, "error here");
        }
    }),
};
