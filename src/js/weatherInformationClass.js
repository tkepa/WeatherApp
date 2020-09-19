export class WeatherInformation {
    constructor(weatherInfo) {
      this.location = weatherInfo.name,
      this.country = weatherInfo.sys.country
      this.date = new Date(),
      this.temp = weatherInfo.main.temp,
      this.iconName = weatherInfo.weather[0].main,
      this.pressure = weatherInfo.main.pressure,
      this.humidity = weatherInfo.main.humidity,
      this.windSpped = weatherInfo.wind.speed
    }
  
    setLocation() {
      const locationID = document.getElementsByClassName("headText__location--js")[0];
      locationID.innerHTML = `in ${this.location}, ${this.country}`;
    }
    setDate() {
      const dateID = document.getElementsByClassName("headText__date--js")[0];
      dateID.innerHTML = `Today ${this.date.getDate()}th, ${this.date.toLocaleString('en-EN', {month: 'long'})}`
    }
    
    setTemp() {
      const tempID = document.getElementsByClassName("headText--degrees-js")[0];
      tempID.innerHTML = `${this.temp.toFixed(1)} °C`;
    }
  
    setPressure() {
      const pressureID = document.getElementsByClassName("weatherToday__pressure--js")[0];
      pressureID.innerHTML = `${this.pressure} hPa`;
    }
  
    setHumidity() {
      const humidityID = document.getElementsByClassName("weatherToday__humidity--js")[0];
      humidityID.innerHTML = `${this.humidity} %`;
    }
  
    setWindSpeed() {
      const windSpeedID = document.getElementsByClassName("weatherToday__windSpeed--js")[0];
      windSpeedID.innerHTML = `${this.windSpped} m/s`;
    }
  
    setWeatherInformation() {
      this.setLocation();
      this.setDate();
      this.setTemp();
      this.setPressure();
      this.setHumidity();
      this.setWindSpeed();
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
  
    setImage() {
      const imageID = document.getElementsByClassName("weatherImage--js")[0];
      const weatherName = this.weatherIcon(this.iconName);
      imageID.src = `assets/img/${weatherName}`;
    }
    roundTemp(temp) {
      return Math.round((temp * 100)/100);
    }
  }