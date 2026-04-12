import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { stripeWebhookHandler } from "./controllers/stripeWebhookController";
import { testConnection } from "./db/client";

dotenv.config();

const app = express();

app.post("/api/stripe/webhook", bodyParser.raw({ type: "application/json" }), stripeWebhookHandler);

app.use(express.json());

app.get("/api/health", async (req, res) => {
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
