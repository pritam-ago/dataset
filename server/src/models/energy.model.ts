export default interface EnergyReading {
  timestamp: number;
  deviceId?: string;
  roomId?: string;
  energyKWh: number;
}
