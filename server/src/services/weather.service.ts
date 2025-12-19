import { WeatherContext } from "../models/weather.model";

export async function getWeather(): Promise<WeatherContext> {
  const key = process.env.OPENWEATHER_API_KEY;

  // 🔹 If no API key → synthetic weather
  if (!key) {
    const hour = new Date().getHours();

    // Simple but realistic pattern
    let outsideTemp = 30;
    if (hour >= 12 && hour <= 16) outsideTemp = 36;
    if (hour >= 18 && hour <= 22) outsideTemp = 28;
    if (hour >= 0 && hour <= 6) outsideTemp = 24;

    return {
      outsideTemp,
      condition: "simulated",
      fetchedAt: Date.now(),
    };
  }

  throw new Error("Unable to fetch weather data");
}
