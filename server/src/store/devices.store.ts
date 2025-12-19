import type { Device } from "../models/device.model.js";

export const devices: Device[] = [
  {
    id: "light-hall",
    name: "Hall Light",
    type: "LIGHT",
    roomId: "hall",
    state: "OFF",
  },
  {
    id: "ac-bed1",
    name: "Bedroom 1 AC",
    type: "AC",
    roomId: "bed1",
    state: "OFF",
    settings: { temperature: 24 },
  },
  {
    id: "light-kitchen",
    name: "Kitchen Light",
    type: "LIGHT",
    roomId: "kitchen",
    state: "OFF",
  },
  {
    id: "fan-hall",
    name: "Hall Fan",
    type: "FAN",
    roomId: "hall",
    state: "OFF",
  },
];
