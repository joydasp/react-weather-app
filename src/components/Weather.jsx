import React, { useState, useEffect } from "react";

const API_KEY = "8ca89add10144e5765ec7e6f954d6c93";

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Runs ONCE when component loads
  useEffect(() => {
    setCity("Visakhapatnam");
  }, []);

  // ✅ Runs whenever city changes
  useEffect(() => {
  if (!city) return;

  const timer = setTimeout(() => {
    getWeather();
  }, 800); // wait 800ms after typing stops

  return () => clearTimeout(timer);
}, [city]);

const toggleTheme = () => {
  setDarkMode(prev => !prev);
};

  const getWeather = async () => {
    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}&units=metric`
      );

      const data = await res.json();

      if (!res.ok) {
        setError("City not found ❌");
        setLoading(false);
        return;
      }

      setWeather(data);
      getForecast(data.name);

      setLoading(false);
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const getForecast = async (cityName) => {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName},IN&appid=${API_KEY}&units=metric`
    );

    const data = await res.json();

    if (!res.ok) return;

    // Pick one forecast per day (around noon)
    const dailyForecast = data.list.filter(item =>
      item.dt_txt.includes("12:00:00")
    );

    setForecast(dailyForecast);
  } catch (err) {
    console.log("Forecast error");
  }
};

  const getCurrentLocationWeather = () => {
  if (!navigator.geolocation) {
    setError("Geolocation not supported");
    return;
  }

  setLoading(true);
  setError("");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );

        const data = await res.json();

        if (!res.ok) {
          setError("Unable to fetch location weather");
          setLoading(false);
          return;
        }

        setWeather(data);
        setCity(data.name); // update city input automatically
        setLoading(false);
      } catch (err) {
        setError("Something went wrong");
        setLoading(false);
      }
    },
    () => {
      setError("Location permission denied ❌");
      setLoading(false);
    }
  );
};

  return (
    
    <div className={`weather-box ${darkMode ? "dark" : "light"}`}>
        <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h2>🌦️ Weather App</h2>

      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <p style={{ fontSize: "12px" }}>Type a city name</p>

      <button onClick={getCurrentLocationWeather}>
        📍 Use Current Location
      </button>     

      {loading && <p>Loading... ⏳</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="result">
          <h3>{weather.name}</h3>

          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="weather icon"
          />

          <p>🌡️ Temp: {weather.main.temp} °C</p>
          <p>☁️ Condition: {weather.weather[0].description}</p>
          <p>💧 Humidity: {weather.main.humidity}%</p>
          <p>💨 Wind: {weather.wind.speed} m/s</p>
        </div>
      )}
              {forecast.length > 0 && (
          <div className="forecast">
            <h3>📅 5-Day Forecast</h3>

            <div className="forecast-list">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-card">
                  <p>{new Date(day.dt_txt).toDateString()}</p>

                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt="icon"
                  />

                  <p>{day.main.temp} °C</p>
                  <p>{day.weather[0].main}</p>
                </div>
              ))}
            </div>
          </div>
        )}

    </div>
    
  );
}

export default Weather;
