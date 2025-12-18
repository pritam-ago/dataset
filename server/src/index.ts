import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "homegenie-server",
    time: new Date().toISOString(),
  });
});

app.get("/api/devices", (_req: Request, res: Response) => {
  res.json([
    { id: "light-1", name: "Living Room Light", state: "OFF" },
    { id: "ac-1", name: "Bedroom AC", state: "ON", temp: 24 },
  ]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
