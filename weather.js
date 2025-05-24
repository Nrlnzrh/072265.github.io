const apiKey = '2e3467b75d9bcd53ea5fd5264ad9012d';

const stateCapitals = {
  "Johor": "Johor Bahru",
  "Kedah": "Alor Setar",
  "Kelantan": "Kota Bharu",
  "Melaka": "Melaka",
  "Negeri Sembilan": "Seremban",
  "Pahang": "Kuantan",
  "Perak": "Ipoh",
  "Perlis": "Kangar",
  "Pulau Pinang": "George Town",
  "Sabah": "Kota Kinabalu",
  "Sarawak": "Kuching",
  "Selangor": "Shah Alam",
  "Terengganu": "Kuala Terengganu",
  "Kuala Lumpur": "Kuala Lumpur",
  "Labuan": "Labuan",
  "Putrajaya": "Putrajaya"
};

const stateSelect = document.getElementById("stateSelect");
const tempSpan = document.getElementById("temp");
const windSpeedSpan = document.getElementById("windSpeed");
const conditionSpan = document.getElementById("condition");

const ctx = document.getElementById("tempChart").getContext("2d");

let tempChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Temperature (°C)",
      data: [],
      borderColor: "#3a6df0",
      backgroundColor: "rgba(58, 109, 240, 0.1)",
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: value => value + "°C",
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
});

stateSelect.addEventListener("change", () => {
  const state = stateSelect.value;
  if (!state) {
    clearDisplay();
    return;
  }
  const city = stateCapitals[state];
  fetchWeather(city);
});

async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== "200") {
      alert("City not found. Please try again.");
      clearDisplay();
      return;
    }

    const current = data.list[0];
    updateCurrentWeather({
      temp: current.main.temp,
      windSpeed: current.wind.speed,
      condition: current.weather[0].description
    });

    const labels = data.list.slice(0, 10).map(item => formatLabel(item.dt_txt));
    const temps = data.list.slice(0, 10).map(item => item.main.temp);

    updateChart(labels, temps);

  } catch (error) {
    alert("Error fetching weather data. Check console.");
    console.error(error);
    clearDisplay();
  }
}

function updateCurrentWeather(weather) {
  if (!weather) {
    tempSpan.textContent = "--";
    windSpeedSpan.textContent = "--";
    conditionSpan.textContent = "--";
    return;
  }

  tempSpan.textContent = weather.temp.toFixed(1);
  windSpeedSpan.textContent = (weather.windSpeed * 3.6).toFixed(1); // m/s to km/h
  conditionSpan.textContent = capitalizeWords(weather.condition);
}

function updateChart(labels, data) {
  tempChart.data.labels = labels;
  tempChart.data.datasets[0].data = data;
  tempChart.update();
}

function clearDisplay() {
  tempSpan.textContent = "--";
  windSpeedSpan.textContent = "--";
  conditionSpan.textContent = "--";
  tempChart.data.labels = [];
  tempChart.data.datasets[0].data = [];
  tempChart.update();
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function formatLabel(dateTimeStr) {
  const date = new Date(dateTimeStr);
  const options = { weekday: 'short', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleString('en-MY', options);
}

window.addEventListener('load', () => {
  const initialState = stateSelect.value;
  if (initialState) {
    fetchWeather(stateCapitals[initialState]);
  }
});
