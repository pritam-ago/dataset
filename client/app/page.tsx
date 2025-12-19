import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-6">
      <div className="w-full max-w-3xl rounded-2xl border bg-white p-10 shadow-xl">
        {/* HEADER */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            HomeGenie AI
          </h1>
          <p className="mt-3 text-gray-600">
            Predictive, explainable, and context-aware home automation
          </p>
        </header>

        {/* BUTTONS */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* USER DASHBOARD */}
          <Link
            href="/dashboard"
            className="group rounded-xl border bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              User Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              View rooms, devices, and AI-predicted energy usage
            </p>

            <span className="mt-4 inline-block rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              View Only
            </span>
          </Link>

          {/* CONTROL DASHBOARD */}
          <Link
            href="/control"
            className="group rounded-xl border bg-purple-50 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Control Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Inspect AI decisions, run agent, and override devices
            </p>

            <span className="mt-4 inline-block rounded-lg bg-purple-200 px-4 py-2 text-sm font-semibold text-purple-800">
              Admin / AI Control
            </span>
          </Link>
        </section>

        {/* FOOTER NOTE */}
        <footer className="mt-10 text-center text-xs text-gray-400">
          Built with Machine Learning, Sensors, and Explainable AI
        </footer>
      </div>
    </main>
  );
}
