export type DeviceType = "LIGHT" | "FAN" | "AC";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  roomId: string;
  state: "ON" | "OFF";
  settings?: {
    temperature?: number;
    brightness?: number;
    speed?: number;
  };
  manualOverride?: boolean;
}
