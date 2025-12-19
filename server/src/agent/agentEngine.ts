import { devices } from "../store/devices.store";
import { sensors } from "../store/sensors.store";
import { predictEnergy } from "../ml/energyPredictor";
import { AgentDecision } from "../models/agent.model";
import { agentLogs } from "../store/agentLog.store";
import { getWeather } from "../services/weather.service";

// Encoders
const applianceEncoding: Record<string, number> = {
  LIGHT: 0,
  FAN: 1,
  DISHWASHER: 2,
  OVEN: 3,
  AC: 4,
  HEATER: 5,
};

export async function runAgent(): Promise<AgentDecision[]> {
  const decisions: AgentDecision[] = [];
  const weather = await getWeather();

  const hour = new Date().getHours();
  const day = new Date().getDay();

  for (const device of devices) {
    // 🔴 DO NOT skip manual override completely
    // We still allow AI to recommend, but not force
    const sensor = sensors.find(s => s.roomId === device.roomId);
    if (!sensor) continue;

    // ---------- ML BASELINE ----------
    const base = predictEnergy({
      hour,
      day,
      applianceType: applianceEncoding[device.type],
      outdoorTemp: weather.outsideTemp,
      season: 3,
      householdSize: 3,
    });

    let adjustedEnergy = base.predictedEnergyKWh;
    adjustedEnergy += (sensor.temperature - 26) * 0.2;
    if (!sensor.occupancy) adjustedEnergy -= 0.6;
    adjustedEnergy = Math.max(0.6, Number(adjustedEnergy.toFixed(2)));

    const risk =
      adjustedEnergy > 4 ? "HIGH" :
      adjustedEnergy > 2 ? "MEDIUM" :
      "LOW";

    /* ===============================
       🔥 DEMO-SAFE DECISIONS
       =============================== */

    // 1️⃣ If room occupied → device ON
    if (sensor.occupancy && device.state === "OFF") {
      if (!device.manualOverride) {
        device.state = "ON";
      }

      decisions.push({
        deviceId: device.id,
        action: "TURN_ON",
        reason: "Room occupied (AI activation rule)",
      });
      continue;
    }

    // 2️⃣ If room empty → device OFF
    if (!sensor.occupancy && device.state === "ON") {
      if (!device.manualOverride) {
        device.state = "OFF";
      }

      decisions.push({
        deviceId: device.id,
        action: "TURN_OFF",
        reason: "Room empty (AI efficiency rule)",
      });
      continue;
    }

    // 3️⃣ High energy → optimize AC temperature
    if (
      device.type === "AC" &&
      device.state === "ON" &&
      risk === "HIGH" &&
      device.settings?.temperature
    ) {
      device.settings.temperature += 1;

      decisions.push({
        deviceId: device.id,
        action: "INCREASE_TEMP",
        reason: `High predicted energy (${adjustedEnergy} kWh)`,
      });
    }
  }

  agentLogs.push(...decisions);
  return decisions;
}
