type Device = {
  id: string;
  name: string;
  state: string;
  temp?: number;
};

export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/devices`,
    { cache: "no-store" }
  );

  const devices: Device[] = await res.json();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Smart Home Dashboard</h1>

      <div className="space-y-3">
        {devices.map((d) => (
          <div
            key={d.id}
            className="border rounded-lg p-4 flex justify-between"
          >
            <span>{d.name}</span>
            <span>
              {d.state}
              {d.temp && ` • ${d.temp}°C`}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
