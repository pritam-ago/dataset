import { Router } from "express";
import { rooms } from "../store/rooms.store.js";
import { devices } from "../store/devices.store.js";
import { runAgent } from "../agent/agentEngine.js";

const router = Router();

router.get("/user-dashboard", (_req, res) => {
  res.json({ rooms, devices });
});

// router.post("/run-agent", (_req, res) => {
//   const decisions = runAgent();
//   res.json({ decisions });
// });

export default router;
