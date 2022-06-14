let APIKey = "c5ade66b8bf45789315f45f2454c870b";
let locations = [];


function getWeatherData(lat, lon, city) {

    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?id=524901&appid={C5ade66b8bf45789315f45f2454c870b}" + lat + "&lon=" + lon + "&exclude=,minutely,hourly,alerts&appid=" + APIKey;

    //call the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (response) {

            // console.log(response);

            showWeatherData(response, city);

        });           
 };


 // show weather based on ZipCode 
function loadWeatherZip(zipCpde, isClicked) {

    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?id=524901&appid={C5ade66b8bf45789315f45f2454c870b}"" + zipCpde + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    //call the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        // store data inside "response" object
        //save zip data
        .then(function (response) { 

            console.log(response);

            if (!isClicked)
            {
                saveLocations(response);  
                renderLocations();
            }


    //load weather
            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function (response){
            alert("Not a vaild Zip Code")
        });
}

function loadWeatherCity(city, isClicked) {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    // call  OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        //store data inside "response" object
        //save zip data
        .then(function (response) {

            console.log(response);

            if (!isClicked)
            {
                saveLocations(response);
                renderLocations();
            }

            //load weather
            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function(response){
            alert("Not a valid City");
        });
}

function showWeatherData(weatherData, city)
{
    //load current
    var iconURL = "http://openweathermap.org/img/w/" + weatherData.current.weather[0].icon + ".png";  //get weather icon
    $("#cityDate").html(city + " (" + new Date().toLocaleDateString() + ") <img id=\"icon\" src=\"" + iconURL  + "\" alt=\"Weather icon\"/>");

    var temp = parseInt(weatherData.current.temp);
    temp = Math.round(((temp-273.15)*1.8) + 32);
    $("#currentTemp").html(" " + temp +  "  &degF");
    $("#currentHumidity").html(weatherData.current.humidity + "%");
    $("#currentWindSpeed").html(weatherData.current.wind_speed + " MPH");

    //get  current uv index and 
    //store in uvIndex.current array 
    var uvIndex = weatherData.current.uvi;

    var bgColor = "";  
    var textColor = "";  


    //low uv index
    if (uvIndex < 3)
    {
        bgColor = "bg-success";
        textColor = "text-light";  
    //mild uv index (3-5)    
    }
    else if (uvIndex > 2 && uvIndex < 6)
    {
        bgColor = "bg-warning";
        textColor = "text-dark";             
    }
    else
    //high uv index
    {
        bgColor = "bg-danger";
        textColor = "text-light";            
    }

    $("#currentUVIndex").html(uvIndex).addClass(bgColor + " p-1 " +  textColor); //set the UVIndex and color to the html


    //5 day forecast
    var ul5 = $("#fiveDay");
    ul5.empty();

    for (i=1; i < 6; i++)
    {
        var div = $("<div>").addClass("bg-primary");

        var dateTime = parseInt(weatherData.daily[i].dt); 
        var dateHeading = $("<h6>").text(new Date(dateTime * 1000).toLocaleDateString());  //convert unix time to javascript date
        var iconDayURL = "http://openweathermap.org/img/w/" + weatherData.daily[i].weather[0].icon + ".png";  //get weather icon
        var icon = $("<img>").attr("src", iconDayURL);

        temp = parseInt(weatherData.daily[i].temp.day);  
        temp = Math.round(((temp-273.15)*1.8) + 32); 
        var temp5 = $("<p>").html("Temp: " + temp +  "  &degF");

        var humidity5 = $("<p>").html("Humidity: " + weatherData.daily[i].humidity + "%");

        div.append(dateHeading);
        div.append(icon);
        div.append(temp5);
        div.append(humidity5);
        ul5.append(div);

    }

    $("#weatherData").show();
}

//load local storage
function loadLocations()
{
    var locationsArray = localStorage.getItem("locations");
    if (locationsArray)
    {
      locations = JSON.parse(locationsArray);
      renderLocations();
    }
    else {
      localStorage.setItem("locations", JSON.stringify(locations));
    }
}

function renderLocations()
{
    var divLocations = $("#locationHistory");
    divLocations.empty(); 

    $.each(locations, function(index, item){
        var a = $("<a>").addClass("list-group-item list-group-item-action city").attr("data-city", locations[index]).text(locations[index]);
        divLocations.append(a);
    });

    $("#locationHistory > a").off();

    $("#locationHistory > a").click(function (event)
    {   
        var element = event.target;
        var city = $(element).attr("data-city");

        loadWeatherCity(city, true);
    });

}

//save locations to storage and array
function saveLocations(data)
//get city name
{

    var city = data.city.name;

    locations.unshift(city);
    localStorage.setItem("locations", JSON.stringify(locations));  //convert to a string and sent to local storage

}

$(document).ready(function () {

    $("#weatherData").hide(); 

    loadLocations(); 

    $("#searchBtn").click(function (event) {  
        var element = event.target; 
        var searchCriteria = $("#zipCode").val(); 
        
        if (searchCriteria !== "") 
        {
            var zip = parseInt(searchCriteria); 

            if (!isNaN(zip))=
            {
                loadWeatherZip(zip, false);
            }
            else
            {
                loadWeatherCity(searchCriteria, false); 
            }
        }
    });
});