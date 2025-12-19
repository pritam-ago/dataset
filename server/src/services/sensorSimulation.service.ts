import { sensors } from "../store/sensors.store";
import { devices } from "../store/devices.store";
import { getWeather } from "./weather.service";

function isBedroom(roomId: string) {
  return roomId.startsWith("bed");
}

function isHall(roomId: string) {
  return roomId === "hall";
}

export async function simulateSensors() {
  const hour = new Date().getHours();
  const weather = await getWeather();

  for (const sensor of sensors) {
    // -------- Occupancy logic --------
    if (hour >= 22 || hour < 6) {
      sensor.occupancy = isBedroom(sensor.roomId);
    } else if (hour >= 6 && hour < 9) {
      sensor.occupancy = isBedroom(sensor.roomId);
    } else if (hour >= 9 && hour < 12) {
      sensor.occupancy = false;
    } else if (hour >= 12 && hour < 17) {
      sensor.occupancy = isHall(sensor.roomId);
    } else {
      sensor.occupancy = isHall(sensor.roomId) || isBedroom(sensor.roomId);
    }

    // -------- Temperature drift --------
    const ac = devices.find(
      d => d.roomId === sensor.roomId && d.type === "AC"
    );

    if (ac?.state === "ON") {
      sensor.temperature -= 0.3;
    } else if (sensor.occupancy) {
      sensor.temperature += 0.2;
    }

    // pull towards outdoor temperature slowly
    sensor.temperature += (weather.outsideTemp - sensor.temperature) * 0.05;

    // clamp realistic bounds
    sensor.temperature = Math.max(20, Math.min(40, sensor.temperature));

    sensor.timestamp = Date.now();
  }
}
