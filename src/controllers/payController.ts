import { Request, Response } from "express";
import { Stripe } from "stripe";
import dotenv from "dotenv";
import path from "path";
import User, { IUser } from "../models/User";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const stripeInstance = new Stripe(process.env.STRIPE_KEY_TEST!, {
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
    const userId = req.body.userId; // Assume userId is sent in the request body
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
    } catch (error: any) {
      res.status(500).send(error.message);
      console.log(error, "error here");
    }
  },

  webhookHandler: async (req: Request, res: Response) => {
    let data = "";

    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", async () => {
      const sigHeader = req.headers["stripe-signature"] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST;

      if (!sigHeader) {
        console.error("Webhook Error: Invalid signature header");
        res.status(400).send(`Webhook Error: Invalid signature header`);
        return;
      }

      let event;

      try {
        event = stripeInstance.webhooks.constructEvent(
          data,
          sigHeader,
          endpointSecret!
        );
      } catch (err: any) {
        console.error("Webhook Error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      console.log("✅ Success:", event.id);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        // Assume user ID is stored in metadata.userId when the Stripe session was created
        const userId = session?.metadata?.userId;
        console.log("Event received:", event);
        console.log("User ID:", userId);

        if (!userId) {
          console.error("Webhook Error: User ID not found");
          res.status(400).send("Webhook Error: User ID not found");
          return;
        }

        try {
          const user = await User.findByIdAndUpdate(
            userId,
            { subscription: "plus" },
            { new: true }
          );
          if (!user) {
            console.error("User not found with ID:", userId);
            res.status(404).send("User not found");
            return;
          }
          console.log("User update result:", user);
          res.status(200).send("Session was successful!");
        } catch (updateErr: any) {
          console.error("Database Update Error:", updateErr);
          res.status(500).send(`Database Update Error: ${updateErr.message}`);
        }

        return;
      }

      // Optionally handle other event types
      console.log("Unhandled event type");
      res.status(200).send("Unhandled event type");
    });
  },
};
