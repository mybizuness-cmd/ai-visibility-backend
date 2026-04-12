import { Request, Response } from "express";
import Stripe from "stripe";
import pool from "../db/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const stripeSessionId = session.id;
      const customerEmail =
        session.customer_details?.email || session.customer_email || null;
      const amountTotal = session.amount_total || 0;
      const currency = session.currency || null;
      const paymentStatus = session.payment_status || "unknown";

      await pool.query(
        `
        INSERT INTO payments (
          stripe_session_id,
          customer_email,
          amount_total,
          currency,
          payment_status
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (stripe_session_id) DO NOTHING
        `,
        [
          stripeSessionId,
          customerEmail,
          amountTotal,
          currency,
          paymentStatus,
        ]
      );

      if (customerEmail) {
        await pool.query(
          `
          INSERT INTO users (email, is_paid)
          VALUES ($1, true)
          ON CONFLICT (email)
          DO UPDATE SET is_paid = true
          `,
          [customerEmail]
        );
      }

      console.log("Payment saved:", stripeSessionId);
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err.message);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};
