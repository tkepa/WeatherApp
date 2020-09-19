"use strict";
import {WeatherInformation} from './weatherInformation.js';
import {Chart} from './chartClass.js';
import {WeekForecast} from './weekForecastClass.js'
// service worker registration - remove if you're not going to use it

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("serviceworker.js").then(
      function (registration) {
        // Registration was successful
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}

// place your code below
const apiKey = "53c5e97675c8d3d8da07e56aec5a3a22";
const axisXposition = 280; // X axis is on 280px Canvas Height;
let classStatus = false;

(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
      },
      timeToCall);
      lastTime = currTime + timeToCall;
      return id;
  };

  if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
  };
}());



function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};


function location() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, error)
  );
}

async function getLocation(location) {
  let position = location;
  let weatherByPosition;
  let weatherByHour;
  let nextSevenDays;
  if (typeof position === 'object') {
    
    position = await position.coords;
    const { latitude, longitude } = position;
  
    weatherByPosition = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pl`
    );
    weatherByPosition = await weatherByPosition.json();
    
    weatherByHour = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&
    exclude=hourly&appid=${apiKey}&units=metric`);
    weatherByHour = await weatherByHour.json();
    weatherByHour = weatherByHour.hourly;
    
    nextSevenDays = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&
    exclude=daily&appid=${apiKey}&units=metric`)
    nextSevenDays = await nextSevenDays.json();
    nextSevenDays = nextSevenDays.daily;
  }
  else {
    weatherByPosition = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${position}&appid=${apiKey}&units=metric`)
    weatherByPosition = await weatherByPosition.json();
    
    const coords = weatherByPosition.coord;
    console.log(coords)
    weatherByHour = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&
    exclude=hourly&appid=${apiKey}&units=metric`);
    weatherByHour = await weatherByHour.json();
    
    weatherByHour = weatherByHour.hourly;

    nextSevenDays = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&
    exclude=daily&appid=${apiKey}&units=metric`)
    nextSevenDays = await nextSevenDays.json();
    nextSevenDays = nextSevenDays.daily;
  }
  


  const weatherData = new WeatherInformation(weatherByPosition);
  weatherData.setWeatherInformation();
  const chart = new Chart(weatherByHour, axisXposition);
  chart.chart();
  const forecastForWeek = new WeekForecast(nextSevenDays);
  forecastForWeek.addWeatherForecast();
  
}

const localization = document.getElementsByClassName('header__geolocalization--buttonJS')[0];
const searchButton = document.getElementsByClassName('header__search--buttonJS')[0];
const inputField = document.getElementsByClassName('header__search--inputJS')[0];


localization.addEventListener('click', async () => {
  const locations = await location();
  await getLocation(locations);
  if(!classStatus) {
    replaceClasses();
    classStatus = true
  }
})

searchButton.addEventListener('click', async () => {
  if (!inputField.value) {
    alert("please type your city name");
  }
  else if (inputField.value) {
    try {
      await getLocation(inputField.value);
      
      if(!classStatus) {
        replaceClasses();
        classStatus = true;
      }

    }
    catch(error) {
      alert('Please type corret city name')
    }
  }
})

function replaceClasses() {
  const header = document.getElementsByClassName("header--firstLoad")[0];
  const main = document.getElementsByClassName("main__container--firstLoad")[0];
  const footer = document.getElementsByClassName("footer--firstLoad")[0];
  
  header.classList.replace("header--firstLoad", "header");
  main.classList.replace("main__container--firstLoad", "main__container");
  footer.classList.replace("header--firstLoad", "footer");
}