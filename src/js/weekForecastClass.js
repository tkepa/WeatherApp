export class WeekForecast {
  constructor(weekForecastData) {
    this.weekData = weekForecastData;
    this.weatherForecastContainer = document.getElementsByClassName("weatherForecast--js");
    this.weatherForecastContainer = this.weatherForecastContainer[0];
  }

  sliceWeekDataArray(){
    this.weekData = this.weekData.slice(1,8);
    console.log(this.weekData)
  }
  getTimestampToTime(timestamp) {
    const time = new Date(timestamp * 1000);
    return time.getDay();
  }
  getNameOfWeek(number) {
    switch (number) {
      case 0:
        return "Sun";
        break;
      case 1:
        return "Mon";
        break;
      case 2:
        return "Tue";
        break;
      case 3:
        return "Wed";
        break;
      case 4:
        return "Thur";
        break;
      case 5: 
        return "Fri";
        break;
      case 6:
        return "Sat";
        break
    }
  }
  getWeatherParameters(){
    this.weekData = this.weekData.map(el => {
      return {
        day: this.getNameOfWeek(this.getTimestampToTime(el.dt)), 
        temp: el.temp.day,
        weather: el.weather[0].main
      }
    });
    console.log(this.weekData)
  }

  putWeatherIntoSection(){
    this.weatherForecastContainer.innerHTML = '';
    this.weekData.forEach(el => {
      this.weatherForecastContainer.innerHTML += `<div class="weatherForecast__day weatherForecast__day--js"><img class="weatherForecast__dayElement" src='assets/img/weathericons/${this.weatherIcon(el.weather)}' alt=''></img><div class="weatherForecast__dayElement"><p>${el.day}<br>${el.temp}</p></div></div>`
    })
  }

  addWeatherForecast() {
    this.sliceWeekDataArray();
    this.getWeatherParameters();
    this.putWeatherIntoSection();
  }

  weatherIcon(weather) {
    let currentDate = new Date();
    currentDate = currentDate.getHours();
    switch(weather) {
      case 'thunderstorm':
        return 'storm.svg';
        break;
      case 'Drizzle':
        return 'Drizzle.svg';
        break;
      case 'Rain':
        return 'Rain.svg';
        break;
      case 'Snow':
        return 'Snowflake.svg';
        break;
      case 'Atmosphere':
        return 'fog.svg';
        break;
      case 'Clear':
        if(currentDate <= 20) {
          return 'sun.svg';
          break;
        }
        else {
          return 'moon.svg';
          break;
        }
      case 'Clouds':
        return 'Clouds.svg'
        break;
    }
  }

}