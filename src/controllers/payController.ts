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
  webhookHandler: async (req: Request, res: Response) => {
    let data = "";

    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", async () => {
      const sigHeader = req.headers["stripe-signature"] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sigHeader) {
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
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      console.log("✅ Success:", event.id);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as StripeSession;

        // Assume user ID is stored in metadata.userId when the Stripe session was created
        const userId = session.metadata.userId;

        if (!userId) {
          res.status(400).send("Webhook Error: User ID not found");
          return;
        }

        const user = await User.findByIdAndUpdate(
          userId,
          { subscription: "plus" },
          { new: true }
        );

        res.status(200).send("Session was successful!");
        return;
      }

      res.status(200);
    });
  },
};

// Your route definition remains the same
