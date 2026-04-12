import express from "express";
import dotenv from "dotenv";
import { stripeWebhookHandler } from "./controllers/stripeWebhookController";
import { testConnection } from "./db/client";

dotenv.config();

const app = express();

// Stripe webhook must use raw body FIRST
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.post('/api/stripe/webhook', stripeWebhookHandler);

// Normal JSON parsing only AFTER webhook setup
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ ok: true, status: "healthy" });
  } catch {
    res.status(500).json({ ok: false });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
