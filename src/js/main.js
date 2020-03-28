"use strict";

// service worker registration - remove if you're not going to use it

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('serviceworker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// place your code below
const apiKey = "53c5e97675c8d3d8da07e56aec5a3a22";


function success(loc) {
  const {coords} = loc;
  
}; 
  

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}

function consolValue(val) {
  return val;
}

function location(){
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, error));
}

async function getLocation() {
  let position = await location();
  position = await position.coords;
  const {latitude, longitude} = position
  
  let weatherByPosition = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pl`)
  weatherByPosition = await weatherByPosition.json();
  console.log(weatherByPosition);

}
getLocation();

