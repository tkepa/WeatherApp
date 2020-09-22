export class Chart {
    constructor(weatherData, axisXposition) {
      this.axisXposition = axisXposition;
      this.weatherByHour = weatherData;
      this.condition = false;
      this.state = {};
      this.tooltip = document.getElementsByClassName("chartTemp__tooltip")[0];
      this.canvas = document.getElementById("chartTemp__canvas");
      this.ctx = this.canvas.getContext("2d");
    }
  
    canvasDimensions() {
      this.canvas.width = 660;
      this.canvas.height = 309;
    }
  
    blocks(count) {
      return count * 40;
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
      this.ctx.lineTo(this.blocks(16), this.blocks(7));
    
      this.ctx.moveTo(this.blocks(1), this.blocks(7));
      let text = 0;
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
    
    getMousePosition(evt) {
      let rect = this.canvas.getBoundingClientRect();
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
      temp = temp.map(el => this.axisXposition - this.blocks(el));
      return temp;
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
    
    drawPoint(coords = {}, radius, color = 'white') {
      const mouseCoordinate = coords;
      this.ctx.strokeStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(mouseCoordinate.x, mouseCoordinate.y);
      this.ctx.arc(mouseCoordinate.x, mouseCoordinate.y, radius, 0, Math.PI * 2, true);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.stroke();
    }
    
  
    addPopUp(tempPoint) {
      this.canvas.addEventListener('mousemove', (e) => {
        const mouseCoords = this.getMousePosition(e);
        let boools = tempPoint.filter(el => {
          const a = el.xmin <= mouseCoords.x;
          const b = mouseCoords.x <= el.xmax;
          const c = el.ymin <= mouseCoords.y;
          const d = mouseCoords.y <= el.ymax;
          return (a && b && c && d)})
        
        if(boools.length) {
          this.drawPoint(boools[0], 1);
          this.state = {...boools[0]};
          this.condition = true;
          if (this.canvas.width - (this.state.x + 5) <= 80){
            this.tooltip.style.left = `${this.state.x - 85}px`
            this.tooltip.style.top = `${this.state.y - 35}px`;
            
          }
          else {
            this.tooltip.style.left = `${this.state.x + 5}px`;
            this.tooltip.style.top = `${this.state.y - 35}px`;
          }
          this.tooltip.style.display = 'flex';
          this.tooltip.innerHTML = `Time: ${this.state.hourTemp.hour}:00, Temp: ${this.state.hourTemp.temp}°C`;
        } 
        else if(!boools.length) {
          this.drawPoint(this.state, 3, "#FFE74A");
          this.condition = false;
          this.state = {};
          this.tooltip.style.display = 'none';
        } 
      })
    }
    
    async chart() {
      const hourOfWeather = this.mapAndFilter(this.weatherByHour.map((obj) => obj.dt));
      let temperature = this.filterTemperature(this.weatherByHour);
      const temperatureCoords = this.temperatureToChartCoords(temperature);
      
      const tempPixels = this.temperatureToPixel(temperatureCoords, this.axisXposition);
      const hoursPixels = this.hoursToPixel(this.getHoursCoords());
      
      const tempPoints = this.createTempObj(hoursPixels, tempPixels, hourOfWeather, temperature);
    
      this.canvasDimensions();
      this.drawGrid();
      this.drawAxis(hourOfWeather);
      await this.waitForGrid(500);
      this.drawChart(temperatureCoords)
      this.addPopUp(tempPoints);
    }
  
  }