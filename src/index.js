import "./styles.css";

const apiKey = "BLEV2DVWJZ7P6YWLNKQZR6KFC";

const app = document.getElementById("app");
const loadingEl = document.getElementById("loading");
const weatherResult = document.getElementById("weather-result");
const searchButton = document.getElementById("search-button");
const cityInput = document.getElementById("city-input");

async function getIconUrl(iconName) {
  if (!iconName) return null;

  try {
    const module = await import(`./icons/${iconName}.png`);
    return module.default;
  } catch (e) {
    console.warn("No icon for", iconName, e);
    return null;
  }
}

function getWeatherTheme(iconName) {
  if (!iconName) return "weather--default";

  const name = iconName.toLowerCase();

  if (name.includes("clear")) return "weather--clear";
  if (name.includes("cloud")) return "weather--cloudy";
  if (name.includes("rain")) return "weather--rain";
  if (name.includes("snow")) return "weather--snow";
  if (name.includes("thunder") || name.includes("storm")) return "weather--storm";
  if (name.includes("fog")) return "weather--fog";
  if (name.includes("wind")) return "weather--wind";

  return "weather--default";
}

function applyTheme(iconName) {
  const themeClass = getWeatherTheme(iconName);
  app.className = "app-root";
  app.classList.add(themeClass);
}

async function handleSearch() {
  const city = cityInput.value.trim();

  if (!city) {
    loadingEl.textContent = "";
    weatherResult.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  try {
    loadingEl.textContent = "Loading...";
    weatherResult.innerHTML = "";

    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
        city
      )}?unitGroup=metric&key=${apiKey}&contentType=json&iconSet=icons2`
    );

    if (!response.ok) {
      loadingEl.textContent = "";
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    loadingEl.textContent = "";

    const iconName = data.currentConditions.icon;
    const iconUrl = await getIconUrl(iconName);
    const iconHtml = iconUrl
      ? `<img class="weather-icon" src="${iconUrl}" alt="${iconName}" />`
      : "";

    applyTheme(iconName);

    weatherResult.innerHTML = `
      <h2>Weather in ${data.resolvedAddress}</h2>
      ${iconHtml}
      <div class="weather-main">${data.currentConditions.temp} °C</div>
      <div class="weather-sub">${data.currentConditions.conditions}</div>
      <p>Humidity: ${data.currentConditions.humidity}%</p>
      <p>Wind Speed: ${data.currentConditions.windspeed} km/h</p>
    `;
  } catch (error) {
    loadingEl.textContent = "";
    weatherResult.innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
  }
}

searchButton.addEventListener("click", handleSearch);

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

applyTheme(null);
