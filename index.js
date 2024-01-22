/*--------------------------------------------------Date change in the navbar--------------------------------------------------*/

function updateDateInNavbar() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    document.querySelector('.navbar-brand').textContent = formattedDate;
}
updateDateInNavbar();

/*--------------------------------Function to get coordinates from a city name using a geocoding API----------------------------*/

function getCoordinatesFromCity(city) {
    const apiKey = '';// here should put the personal apiKey 
    const endpoint = 'https://api.opencagedata.com/geocode/v1/json';
    const encodedCity = encodeURIComponent(city);
    const url = `${endpoint}?q=${encodedCity}&key=${apiKey}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const location = data.results[0].formatted;
                const coordinates = data.results[0].geometry;
                return { location, coordinates };
            }
        })
        .catch(error => console.error('Error fetching coordinates: ' + error));
}


/*--------------------------------Function to update the location and weather data based on coordinates-------------------------*/

function updateLocationAndWeather(coordinates, location) {
    
    document.querySelector('.location').textContent = location;// Update the "location" text with the city name

    // Fetch current weather data based on coordinates
    const WeatherApiKey = '';// here should put the personal WeatherApiKey
    const endpoint = 'https://api.openweathermap.org/data/2.5/weather';
    const url = `${endpoint}?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${WeatherApiKey}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // Access the relevant weather data from the API response
            const iconCode = data.weather[0].main;
            const temperatureKelvin = data.main.temp;
            const temperatureCelsius = parseInt(temperatureKelvin - 273.15);
            const description = data.weather[0].description;

            // Update the weather-related elements based on the data
            document.querySelector('.current-temperature-value').textContent = temperatureCelsius + '°C';
            document.querySelector('.current-temperature-summary').textContent = description;

            // Define our icon mapping
            const iconMapping = {
                "Clear": "icons/sunny.png",
                "Clouds": "icons/cloudy.png",
                "Snow": "icons/snowy.png",
                "Rain": "icons/rainy.png",
                "Drizzle": "icons/rainy.png",
                "Thunderstorm": "icons/storm.png",
                "Fog": "icons/foggy.png",
                "Mist": "icons/foggy.png",
                "Haze": "icons/hazy.png",
                "Sleet": "icons/sleet.png",
                "Sunshower": "icons/sunshower.png"
            };

            // Get a reference to the weather icon element
            const weatherIcon = document.querySelector(".current-weather-icon");

            // Update the weather icon based on the weather condition
            if (iconMapping.hasOwnProperty(iconCode)) {
                weatherIcon.src = iconMapping[iconCode];
            } else {
                weatherIcon.src = "icons/default.png";
            }
        })
        .catch((error) => console.error('Error fetching weather data: ' + error));
}

// Event listener for the form submission
const form = document.querySelector('form');
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const locationInput = document.querySelector('input[type="search"]').value;

    // Get coordinates from the city name
    getCoordinatesFromCity(locationInput)
        .then(({ location, coordinates }) => {
            updateLocationAndWeather(coordinates, location);
            fetchAndUpdateTemperatures(coordinates)
            fetchAndUpdateOtherWeatherConditions(coordinates)
            update6DayForecast(coordinates); 
        });
});

function fetchAndUpdateTemperatures(coordinates) {
    const WeatherApiKey = '';// here should put the personal WeatherApiKey
    const forecastEndpoint = 'https://api.openweathermap.org/data/2.5/forecast';
    const url = `${forecastEndpoint}?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${WeatherApiKey}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const higherTemp = parseInt(data.list[0].main.temp_max);
            const lowerTemp = parseInt(data.list[0].main.temp_min);

            document.querySelector('.higher-temperature').textContent = `${(higherTemp - 273.15).toFixed(0)}°C`;
            document.querySelector('.lower-temperature').textContent = `${(lowerTemp - 273.15).toFixed(0)}°C`;
        })
        .catch((error) => console.error('Error fetching temperature data: ' + error));
}

function fetchAndUpdateOtherWeatherConditions(coordinates) {
    const WeatherApiKey = '';// here should put the personal WeatherApiKey
    const currentWeatherEndpoint = 'https://api.openweathermap.org/data/2.5/weather';
    const url = `${currentWeatherEndpoint}?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${WeatherApiKey}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const windSpeed = parseInt(data.wind.speed);
            const sunriseTimestamp = data.sys.sunrise * 1000;
            const sunriseTime = new Date(sunriseTimestamp);
            const hours = sunriseTime.getUTCHours().toString().padStart(2, '0');
            const minutes = sunriseTime.getUTCMinutes().toString().padStart(2, '0');
            const humidity = data.main.humidity;
            const sunsetTimestamp = data.sys.sunset * 1000;
            const sunsetTime = new Date(sunsetTimestamp);

            document.querySelector('.wind-speed').textContent = `${windSpeed} m/s`;
            document.querySelector('.sunrise-time').textContent = `${hours}:${minutes}`;
            document.querySelector('.humidity-value').textContent = `${humidity}%`;
            document.querySelector('.sunset-time').textContent = `${sunsetTime.getUTCHours().toString().padStart(2, '0')}:${sunsetTime.getUTCMinutes().toString().padStart(2, '0')}`;
        })
        .catch((error) => console.error('Error fetching other weather condition data: ' + error));
}
//---------------------------------------------------Weather for other days-----------------------------------------------------------------------------------------

function update6DayForecast(coordinates) {
    const WeatherApiKey = '';// here should put the personal WeatherApiKey
    const endpoint = 'https://api.openweathermap.org/data/2.5/forecast';
    const url = `${endpoint}?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${WeatherApiKey}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 

            // Find the index of the first data point for tomorrow
            let startIndex = 0;
            for (let i = 0; i < data.list.length; i++) {
                const forecastDate = new Date(data.list[i].dt * 1000);
                forecastDate.setHours(0, 0, 0, 0);
                if (forecastDate > today) {
                    startIndex = i;
                    break;
                }
            }

            // Loop through the data to update each card
            for (let i = 0; i < 6; i++) {
                const card = document.querySelector(`.weather-for-other-days .col-md-4:nth-child(${i + 1})`);
                const dayData = data.list[startIndex + i * 8]; // Fetch data for every 8th item (next day)

                const cardTitle = card.querySelector('.card-title');
                const cardImage = card.querySelector('.card-img-top');
                const cardTemperature = card.querySelector('.temperature');
                const cardWeatherInfo = card.querySelector('.weather-info');

                const date = new Date(dayData.dt * 1000);
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

                cardTitle.textContent = dayOfWeek;
                cardImage.src = getWeatherIcon(dayData.weather[0].main);
                cardTemperature.textContent = `${(dayData.main.temp - 273.15).toFixed(0)}°C`;
                cardWeatherInfo.textContent = dayData.weather[0].description;
            }
        })
        .catch((error) => console.error('Error fetching 6-day forecast data: ' + error));
}


// Define a function to get the weather icon for a given condition
function getWeatherIcon(condition) {
    const iconMapping = {
        "Clear": "icons/sunny.png",
        "Clouds": "icons/cloudy.png",
        "Snow": "icons/snowy.png",
        "Rain": "icons/rainy.png",
        "Drizzle": "icons/rainy.png",
        "Thunderstorm": "icons/storm.png",
        "Fog": "icons/foggy.png",
        "Mist": "icons/foggy.png",
        "Haze": "icons/hazy.png",
        "Sleet": "icons/sleet.png",
        "Sunshower": "icons/sunshower.png"
    };
    return iconMapping[condition] || "icons/default.png";
}

  