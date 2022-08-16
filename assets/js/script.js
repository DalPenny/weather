var cityForm = $("#citySearch");
var prevCities = $("#prevCity");
var weather = $("#currentWeather");
var forecast = $("#5dayForecast");
var forecastTitle= $("#forecastHeading")

var cityList = []

// Get today's date to display
var dispToday = moment().format('dddd - MMMM DD YYYY');
$("#currentDay").html(dispToday);

function begin() {
    cityForm.children("button").on("click", getData);
    beginStorage();
    beginPrev();
}

// if local storage has cities put them in a list
function beginStorage() {
    if(localStorage.getItem("cityList") !== null) {
        cityList = JSON.parse(localStorage.getItem("cityList"));
    }
    localStorage.setItem("cityList", JSON.stringify(cityList));
}

// Create buttons for prev cities
function beginPrev() {
    var i = 0;
    while(i < cityList.length && i < 8) {
        var prev = $("<button>");
        prev.text(`${cityList[i]}`);
        prev.attr("class", "col-8 my-1 btn btn-dark");
        prevCities.append(prev);
        i++;
    }
    prevCities.children("button").on("click", getData)
}

// Use the city to access the API for geocoding
function getData(event) {
    event.preventDefault();
    var city = "";
    if(event.target.textContent === "Search") {
        city = cityForm.children("input").val();
        cityForm.children("input").val("");
    } else {
        city = event.target.textContent;
    }
    city = city.toUpperCase();
    if(!city) {
        invalidCity();
        return;
    }
    var requestUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=5911de58d825147b5fa891cd55dfb5c0&units=metric`;
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if(data.length) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=5911de58d825147b5fa891cd55dfb5c0&units=metric`;
                fetch(requestUrl)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        displayWeather(data, city);    
                        forecastFiveday(data);
                        saveCity(city);   
                    });
            } else {
                invalidCity();
            }
        });
}

// Display current weather
function displayWeather(data, city) {
    var title = weather.children().eq(0).children("h2")
    var conditions = weather.children().eq(0).children("img");
    var temp = weather.children().eq(1);
    var wind = weather.children().eq(2);
    var humidity = weather.children().eq(3);
    var uvIndex = weather.children().eq(4);
    
    weather.addClass("card bg-light mb-3");

    title.text(`${city} (${moment().format('MM/DD/YYYY')})`);
    conditions.attr("src",`https://openweathermap.org/img/w/${data.current.weather[0].icon}.png`);
    temp.text(`Temp: ${data.current.temp}°C`);
    wind.text(`Wind: ${Math.round((data.current.wind_speed * 3.6))} kph`);
    humidity.text(`Humidty: ${data.current.humidity}%`);
    uvIndex.text(`UV Index: ${data.current.uvi}`);

    var uv = data.current.uvi;
    if(uv < 4) {
        uvIndex.css("background-color", "lime");
    }else if(uv < 7) {
        uvIndex.css("background-color", "yellow");
    }else {
        uvIndex.css("background-color", "orangered");
    }
    
}

// Displays the 5 day forecast
var today = dayjs();
function forecastFiveday(data) {
    forecastTitle.css("visibility", "visible");
    for(var i = 0; i < 5; i++) {
        var date = forecast.children().eq(i).children().eq(0);
        var conditions = forecast.children().eq(i).children("img");
        var temp = forecast.children().eq(i).children().eq(2);
        var wind = forecast.children().eq(i).children().eq(3);
        var humidity = forecast.children().eq(i).children().eq(4);

        forecast.children().eq(i).addClass("card text-white fcastArea mb-3 mx-1")
    
        var index = i + 1;
        date.text(today.add((i + 1), "d").format("MM/DD/YYYY"));
        conditions.attr("src",`https://openweathermap.org/img/w/${data.daily[index].weather[0].icon}.png`);
        temp.text(`Temp: ${data.daily[index].temp.day}°C`);
        wind.text(`Wind: ${Math.round(data.daily[index].wind_speed * 3.6)} kph`);
        humidity.text(`Humidity: ${data.daily[index].humidity}%`);
    }
}

// if there are any cities saved locally
// populate them in a list
function saveCity(city) {
    if(localStorage.getItem("cityList") !== null) {
        cityList = JSON.parse(localStorage.getItem("cityList"));
    }
    while(cityList.length > 7) {
        cityList.pop();
    }
    for(var i = 0; i < cityList.length; i++) {
        if(city === cityList[i]) {
            return
        }
    }
    cityList.push(city);
    
    localStorage.setItem("cityList", JSON.stringify(cityList));
    updatePrev();
}

// If less than eight buttons, Creates a new button
function updatePrev() {
    if(cityList.length < 8) {
        var prev = $("<button>");
        prev.text(`${cityList[0]}`);
        prev.attr("class", "col-8 my-1 btn btn-dark");
        prevCities.append(prev);
    } else {
        for(var i = 0; i < 8; i++) {
            prevCities.children().eq(i).text(cityList[i]);
        }
    }    
}

function invalidCity(){
    alert("Please enter a valid city ❌");
}

begin();