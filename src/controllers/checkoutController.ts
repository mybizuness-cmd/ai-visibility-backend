
import { Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Test Purchase",
            },
            unit_amount: 100
          },
          quantity: 1
        }
      ],
      success_url: "https://aiagenticauthority.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://aiagenticauthority.com/cancel"
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("createCheckoutSession error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};
