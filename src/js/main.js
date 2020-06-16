"use strict";

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



function success(loc) {
  const { coords } = loc;
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function consolValue(val) {
  return val;
}

function location() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, error)
  );
}

async function getLocation() {
  let position = await location();
  position = await position.coords;
  const { latitude, longitude } = position;

  let weatherByPosition = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pl`
  );
  let weatherByHour = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&
  exclude=hourly&appid=${apiKey}&units=metric&lang=pl`);
  weatherByPosition = await weatherByPosition.json();
  weatherByHour = await weatherByHour.json();
  weatherByHour = weatherByHour.hourly;
  const hourOfWeather = mapAndFilter(weatherByHour.map((obj) => obj.dt));
  let temperature = filterTemperature(weatherByHour);
  const temperatureCoords = temperatureToChartCoords(temperature);
  
  const tempPixels = temperatureToPixel(temperatureCoords);
  const hoursPixels = hoursToPixel(getHoursCoords());
  
  const tempPoints = createTempObj(hoursPixels, tempPixels, hourOfWeather, temperature);

  
  

  
  
  grid();
  drawAxis(hourOfWeather);
  await wait(500);
  drawChart(temperatureCoords)
  addPopUp(tempPoints);
}



const canvas = document.getElementById("chartTemp__canvas");
canvas.width = 660;
canvas.height = 309;
const ctx = canvas.getContext("2d");

function grid() {
  let gridX = 40;
  let gridY = 40;
  const cellSize = 40;
  ctx.beginPath();
  ctx.strokeStyle = "lightgrey";

  while (gridX <= canvas.width - 20) {
    ctx.moveTo(gridX, 20);
    ctx.lineTo(gridX, canvas.height - 20);
    gridX += cellSize;
  }
  while (gridY <= canvas.height - 20) {
    ctx.moveTo(20, gridY);
    ctx.lineTo(canvas.width - 10, gridY);
    gridY += cellSize;
  }
  ctx.stroke();
}

function blocks(count) {
  return count * 40;
}

async function drawAxis(hours) {
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.moveTo(blocks(1), blocks(1 / 2));
  ctx.lineTo(blocks(1), blocks(7));
  ctx.lineTo(blocks(16), blocks(7));

  ctx.moveTo(blocks(1), blocks(7));
  let text = 0;
  let textY = blocks(7);
  for (let i = 1; i <= 7; i++) {
    ctx.strokeText(text, blocks(1 / 2), textY);
    textY -= 40;
    text += 5;
  }

  ctx.moveTo(blocks(2), blocks(7));
  let textX = blocks(1.9);

  for (let i = 0; i <= 15; i++) {
    ctx.strokeText(hours[i], textX, blocks(7.5));
    textX += 40;
  }
  ctx.stroke();
}
function timestampToTime(stamp) {
  let date = new Date(stamp * 1000);
  return date.getHours();
}

function mapAndFilter(tempArray) {
  tempArray = tempArray.map((el) => timestampToTime(el));
  tempArray = tempArray.filter((el) => el % 2 == 0);
  return tempArray;
}

function temperatureToChartCoords(temp){
  let temperature = temp.map((el) => el / 5);
  temperature = temperature.slice(0,15);
  return temperature;
}

function getHoursCoords() {
  let hourOfTemp = [...Array(17).keys()]
  hourOfTemp = hourOfTemp.slice(2, 17);

  return hourOfTemp;
}

function drawChart(temperature) {
  const tempHours = getHoursCoords();
  let i = 1;
  function animation() {
    if (i <= temperature.length) {
      window.requestAnimationFrame(animation);
    }
    ctx.strokeStyle = "#FFE74A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(blocks(tempHours[i-1]), 280 - blocks(temperature[i-1]));
    ctx.arc(blocks(tempHours[i-1]), 280 - blocks(temperature[i-1]), 3, 0, Math.PI * 2, true);
    ctx.lineTo(blocks(tempHours[i]), 280 - blocks(temperature[i]));
    ctx.stroke();
    i++;
  }
  animation();
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getMousePosition(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function filterTemperature(temperature) {
  const temp = temperature
    .map((obj) => obj.temp)
    .filter((el, index) => index % 2 == 0);

  return temp;
}

function temperatureToPixel(temp){
  temp = temp.map(el => 280 - blocks(el));
  return temp;
}

function hoursToPixel(hours) {
  const hourrs = hours.map(el => blocks(el));
  return hourrs;
}

function createTempObj(hour, temp, hourOfTemp, tempInHour){
  const tempPointCoords = [];
  for (let i = 0; i < temp.length; i++){
    tempPointCoords.push({
      x: hour[i],
      y: temp[i],
      xmin: hour[i] - 3,
      xmax: hour[i] + 3,
      ymin: temp[i] - 3,
      ymax: temp[i] + 3,
      hourTemp: {
        hour: hourOfTemp[i],
        temp: tempInHour[i]
      },

    })
  }
  return tempPointCoords;
}

function drawPoint(coords = {}, radius, color = 'white') {
  const mouseCoordinate = coords;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(mouseCoordinate.x, mouseCoordinate.y);
  ctx.arc(mouseCoordinate.x, mouseCoordinate.y, radius, 0, Math.PI * 2, true);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
}

let condition = false;
let state = {};
let tooltip = document.getElementsByClassName("chartTemp__tooltip");
tooltip = tooltip[0]
function addPopUp(tempPoint) {
  canvas.addEventListener('mousemove', function(evt) {
    const mouseCoords = getMousePosition(canvas, evt);
    let boools = tempPoint.filter(el => {
      const a = el.xmin <= mouseCoords.x;
      const b = mouseCoords.x <= el.xmax;
      const c = el.ymin <= mouseCoords.y;
      const d = mouseCoords.y <= el.ymax;
      return (a && b && c && d)})
    
    if(boools.length) {
      drawPoint(boools[0], 1);
      state = {...boools[0]};
      condition = true;
      tooltip.style.left = `${state.x + 5}px`;
      tooltip.style.top = `${state.y - 35}px`;
      tooltip.style.display = 'flex';
      tooltip.innerHTML = `Time: ${state.hourTemp.hour}:00, Temp: ${state.hourTemp.temp}°C`;
    } 
    else if(!boools.length) {
      drawPoint(state, 3, "#FFE74A");
      condition = false;
      state = {};
      tooltip.style.display = 'none';
    } 
  })
}




getLocation();