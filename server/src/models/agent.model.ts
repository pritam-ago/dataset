export type AgentMode = "NORMAL" | "ENERGY_SAVER" | "AWAY" | "NIGHT";

export interface AgentDecision {
  deviceId: string;
  action: string;
  reason: string;
}
