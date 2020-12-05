export class Chart {
    constructor(weatherData, axisXposition) {
      this.axisXposition = axisXposition;
      this.weatherByHour = weatherData;
      this.condition = false;
      this.state = {};
      this.tooltip = document.getElementsByClassName("chartTemp__tooltip")[0];
      this.canvas = document.getElementById("chartTemp__canvas");
      this.ctx = this.canvas.getContext("2d");
      this.button = document.getElementsByClassName("header__search--buttonJS")[0];
    }
  
    canvasDimensions() {
      this.canvas.width = 660;
      this.canvas.height = 309;
    }
  
    blocks(count) {
      return count * 40;
    }
    
    setAxisXposition(averageTemp) {
      if (averageTemp > 0 && averageTemp < 15) {
        this.axisXposition = this.axisXposition / 2 + 20;
      }
      else if (averageTemp < -10) {
        this.axisXposition = 40;
      }
    }

    drawGrid() {
      let gridX = 40;
      let gridY = 40;
      const cellSize = 40;
      this.ctx.beginPath();
      this.ctx.strokeStyle = "lightgrey";
    
      while (gridX <= this.canvas.width - 20) {
        this.ctx.moveTo(gridX, 20);
        this.ctx.lineTo(gridX, this.canvas.height - 20);
        gridX += cellSize;
      }
      while (gridY <= this.canvas.height - 20) {
        this.ctx.moveTo(20, gridY);
        this.ctx.lineTo(this.canvas.width - 10, gridY);
        gridY += cellSize;
      }
      this.ctx.stroke();
    }
    
    async drawAxis(hours) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "black";
        this.ctx.moveTo(this.blocks(1), this.blocks(1 / 2));
        this.ctx.lineTo(this.blocks(1), this.blocks(7));
        this.ctx.moveTo(this.blocks(1), this.axisXposition);
        this.ctx.lineTo(this.blocks(16), this.axisXposition);
        
        this.ctx.moveTo(this.blocks(1), this.blocks(7));
        let text = this.axisXposition === 160 ? -15 : (this.axisXposition === 40 ? -30 : 0);
        let textY = this.blocks(7);
        for (let i = 1; i <= 7; i++) {
          this.ctx.strokeText(text, this.blocks(1 / 2), textY);
          textY -= 40;
          text += 5;
        }
        this.ctx.moveTo(this.blocks(2), this.blocks(7));
        let textX = this.blocks(1.9);
              for (let i = 0; i <= 15; i++) {
          this.ctx.strokeText(hours[i], textX, this.blocks(7.5));
          textX += 40;
        }
        this.ctx.stroke();
      
      
      
    

    }
    timestampToTime(stamp) {
      let date = new Date(stamp * 1000);
      return date.getHours();
    }
    
    mapAndFilter(tempArray) {
      tempArray = tempArray.map((el) => this.timestampToTime(el));
      tempArray = tempArray.filter((el) => el % 2 == 0);
      return tempArray;
    }
    
    temperatureToChartCoords(temp){
      let temperature = temp.map((el) => el / 5);
      temperature = temperature.slice(0,15);
      return temperature;
    }
    
    getHoursCoords() {
      let hourOfTemp = [...Array(17).keys()]
      hourOfTemp = hourOfTemp.slice(2, 17);
    
      return hourOfTemp;
    }
    
    getAverageTemp(temperature) {
      return (temperature.reduce((a,b) => (a+b)) / temperature.length).toFixed(1);
    }

    drawChart(temperature) {
      const tempHours = this.getHoursCoords();
      let i = 1;
      const context = this.ctx
      const block = this.blocks.bind(this);
      const axisXposition = this.axisXposition;
      function animation() {
        if (i <= temperature.length) {
          window.requestAnimationFrame(animation);
        }
        context.strokeStyle = "#FFE74A";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(block(tempHours[i-1]), axisXposition - block(temperature[i-1]));
        context.arc(block(tempHours[i-1]), axisXposition - block(temperature[i-1]), 3, 0, Math.PI * 2, true);
        context.lineTo(block(tempHours[i]), axisXposition - block(temperature[i]));
        context.stroke();
        i++;
      }
      animation();
    }
    
    async waitForGrid(ms) {
      return new Promise(r => setTimeout(r, ms));
    }
    
    getMousePosition(evt, canvas) {
      let rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }
    
    filterTemperature(temperature) {
      const temp = temperature
        .map((obj) => obj.temp)
        .filter((el, index) => index % 2 == 0);
    
      return temp;
    }
    
    temperatureToPixel(temp){
      const pixelTemp = temp.map(el => this.axisXposition - this.blocks(el));
      
      return pixelTemp;
    }
    
    hoursToPixel(hours) {
      const hourrs = hours.map(el => this.blocks(el));
      return hourrs;
    }
    
    createTempObj(hour, temp, hourOfTemp, tempInHour){
      const tempPointCoords = [];
      for (let i = 0; i < temp.length; i++){
        tempPointCoords.push({
          x: hour[i],
          y: temp[i],
          xmin: Math.abs(hour[i]) - 3,
          xmax: Math.abs(hour[i]) + 3,
          ymin: Math.abs(temp[i]) - 3,
          ymax: Math.abs(temp[i]) + 3,
          hourTemp: {
            hour: hourOfTemp[i],
            temp: tempInHour[i]
          },
    
        })
      }
      return tempPointCoords;
    }
    
    drawPoint(ctx, coords = {}, radius, color = 'white') {
      const mouseCoordinate = coords;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(mouseCoordinate.x, mouseCoordinate.y);
      ctx.arc(mouseCoordinate.x, mouseCoordinate.y, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    
    addEvent(pointTemp, mouseCoordinate, drawPoint, canvas, state, tooltip, ctx, condition) {
      return function(e) {
          const mouseCoords = mouseCoordinate(e, canvas);
          let boools = pointTemp.filter(el => {
          const a = el.xmin <= mouseCoords.x;
          const b = mouseCoords.x <= el.xmax;
          const c = el.ymin <= mouseCoords.y;
          const d = mouseCoords.y <= el.ymax;
          return (a && b && c && d)
        })

        if(boools.length) {
          drawPoint(ctx, boools[0], 1);
          state = {...boools[0]};
          condition = true;
          if (canvas.width - (state.x + 5) <= 80){
            tooltip.style.left = `${state.x - 85}px`
            tooltip.style.top = `${state.y - 35}px`;
            
          }
          else {
            tooltip.style.left = `${state.x + 5}px`;
            tooltip.style.top = `${state.y - 35}px`;
          }
          tooltip.style.display = 'flex';
          tooltip.innerHTML = `Time: ${state.hourTemp.hour}:00, Temp: ${state.hourTemp.temp}°C`;
        } 
        else if(!boools.length) {
          drawPoint(ctx, state, 3, "#FFE74A");
          condition = false;
          state = {};
          tooltip.style.display = 'none';
          boools = [];
        } 
      
      }
    }
    addPopUp(tempPoint) {
      const addEvent1 = this.addEvent(tempPoint, this.getMousePosition, this.drawPoint, this.canvas, this.state, this.tooltip, this.ctx, this.condition);
      this.canvas.addEventListener('mousemove', addEvent1);
      this.button.addEventListener("click", e => {
        this.canvas.removeEventListener('mousemove', addEvent1);
      });
      
      
    }

    removePopUp(tempPoint) {
      const addEvent1 = this.addEvent(tempPoint, this.getMousePosition, this.drawPoint, this.canvas, this.state, this.tooltip, this.ctx, this.condition);
      this.canvas.removeEventListener('mousemove', addEvent1);
    }

    async chart() {
      const hourOfWeather = this.mapAndFilter(this.weatherByHour.map((obj) => obj.dt));
      let temperature = this.filterTemperature(this.weatherByHour);
      const averageTemp = this.getAverageTemp(temperature);
      this.setAxisXposition(averageTemp);
      
      const temperatureCoords = this.temperatureToChartCoords(temperature);
      
      const tempPixels = this.temperatureToPixel(temperatureCoords);
      const hoursPixels = this.hoursToPixel(this.getHoursCoords());
      
      const tempPoints = this.createTempObj(hoursPixels, tempPixels, hourOfWeather, temperature);
    
      this.canvasDimensions();
      this.drawGrid();
      this.drawAxis(hourOfWeather, averageTemp);
      await this.waitForGrid(500);
      this.drawChart(temperatureCoords)
      this.addPopUp(tempPoints);
      this.removePopUp(tempPoints);
    }
  
  }