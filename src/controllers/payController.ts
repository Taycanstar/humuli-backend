import { Request, Response } from "express";
import { Stripe } from "stripe";
import dotenv from "dotenv";
import path from "path";
import User, { IUser } from "../models/User";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const stripeInstance = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: "2023-08-16",
});

interface StripeSession {
  id: string;
  object: string;
  created: number;
  payment_status: string;
  metadata: {
    userId: string;
    [key: string]: any;
  };
  // ... other fields you expect to receive from Stripe
}

export const payController = {
  createCheckoutSession: async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const item = req.body.item;
    console.log("createCheckoutSession called with body:", req.body);
    if (!userId) {
      res.status(400).send("User ID is required");
      return;
    }

    try {
      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            // Reference the Price ID from your Stripe Dashboard
            price:
              item === "monthly"
                ? "price_1Nn4GWIkJrKrc9Jwm5V62Jo3"
                : "price_1Nn4GWIkJrKrc9JwdAwumyfz",
            //   price:
            //     item === "monthly"
            //       ? "price_1Nn4FIIkJrKrc9JwwJLnzruw"
            //       : "price_1Nn4FIIkJrKrc9JwAfpAWwYp",
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
    } catch (error: any) {
      res.status(500).send(error.message);
      console.log(error, "error here");
    }
  },
};
