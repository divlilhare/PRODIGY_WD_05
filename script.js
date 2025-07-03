const apiKey = "curl --request GET --url 'https://api.tomorrow.io/v4/weather/forecast?location=42.3478,-71.0466&apikey=3t1KNDFi2xxMJiKeHNjVgzIRjIG1cT5O'"; // Replace with your OpenWeatherMap API key

// Elements
const errorEl = document.getElementById("error");
const currentWeatherEl = document.getElementById("currentWeather");
const forecastEl = document.getElementById("forecast");
const forecastContainer = document.getElementById("forecastContainer");
const themeToggleBtn = document.getElementById("theme-toggle");

// Fetch current weather by city name
async function getWeather(city) {
  clearError();
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    const data = await res.json();

    if (data.cod !== 200) {
      showError(data.message);
      return;
    }

    displayCurrentWeather(data);
    getForecast(data.coord.lat, data.coord.lon);
  } catch {
    showError("Failed to fetch weather data.");
  }
}

// Fetch current weather by geo location
function getWeatherByLocation() {
  clearError();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );
        const data = await res.json();

        if (data.cod !== 200) {
          showError(data.message);
          return;
        }

        displayCurrentWeather(data);
        getForecast(latitude, longitude);
      } catch {
        showError("Failed to fetch weather data.");
      }
    }, () => {
      showError("Geolocation permission denied.");
    });
  } else {
    showError("Geolocation not supported.");
  }
}

function getWeatherByInput() {
  const city = document.getElementById("locationInput").value.trim();
  if (city) getWeather(city);
}

// Display current weather
function displayCurrentWeather(data) {
  currentWeatherEl.classList.remove("hidden");
  forecastEl.classList.remove("hidden");
  errorEl.textContent = "";

  document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("description").textContent = capitalize(data.weather[0].description);
  document.getElementById("temperature").textContent = Math.round(data.main.temp);
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("wind").textContent = data.wind.speed;

  const iconCode = data.weather[0].icon;
  document.getElementById("icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  document.getElementById("icon").alt = data.weather[0].description;
}

// Fetch 5-day forecast from One Call API
async function getForecast(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`
    );
    const data = await res.json();

    displayForecast(data.daily);
  } catch {
    showError("Failed to fetch forecast data.");
  }
}

// Display 5-day forecast (skip today)
function displayForecast(daily) {
  forecastContainer.innerHTML = ""; // Clear previous forecast

  // Show next 5 days
  for (let i = 1; i <= 5; i++) {
    const day = daily[i];
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });

    const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    const tempMax = Math.round(day.temp.max);
    const tempMin = Math.round(day.temp.min);

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("forecast-day");
    dayDiv.innerHTML = `
      <div class="day-name">${dayName}</div>
      <img src="${iconUrl}" alt="${day.weather[0].description}" />
      <div class="temp">↑${tempMax}°C</div>
      <div class="temp">↓${tempMin}°C</div>
    `;
    forecastContainer.appendChild(dayDiv);
  }
}

// Error handling
function showError(msg) {
  errorEl.textContent = msg;
  currentWeatherEl.classList.add("hidden");
  forecastEl.classList.add("hidden");
}

function clearError() {
  errorEl.textContent = "";
}

// Capitalize first letter helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Dark/light mode toggle
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggleBtn.textContent = "☀️ Light Mode";
  } else {
    themeToggleBtn.textContent = "🌙 Dark Mode";
  }
});
