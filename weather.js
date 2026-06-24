document.addEventListener("DOMContentLoaded", () => {
    let animationId = null;
    let particles = [];
    let lightningInterval = null;
    
    const API_KEY = "d260570b07a9da528903e742a0b45032";
    const searchInput = document.getElementById("search-city");
    const currentLocation = document.getElementById("current-location");
    const currentTemperature = document.getElementById("current-temperature");
    const currentDescription = document.getElementById("current-description");
    const feelsLike = document.getElementById("feels-like");
    const highTemp = document.getElementById("high-temp");
    const lowTemp = document.getElementById("low-temp");
    const humidity = document.getElementById("humidity");
    const windSpeed = document.getElementById("wind-speed");
    const aqiLevel = document.getElementById("aqi-level");
    const forecastContainer = document.getElementById("forecast-container");
    const yearSlider = document.getElementById("year-slider");
    const yearValue = document.getElementById("year-value");
    const predictBtn = document.getElementById("predict-btn");
    const climateResult = document.getElementById("climate-result");
    const loading = document.getElementById("loading");
    const themeToggle = document.getElementById("theme-toggle");
    
    let currentCity = "";
    let currentTemp = 0;

    // Consolidated single search event listener
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const city = searchInput.value.trim();
            if (city) getWeatherData(city);
        }
    });

    yearSlider.addEventListener("input", () => {
        yearValue.textContent = yearSlider.value;
    });

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
    });

    async function getWeatherData(city) {
        try {
            loading.style.display = "block";
            const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`; 
            const geoResponse = await fetch(geoURL); 
            const geoData = await geoResponse.json(); 
            
            if (geoData.length === 0) { 
                currentLocation.textContent = "City not found!";
                loading.style.display = "none"; // Fixed bug: hide loader on failure
                return;
            } 
            
            const { lat, lon, name, country } = geoData[0];
            currentLocation.textContent = `${name}, ${country}`; 
            currentCity = name;

            const [weatherResponse, aqiResponse, forecastResponse] = await Promise.all([
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
                fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
                fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
            ]);

            const weatherData = await weatherResponse.json(); 
            const aqiData = await aqiResponse.json(); 
            const forecastData = await forecastResponse.json(); 

            currentTemperature.textContent = `${Math.round(weatherData.main.temp)}°C`; 
            currentTemp = weatherData.main.temp;
            currentDescription.textContent = weatherData.weather[0].description;
            
            setWeather(weatherData.weather[0].main);

            feelsLike.textContent = `${Math.round(weatherData.main.feels_like)}`; 
            humidity.textContent = weatherData.main.humidity;
            windSpeed.textContent = weatherData.wind.speed; 
            highTemp.textContent = `${Math.round(weatherData.main.temp_max)}°C`; 
            lowTemp.textContent = `${Math.round(weatherData.main.temp_min)}°C`; 

            const aqiValue = aqiData.list[0].main.aqi;
            const aqiMap = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"};
            aqiLevel.textContent = `${aqiValue} (${aqiMap[aqiValue]})`;

            const currentWeatherIcon = document.getElementById("current-weather-icon");
            const currentIconCode = weatherData.weather[0].icon;
            if (currentWeatherIcon) {
                currentWeatherIcon.src = `https://openweathermap.org/img/wn/${currentIconCode}@4x.png`;
                currentWeatherIcon.alt = weatherData.weather[0].description;
            }

            const dailyForecast = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
            forecastContainer.innerHTML = "";

            dailyForecast.forEach(day => {
                const date = new Date(day.dt_txt);
                const dayName = date.toLocaleDateString("en-US", {weekday: "short"});
                const temp = Math.round(day.main.temp);
                const iconCode = day.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                const mainWeather = day.weather[0].main;
                const description = day.weather[0].description;

                const card = document.createElement("div");
                card.classList.add("forecast-card");
                card.innerHTML = `
                    <h3>${dayName}</h3>
                    <img src="${iconUrl}" alt="${description}">
                    <p>${temp}°C</p>
                    <p>${mainWeather}</p>
                    <small>${description}</small>
                `;
                forecastContainer.appendChild(card);
            });
        } catch (error) { 
            console.error("Error in fetching data:", error); 
            currentLocation.textContent = "Failed to load data";
        } finally {
            loading.style.display = "none";
        }
    }

    function predictClimate() {
        if (!currentCity) {
            alert("Please search for a city first");
            return;
        }
        const years = Number(yearSlider.value);
        const warmingRate = 0.18;
        const projectedTemp = currentTemp + (years / 10) * warmingRate;
        let impact = "";

        if (years <= 10) {
            impact = "Minor increase in average temperature. Summers may become slightly hotter.";
        } else if (years <= 25) {
            impact = "Noticeable warming. More frequent heatwaves and changing rainfall patterns.";
        } else {        
            impact = "Significant warming likely. Increased extreme weather events and longer heat periods.";
        }

        climateResult.innerHTML = `
            <h3>📍 ${currentCity}</h3>
            <p>1. Current Average Temperature: <strong>${currentTemp.toFixed(1)}°C</strong></p>
            <p>2. Projected Temperature in <strong>${years} Years</strong>: <strong>${projectedTemp.toFixed(1)}°C</strong></p>
            <p>3. Climate Impact: ${impact}</p>
        `;
    }
    predictBtn.addEventListener("click", predictClimate);
    getWeatherData("Delhi");
});