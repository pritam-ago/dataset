import { Router } from "express";
import { runAgent } from "../agent/agentEngine";
import { agentLogs } from "../store/agentLog.store";
import { devices } from "../store/devices.store";
import { getWeather } from "../services/weather.service";
import { predictEnergy } from "../ml/energyPredictor";
import { sensors } from "../store/sensors.store";

const router = Router();

router.post("/run-agent", async (_req, res) => {
  const decisions = await runAgent();
  res.json({ decisions });
});

router.get("/agent-logs", (_req, res) => {
  res.json(agentLogs.slice(-20));
});

router.get("/weather", async (_req, res) => {
  const weather = await getWeather();
  res.json(weather);
});

router.post("/override/:deviceId", (req, res) => {
  const device = devices.find(d => d.id === req.params.deviceId);
  if (!device) {
    return res.status(404).json({ error: "Device not found" });
  }

  device.state = device.state === "ON" ? "OFF" : "ON";
  device.manualOverride = true;

  res.json(device);
});

router.get("/sensors", (_req, res) => {
  res.json(sensors);
});

router.get("/prediction-adjusted", async (_req, res) => {
  const weather = await getWeather();
    const device = devices.find(d => d.type === "AC");
    if (!device) {
    return res.status(400).json({ error: "No AC device" });
    }

    const sensor = sensors.find(s => s.roomId === device.roomId);
    if (!sensor) {
    return res.status(400).json({ error: "No matching sensor" });
    }


  if (!sensor || !device) {
    return res.status(400).json({ error: "No sensor/device" });
  }

  const base = predictEnergy({
    hour: new Date().getHours(),
    day: new Date().getDay(),
    applianceType: 4,
    outdoorTemp: weather.outsideTemp,
    season: 3,
    householdSize: 3,
  });

  // Option B logic (same as agent)
  let adjusted = base.predictedEnergyKWh;
  adjusted += (sensor.temperature - 26) * 0.12;
  if (!sensor.occupancy) adjusted -= 0.4;
  adjusted = Math.max(0.5, Number(adjusted.toFixed(2)));

  res.json({
    base: base.predictedEnergyKWh,
    adjusted,
    temperature: sensor.temperature,
    occupancy: sensor.occupancy,
  });
});

router.get("/prediction", async (_req, res) => {
  const result = predictEnergy({
    hour: new Date().getHours(),
    day: new Date().getDay(),
    applianceType: 4,
    outdoorTemp: 30,
    season: 3,
    householdSize: 3,
  });

  res.json(result);
});


export default router;
