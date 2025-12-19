/* eslint-disable @typescript-eslint/no-explicit-any */

type Room = {
  id: string;
  name: string;
};

type Device = {
  id: string;
  name: string;
  type: string;
  roomId: string;
  state: "ON" | "OFF";
  settings?: {
    temperature?: number;
  };
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

/* ---------- Helper ---------- */
function computeRisk(value: number): "LOW" | "MEDIUM" | "HIGH" {
  if (value > 4) return "HIGH";
  if (value > 2) return "MEDIUM";
  return "LOW";
}

export default async function DashboardPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE!;
  if (!API) throw new Error("NEXT_PUBLIC_API_BASE not set");

  /* ---------- Fetch data ---------- */
  const homeRes = await fetch(`${API}/api/user-dashboard`, {
    cache: "no-store",
  });
  if (!homeRes.ok) throw new Error("Failed to fetch home state");

  const { rooms, devices }: { rooms: Room[]; devices: Device[] } =
    await homeRes.json();

  const predRes = await fetch(`${API}/api/prediction-adjusted`, {
    cache: "no-store",
  });
  if (!predRes.ok) throw new Error("Failed to fetch prediction");

  const prediction: AdjustedPrediction = await predRes.json();

  const weatherRes = await fetch(`${API}/api/weather`, {
    cache: "no-store",
  });
  if (!weatherRes.ok) throw new Error("Failed to fetch weather");

  const weather: Weather = await weatherRes.json();

  const risk = computeRisk(prediction.adjusted);

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          HomeGenie AI
        </h1>
        <p className="text-sm text-gray-500">
          AI-powered, context-aware home automation
        </p>
      </header>

      {/* TOP CARDS */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Energy Prediction */}
        <div className="rounded-xl border bg-purple-50 p-4 shadow-sm">
          <h2 className="flex items-center text-lg font-semibold text-black">
            Energy Prediction
            <span className="ml-2 rounded-full bg-purple-200 px-2 py-0.5 text-xs font-semibold text-purple-800">
              AI
            </span>
          </h2>

          <p className="mt-2 text-sm text-black">
            Next hour usage:{" "}
            <strong>{prediction.adjusted} kWh</strong>
          </p>

          <span
            className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${
              risk === "HIGH"
                ? "bg-red-100 text-red-700"
                : risk === "MEDIUM"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            Risk: {risk}
          </span>

          <p className="mt-2 text-xs text-gray-600">
            Indoor temp: {prediction.temperature.toFixed(1)}°C •{" "}
            {prediction.occupancy ? "Occupied" : "Empty"}
          </p>
        </div>

        {/* Weather */}
        <div className="rounded-xl border bg-blue-50 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-black">
            Weather Context
          </h2>
          <p className="mt-2 text-sm text-black">
            Outside temperature:{" "}
            <strong>{weather.outsideTemp}°C</strong>
          </p>
          <p className="text-sm text-gray-600">
            Condition: {weather.condition}
          </p>
        </div>
      </section>

      {/* ROOMS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Rooms</h2>

        {rooms.map(room => {
          const roomDevices = devices.filter(
            d => d.roomId === room.id
          );

          return (
            <div
              key={room.id}
              className="rounded-xl border bg-white/70 p-4 shadow-sm"
            >
              <h3 className="mb-3 text-lg font-semibold text-black">
                {room.name}
              </h3>

              {roomDevices.length === 0 && (
                <p className="text-sm text-black">
                  No devices in this room
                </p>
              )}

              <div className="space-y-2">
                {roomDevices.map(device => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-black"
                  >
                    <span className="font-medium">
                      {device.name}
                    </span>

                    <span
                      className={`font-semibold ${
                        device.state === "ON"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {device.state}
                      {device.settings?.temperature !== undefined &&
                        ` • ${device.settings.temperature}°C`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
