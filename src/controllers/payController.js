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
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const stripe = require("stripe")(process.env.STRIPE_KEY_TEST);
const monthlyPriceId = process.env.MONTHLY_PRICE_ID;
const yearlyPriceId = process.env.YEARLY_PRICE_ID;
const url = "http://humuli.com";
exports.payController = {
    createCheckoutSession: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const email = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.email;
        const { priceId } = req.body;
        try {
            const session = yield stripe.checkout.sessions.create({
                mode: "subscription",
                line_items: [
                    {
                        price: priceId,
                        // For metered billing, do not pass quantity
                        quantity: 1,
                    },
                ],
                // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
                // the actual Session ID is returned in the query parameter when your customer
                // is redirected to the success page.
                success_url: "myapp://success.html?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: "myapp:///canceled.html",
            });
        }
        catch (error) {
            console.log(error);
        }
    }),
};
