import express from "express";
import dotenv from "dotenv";
import pool from "./db/client";
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
app.get("/api/user-status", async (req, res) => {
  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const result = await pool.query(
      "SELECT is_paid FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ is_paid: false });
    }

    return res.json({ is_paid: result.rows[0].is_paid });
  } catch (err: any) {
    console.error("user-status error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
