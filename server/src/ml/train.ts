import fs from "node:fs";
import path from "node:path";

type ApplianceType =
  | "Fridge"
  | "Microwave"
  | "Dishwasher"
  | "Oven"
  | "Air Conditioning"
  | "Heater";

type Season = "Winter" | "Fall" | "Spring" | "Summer";

interface Sample {
  features: number[];
  label: number;
}

const applianceMap: Record<ApplianceType, number> = {
  Fridge: 0,
  Microwave: 1,
  Dishwasher: 2,
  Oven: 3,
  "Air Conditioning": 4,
  Heater: 5,
};

const seasonMap: Record<Season, number> = {
  Winter: 0,
  Fall: 1,
  Spring: 2,
  Summer: 3,
};

function isApplianceType(v: string): v is ApplianceType {
  return Object.prototype.hasOwnProperty.call(applianceMap, v);
}

function isSeason(v: string): v is Season {
  return Object.prototype.hasOwnProperty.call(seasonMap, v);
}

function parseHour(time: string): number {
  // Expected format: "HH:MM"
  const parts = time.split(":");
  const hh = Number(parts[0]);
  if (!Number.isFinite(hh) || hh < 0 || hh > 23) return 0;
  return hh;
}

function safeNumber(value: string, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Minimal CSV parser that supports quoted fields.
 * (Handles cases like "Air Conditioning" with space; also handles commas if quoted.)
 */
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // toggle quote mode, but allow escaped quotes ""
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur.trim());
  return out;
}

function loadCSV(csvPath: string): Sample[] {
  const file = fs.readFileSync(csvPath, "utf-8");

  if (!file) {
    throw new Error("CSV file is empty or unreadable");
  }

  const lines = file.split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error("CSV file does not contain enough rows");
  }

  const headerLine = lines[0];
  if (!headerLine) {
    throw new Error("CSV header line missing");
  }

  const header = splitCSVLine(headerLine);
  const samples: Sample[] = [];

  const idx = (name: string): number => header.indexOf(name);

  const iAppliance = idx("Appliance Type");
  const iEnergy = idx("Energy Consumption (kWh)");
  const iTime = idx("Time");
  const iDate = idx("Date");
  const iOutdoor = idx("Outdoor Temperature (°C)");
  const iSeason = idx("Season");
  const iHousehold = idx("Household Size");

  if (
    iAppliance === -1 ||
    iEnergy === -1 ||
    iTime === -1 ||
    iDate === -1 ||
    iOutdoor === -1 ||
    iSeason === -1 ||
    iHousehold === -1
  ) {
    throw new Error("CSV missing required columns");
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue; // <-- FIX: guard undefined

    const cols = splitCSVLine(line);
    if (cols.length !== header.length) continue;

    const applianceRaw = cols[iAppliance];
    const seasonRaw = cols[iSeason];

    if (!applianceRaw || !seasonRaw) continue;
    if (!isApplianceType(applianceRaw)) continue;
    if (!isSeason(seasonRaw)) continue;

    const energy = safeNumber(cols[iEnergy] ?? "");
    if (!Number.isFinite(energy)) continue;

    const hour = parseHour(cols[iTime] ?? "0:00");
    const dayOfWeek = new Date(cols[iDate] ?? "").getDay();

    const outdoorTemp = safeNumber(cols[iOutdoor] ?? "");
    const householdSize = safeNumber(cols[iHousehold] ?? "", 1);

    samples.push({
      features: [
        hour,
        Number.isFinite(dayOfWeek) ? dayOfWeek : 0,
        applianceMap[applianceRaw],
        outdoorTemp,
        seasonMap[seasonRaw],
        householdSize,
      ],
      label: energy,
    });
  }

  return samples;
}


function trainLinearRegression(data: Sample[]): { weights: number[]; bias: number } {
  // ✅ HARD GUARANTEE for TypeScript + runtime
  if (data.length === 0) {
    throw new Error("Training data is empty. Cannot train model.");
  }

  const firstSample = data[0];
  if (!firstSample || firstSample.features.length === 0) {
    throw new Error("Invalid training sample structure.");
  }

  const featureCount: number = firstSample.features.length;

  // ✅ TS now knows weights is number[]
  const weights: number[] = Array.from(
    { length: featureCount },
    () => 0
  );

  let bias: number = 0;

  const learningRate: number = 0.0001;
  const epochs: number = 800;

  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const row of data) {
      // Defensive check (keeps TS & runtime happy)
      if (row.features.length !== featureCount) continue;

      let prediction = bias;
      for (let i = 0; i < featureCount; i++) {
        const feature = row.features[i];
        const weight = weights[i];
        if (feature !== undefined && weight !== undefined) {
          prediction += feature * weight;
        }
      }

      const error = prediction - row.label;

      for (let i = 0; i < featureCount; i++) {
        const feature = row.features[i];
        const weight = weights[i];
        if (feature !== undefined && weight !== undefined) {
          weights[i] = weight - learningRate * error * feature;
        }
      }

      bias -= learningRate * error;
    }
  }

  return { weights, bias };
}


// ---------- RUN TRAINING ----------
const csvPath = path.resolve(process.cwd(), "data", "energy.csv"); // server/data/energy.csv
const outPath = path.resolve(process.cwd(), "src", "ml", "model.json");

const data = loadCSV(csvPath);
const model = trainLinearRegression(data);

fs.writeFileSync(outPath, JSON.stringify(model, null, 2), "utf-8");
console.log(`✅ Trained on ${data.length} samples`);
console.log(`✅ Saved model to: ${outPath}`);
