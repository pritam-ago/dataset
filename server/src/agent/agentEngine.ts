import { devices } from "../store/devices.store";
import { sensors } from "../store/sensors.store";
import { predictEnergy } from "../ml/energyPredictor";
import { AgentDecision } from "../models/agent.model";
import { agentLogs } from "../store/agentLog.store";
import { getWeather } from "../services/weather.service";

// -------------------- Encoders --------------------
const applianceEncoding: Record<string, number> = {
  LIGHT: 0,
  FAN: 1,
  DISHWASHER: 2,
  OVEN: 3,
  AC: 4,
  HEATER: 5,
};

const seasonEncoding: Record<string, number> = {
  Winter: 0,
  Fall: 1,
  Spring: 2,
  Summer: 3,
};

// -------------------- Agent --------------------
export async function runAgent(): Promise<AgentDecision[]> {
  const decisions: AgentDecision[] = [];
  const weather = await getWeather();

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const outdoorTemp = weather.outsideTemp;
  const season: keyof typeof seasonEncoding = "Summer";
  const householdSize = 3;

  for (const device of devices) {
    if (device.manualOverride) continue;

    const sensor = sensors.find(s => s.roomId === device.roomId);
    if (!sensor) continue;

    // ---------- ML BASE PREDICTION ----------
    const basePrediction = predictEnergy({
      hour,
      day,
      applianceType: applianceEncoding[device.type],
      outdoorTemp,
      season: seasonEncoding[season],
      householdSize,
    });

    // ---------- OPTION B: SENSOR-AWARE ADJUSTMENT ----------
    let adjustedEnergy = basePrediction.predictedEnergyKWh;

    // Indoor temperature effect (comfort baseline = 26°C)
    const tempDelta = sensor.temperature - 26;
    adjustedEnergy += tempDelta * 0.12;

    // Occupancy effect
    if (!sensor.occupancy) {
      adjustedEnergy -= 0.4;
    }

    // Safety clamp
    adjustedEnergy = Math.max(0.5, Number(adjustedEnergy.toFixed(2)));

    // Recompute risk from adjusted value
    const adjustedRisk =
      adjustedEnergy > 4
        ? "HIGH"
        : adjustedEnergy > 2
        ? "MEDIUM"
        : "LOW";

    // ---------- SAFETY RULE ----------
    if (
      device.type === "AC" &&
      sensor.occupancy &&
      sensor.temperature > 32
    ) {
      if (device.state === "OFF") {
        device.state = "ON";
        decisions.push({
          deviceId: device.id,
          action: "TURN_ON",
          reason: "High temperature and room occupied (safety rule)",
        });
      }
      continue;
    }

    // ---------- EFFICIENCY RULE ----------
    if (!sensor.occupancy && device.state === "ON") {
      device.state = "OFF";
      decisions.push({
        deviceId: device.id,
        action: "TURN_OFF",
        reason: "Room empty (efficiency rule)",
      });
      continue;
    }

    // ---------- WEATHER-AWARE RULE ----------
    if (
      device.type === "AC" &&
      outdoorTemp < 26 &&
      device.state === "ON"
    ) {
      device.state = "OFF";
      decisions.push({
        deviceId: device.id,
        action: "TURN_OFF",
        reason: "Cool outdoor temperature detected",
      });
      continue;
    }

    // ---------- ML-GUIDED OPTIMIZATION ----------
    if (
      device.type === "AC" &&
      adjustedRisk === "HIGH" &&
      device.settings?.temperature !== undefined
    ) {
      device.settings.temperature += 1;
      decisions.push({
        deviceId: device.id,
        action: "INCREASE_TEMP",
        reason: `High adjusted energy prediction (${adjustedEnergy} kWh)`,
      });
    }
  }

  agentLogs.push(...decisions);
  return decisions;
}
