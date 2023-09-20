import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import Confirmation from "../models/Confirmation";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
import crypto from "crypto";
import sendEmail from "../utils/email";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const stripe = require("stripe")(process.env.STRIPE_KEY_TEST);
const monthlyPriceId = process.env.MONTHLY_PRICE_ID;
const yearlyPriceId = process.env.YEARLY_PRICE_ID;

const url = "http://humuli.com";

export const payController = {
  createCheckoutSession: async (req: Request, res: Response) => {
    const email = (req?.user as IUser)?.email;
    const { priceId } = req.body;
    try {
      const session = await stripe.checkout.sessions.create({
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
    } catch (error) {
      console.log(error);
    }
  },
};
