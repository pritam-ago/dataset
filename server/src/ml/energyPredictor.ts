import model from "./model.json" assert { type: "json" };

interface PredictInput {
  hour: number;
  day: number;
  applianceType: number;
  outdoorTemp: number;
  season: number;
  householdSize: number;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface EnergyPrediction {
  predictedEnergyKWh: number;
  riskLevel: RiskLevel;
}

export function predictEnergy(input: PredictInput): EnergyPrediction {
  const features: number[] = [
    input.hour,
    input.day,
    input.applianceType,
    input.outdoorTemp,
    input.season,
    input.householdSize,
  ];

  const weights = model.weights;
  const bias = model.bias;

  let prediction = bias;
  for (let i = 0; i < weights.length; i++) {
    prediction += weights[i] * features[i];
  }

  const predicted = Math.max(0, Number(prediction.toFixed(2)));

  const riskLevel: RiskLevel =
    predicted > 3 ? "HIGH" : predicted > 1.5 ? "MEDIUM" : "LOW";

  return {
    predictedEnergyKWh: predicted,
    riskLevel,
  };
}
