import { sensors } from "../store/sensors.store";
import { devices } from "../store/devices.store";
import { getWeather } from "./weather.service";

export async function simulateSensors() {
  const weather = await getWeather();

  for (const sensor of sensors) {
    const ac = devices.find(
      d => d.roomId === sensor.roomId && d.type === "AC"
    );

    // Occupancy flip (demo-friendly)
    if (Math.random() < 0.4) {
      sensor.occupancy = !sensor.occupancy;
    }

    // Temperature behavior
    if (ac?.state === "ON") {
      sensor.temperature -= 0.6;
    } else if (sensor.occupancy) {
      sensor.temperature += 0.4;
    }

    // Pull toward outdoor temp
    sensor.temperature +=
      (weather.outsideTemp - sensor.temperature) * 0.2;

    sensor.temperature = Math.max(22, Math.min(40, sensor.temperature));
    sensor.timestamp = Date.now();
  }
}
