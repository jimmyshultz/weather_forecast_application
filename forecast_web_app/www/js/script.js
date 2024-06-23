document.getElementById('current-location-form').addEventListener('submit', handleClick);
document.getElementById('weather-form').addEventListener('submit', handleSearch);


function handleClick(event) {
    event.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            getOfficeId(position.coords.latitude, position.coords.longitude);
            }, displayGeolocationBlocked());
    } else {
        displayGeolocationError();
    }
}

function handleSearch(event) {
    event.preventDefault();
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;
    getLatLon(city, state);
}

function getLatLon(cityName, stateName) {
    var bingMapsKey = config.bingMapsKey;
    var url = `https://dev.virtualearth.net/REST/v1/Locations/US/${stateName}/${cityName}/?output=json&key=${bingMapsKey}`
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            getOfficeId(data.resourceSets[0].resources[0].geocodePoints[0].coordinates[0], data.resourceSets[0].resources[0].geocodePoints[0].coordinates[1]);
        })
        .catch(function(error){
            console.log(error);
        })
}

function getOfficeId(latitude, longitude) {
    var url = `https://api.weather.gov/points/${latitude},${longitude}`;
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            getWeather(data.properties.gridId, data.properties.gridX, data.properties.gridY, data.properties.relativeLocation.properties.city, data.properties.relativeLocation.properties.state);
        })
        .catch(function(error) {
            console.log(error);
        });
}

function getWeather(office,gridX,gridY,city,state) {
    var url = 'https://api.weather.gov/gridpoints/' + office + '/' + gridX + "," + gridY + "/forecast";
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            displayWeather(data, city, state);
        })
        .catch(function(error) {
            console.log(error);
        });
}

function displayWeather(data, city, state) {
    var weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = '';
    if (state != null) {
        if (data.type === "Feature") {
            var period = data.properties.periods[0].name;
            var temperature = data.properties.periods[0].temperature;
            var trend = data.properties.periods[0].temperatureTrend;
            //var humidity = data.properties.periods[0].relativeHumidity.value;
            var windSpeed = data.properties.periods[0].windSpeed;
            var direction = data.properties.periods[0].windDirection;
            var forecast = data.properties.periods[0].detailedForecast;
            var weatherHtml = '<h2>Weather Forecast for ' + period + ' in ' + city + ', ' + state + '</h2>' +
                '<p>Temperature: ' + temperature + '&#8457;</p>' +
                //'<p>Humidity: ' + humidity + '%</p>' +
                '<p>Wind Speed: ' + windSpeed + ' m/s ' + direction + '</p>' +
                '<h3> Forecast </h3>' +
                '<p>' + forecast + '</p>';
            weatherInfo.innerHTML = weatherHtml;
        } else {
            weatherInfo.innerHTML = '<p>Failed to retrieve weather information.</p>';
        }
    } else {
        if (data.type === "Feature") {
            var period = data.properties.periods[0].name;
            var temperature = data.properties.periods[0].temperature;
            var trend = data.properties.periods[0].temperatureTrend;
            //var humidity = data.properties.periods[0].relativeHumidity.value;
            var windSpeed = data.properties.periods[0].windSpeed;
            var direction = data.properties.periods[0].windDirection;
            var forecast = data.properties.periods[0].detailedForecast;
            var weatherHtml = '<h2>Weather Forecast for ' + period + ' in ' + city + '</h2>' +
                '<p>Temperature: ' + temperature + '&#8457;</p>' +
                //'<p>Humidity: ' + humidity + '%</p>' +
                '<p>Wind Speed: ' + windSpeed + ' m/s ' + direction + '</p>' +
                '<h3> Forecast </h3>' +
                '<p>' + forecast + '</p>';
            weatherInfo.innerHTML = weatherHtml;
        } else {
            weatherInfo.innerHTML = '<p>Failed to retrieve weather information.</p>';
        }
    }
}

function displayGeolocationBlocked() {
    var weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = 'Please allow geolocation.';
}

function displayGeolocationError() {
    var weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = 'Geolocation is not supported by this browser.';
}