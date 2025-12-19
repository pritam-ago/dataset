import { SensorState } from "../models/sensor.model";

export const sensors: SensorState[] = [
  {
    roomId: "hall",
    temperature: 30,
    occupancy: false,
    timestamp: Date.now(),
  },
  {
    roomId: "bed1",
    temperature: 32,
    occupancy: true,
    timestamp: Date.now(),
  },
];
