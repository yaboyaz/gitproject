const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const locateBtn = document.getElementById("locate-btn");
const statusEl = document.getElementById("status");
const locationEl = document.getElementById("location");
const updatedEl = document.getElementById("updated");
const tempEl = document.getElementById("temperature");
const summaryEl = document.getElementById("summary");
const apparentEl = document.getElementById("apparent");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const precipitationEl = document.getElementById("precipitation");

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff9b9b" : "var(--muted)";
}

function formatUpdatedTime(isoTime) {
  const date = new Date(isoTime);
  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

async function geocodeCity(city) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Could not reach the geocoding service.");
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("No results found. Try a nearby city or different spelling.");
  }

  return data.results[0];
}

async function fetchWeather(latitude, longitude, timezone, label) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "rain",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(",")
  );
  url.searchParams.set("timezone", timezone || "auto");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Weather service is unavailable right now.");
  }

  const data = await response.json();
  const current = data.current;
  if (!current) {
    throw new Error("Current conditions are missing from the response.");
  }

  const weatherLabel = WEATHER_CODES[current.weather_code] || "Current conditions";
  locationEl.textContent = label;
  updatedEl.textContent = `Updated ${formatUpdatedTime(current.time)}`;
  tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
  summaryEl.textContent = weatherLabel;
  apparentEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
  humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h · ${Math.round(
    current.wind_direction_10m
  )}°`;
  const precipAmount = (current.precipitation || current.rain || 0).toFixed(1);
  precipitationEl.textContent = `${precipAmount} mm`;
  showStatus("Weather updated.");
}

async function handleSearch(event) {
  event.preventDefault();
  const city = searchInput.value.trim();
  if (!city) return;
  showStatus("Looking up the city…");
  try {
    const place = await geocodeCity(city);
    const labelParts = [place.name, place.admin1, place.country].filter(Boolean);
    const label = labelParts.join(", ");
    await fetchWeather(place.latitude, place.longitude, place.timezone, label);
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
  }
}

function handleLocate() {
  if (!navigator.geolocation) {
    showStatus("Geolocation is unavailable in this browser.", true);
    return;
  }

  showStatus("Fetching your location…");
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        await fetchWeather(latitude, longitude, "auto", "Your location");
      } catch (error) {
        console.error(error);
        showStatus(error.message, true);
      }
    },
    (error) => {
      const message =
        error.code === error.PERMISSION_DENIED
          ? "Location permission denied. You can still search by city."
          : "Unable to fetch your location.";
      showStatus(message, true);
    }
  );
}

searchForm.addEventListener("submit", handleSearch);
locateBtn.addEventListener("click", handleLocate);
