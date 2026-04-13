import "./style.css";

const html = String.raw;
document.querySelector<HTMLDivElement>("#app")!.innerHTML = html`
  <main>
    <h1>Local Weather App</h1>
    <div class="card">
      <img
        src="https://cdn.freecodecamp.org/weather-icons/04d.png"
        alt="weather"
        class="weather-icon"
      />
      <div class="data-key">
        <p>Location</p>
        <p>Weather</p>
        <p>Temperature</p>
      </div>
      <div class="data-value">
        <p class="location">: unknown</p>
        <p class="weather">: unknown</p>
        <p class="temp">: unknown</p>
      </div>
    </div>
    <div class="error-message"></div>
  </main>
`;

// Interface
interface WeatherData {
  name: string;
  weather: { main: string; icon: string }[];
  main: { temp: number };
}

// Get Element
const locationEl = document.querySelector<HTMLParagraphElement>(".location");
const weatherEl = document.querySelector<HTMLParagraphElement>(".weather");
const weatherIcon = document.querySelector<HTMLImageElement>(".weather-icon");
const tempEl = document.querySelector<HTMLParagraphElement>(".temp");
const errorEl = document.querySelector<HTMLDivElement>(".error-message");

// Create States
let currentTempCelsius = 0;
let isCelsius = true;

// Function to Get Location
function getLocation() {
  if (!navigator.geolocation) {
    updateUIError("Browser tidak mendukung Geolocation.");
    return;
  }
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

// Get Location on Load
document.addEventListener("DOMContentLoaded", getLocation);

// On Success Getting Location
function onSuccess(position: GeolocationPosition) {
  const lat = position.coords.latitude.toFixed(3);
  const lon = position.coords.longitude.toFixed(3);
  
  fetchWeather(lat, lon)
    .then((data: WeatherData) => {
      if (locationEl && weatherEl && weatherIcon && tempEl) {
        locationEl.textContent = `: ${data.name}`;
        weatherEl.textContent = `: ${data.weather[0].main}`;
        weatherIcon.src = data.weather[0].icon;
        
        // Simpan ke state, lalu render
        currentTempCelsius = data.main.temp;
        isCelsius = true;
        renderTemperature();
      }
    })
    .catch((error) => {
      updateUIError("Failed to load Weather API.");
      console.error(error);
    });
}

// On Error Getting Location
function onError(error: GeolocationPositionError) {
  updateUIError("Access Denied. Unable to retrieve location.");
  console.error(error.message);
}

// UI Feedback on error
function updateUIError(message: string) {
  if (errorEl) {
    errorEl.textContent = `${message}`;
    errorEl.style.color = "var(--my-red)";
  }
}

// Function to render temperature state
function renderTemperature() {
  if (!tempEl) return;
  if (currentTempCelsius === 0) return;
  if (isCelsius) {
    tempEl.textContent = `: ${currentTempCelsius.toFixed(1)}°C`;
  } else {
    const tempFahrenheit = (currentTempCelsius * 9) / 5 + 32;
    tempEl.textContent = `: ${tempFahrenheit.toFixed(1)}°F`;
  }
}

// Function to fetch Weather API
async function fetchWeather(lat: string, lon: string): Promise<WeatherData> {
  const url = `https://weather-proxy.freecodecamp.rocks/api/current?lat=${lat}&lon=${lon}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch Weather API");
  return response.json();
}

// Event listener menjadi sangat bersih, murni logika bisnis
if (tempEl) {
  tempEl.addEventListener("click", () => {
    isCelsius = !isCelsius; // Toggle state
    renderTemperature();    // Render ulang layar
  });  
}