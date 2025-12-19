"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* -------------------- TYPES -------------------- */

type Device = {
  id: string;
  name: string;
  state: "ON" | "OFF";
  manualOverride?: boolean;
};

type Decision = {
  deviceId: string;
  action: string;
  reason: string;
};

type AdjustedPrediction = {
  base: number;
  adjusted: number;
  temperature: number;
  occupancy: boolean;
};

type Weather = {
  outsideTemp: number;
  condition: string;
};

type PredictionPoint = {
  time: string;
  value: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
};

/* -------------------- HELPERS -------------------- */

function computeRisk(value: number): "LOW" | "MEDIUM" | "HIGH" {
  if (value > 4) return "HIGH";
  if (value > 2) return "MEDIUM";
  return "LOW";
}

/* -------------------- PAGE -------------------- */

export default function ControlDashboard() {
  const API = process.env.NEXT_PUBLIC_API_BASE!;
  if (!API) throw new Error("NEXT_PUBLIC_API_BASE not set");

  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<Decision[]>([]);
  const [prediction, setPrediction] = useState<AdjustedPrediction | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [history, setHistory] = useState<PredictionPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<number | null>(null);

  /* -------------------- LOAD DATA -------------------- */

  const loadState = async () => {
    const home = await fetch(`${API}/api/user-dashboard`).then(r => r.json());
    setDevices(home.devices);

    const pred: AdjustedPrediction = await fetch(
      `${API}/api/prediction-adjusted`
    ).then(r => r.json());

    setPrediction(pred);

    setHistory(prev => {
      const next: PredictionPoint[] = [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          value: pred.adjusted,
          risk: computeRisk(pred.adjusted),
        },
      ];
      return next.slice(-20);
    });

    const weather = await fetch(`${API}/api/weather`).then(r => r.json());
    setWeather(weather);

    const logs = await fetch(`${API}/api/agent-logs`).then(r => r.json());
    setLogs(logs);
  };

  /* -------------------- ACTIONS -------------------- */

  const runAgent = async () => {
    setLoading(true);
    await fetch(`${API}/api/run-agent`, { method: "POST" });
    setLastRun(Date.now());
    await loadState();
    setLoading(false);
  };

  const toggleOverride = async (id: string) => {
    await fetch(`${API}/api/override/${id}`, { method: "POST" });
    await loadState();
  };

  /* -------------------- EFFECT -------------------- */

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 10_000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------- UI -------------------- */

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Control Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Administrative AI control & decision inspection
        </p>
      </header>

      {/* TOP PANELS */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* Agent */}
        <div className="rounded-xl border bg-purple-50 p-4 shadow-sm">
          <h2 className="flex items-center text-lg font-semibold text-black">
            AI Agent
            <span className="ml-2 rounded-full bg-purple-200 px-2 py-0.5 text-xs">
              AI
            </span>
          </h2>

          <button
            onClick={runAgent}
            disabled={loading}
            className="mt-3 w-full rounded bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {loading ? "Running..." : "▶ Run AI Agent"}
          </button>

          {lastRun && (
            <p className="mt-2 text-xs text-gray-600">
              Last run: {new Date(lastRun).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Prediction */}
        {prediction && (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="flex items-center text-lg font-semibold text-black">
              Energy Prediction
              <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs">
                ML + Sensors
              </span>
            </h2>

            <p className="mt-2 text-sm text-black">
              Next hour usage:{" "}
              <strong>{prediction.adjusted} kWh</strong>
            </p>

            <span
              className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${
                computeRisk(prediction.adjusted) === "HIGH"
                  ? "bg-red-100 text-red-700"
                  : computeRisk(prediction.adjusted) === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Risk: {computeRisk(prediction.adjusted)}
            </span>

            <p className="mt-2 text-xs text-gray-500">
              Indoor temp: {prediction.temperature.toFixed(1)}°C •{" "}
              {prediction.occupancy ? "Occupied" : "Empty"}
            </p>
          </div>
        )}

        {/* Weather */}
        {weather && (
          <div className="rounded-xl border bg-blue-50 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Weather Context</h2>
            <p className="mt-2 text-sm text-black">
              Outside: <strong>{weather.outsideTemp}°C</strong>
            </p>
            <p className="text-sm text-gray-600">
              Condition: {weather.condition}
            </p>
          </div>
        )}
      </section>

      {/* GRAPH */}
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center text-lg font-semibold text-black">
          Predicted Energy Trend
          <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs">
            AI
          </span>
        </h2>

        {history.length < 2 ? (
          <p className="text-sm text-gray-400">
            Run agent to generate trend
          </p>
        ) : (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis unit=" kWh" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* DEVICE OVERRIDES */}
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-black">
          Device Overrides (Human-in-the-loop)
        </h2>

        <div className="space-y-2">
          {devices.map(d => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-black">
                {d.name}
                {d.manualOverride && (
                  <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                    Manual
                  </span>
                )}
              </span>

              <button
                onClick={() => toggleOverride(d.id)}
                className={`rounded px-3 py-1 text-xs font-semibold ${
                  d.state === "ON"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {d.state}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* DECISION LOG */}
      <section className="rounded-xl border bg-gray-50 p-4 shadow-sm">
        <h2 className="mb-3 flex items-center text-lg font-semibold text-black">
          AI Decision Log
          <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs">
            AI
          </span>
        </h2>

        {logs.length === 0 && (
          <p className="text-sm text-gray-400">
            No AI decisions yet
          </p>
        )}

        <div className="space-y-2">
          {logs.map((log, i) => (
            <div
              key={i}
              className="rounded-md border bg-white px-3 py-2 text-sm"
            >
              <strong>{log.deviceId}</strong> → {log.action}
              <div className="text-xs text-gray-500">
                {log.reason}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
