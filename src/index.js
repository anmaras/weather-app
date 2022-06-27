import './style.css';
import apiKey from './api/key.js';
import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
import myImage from './assets/icons/humidity/humidity_mid.png';

const weatherApp = {
  units: 'metric',
  mode: 'forecast',
  defaultCity: 'athens',
  unitsType: '℃',

  init() {
    const buttonSearch = document.querySelector('.search-btn');
    buttonSearch.addEventListener('click', this.getWeather);
    /* For default location */
    this.getWeather();
  },

  async getWeather() {
    const cityName =
      document.querySelector('#search').value || weatherApp.defaultCity;
    try {
      const urlForeCast = await fetch(
        `https://api.openweathermap.org/data/2.5/${weatherApp.mode}?q=${cityName}&appid=${apiKey}&units=${weatherApp.units}`
      );
      if (!urlForeCast.ok) {
        throw new Error("Couldn't find city name");
      }
      const weatherData = await urlForeCast.json();
      weatherApp.showWeather(weatherData);
    } catch (err) {
      console.error(err);
    }
  },

  /* Methods for find my location using js geolocation */
  // getUserPosition() {
  //   const options = {
  //     enableHighAccuracy: true,
  //     timeout: 5000,
  //     maximumAge: 0,
  //   };

  //   navigator.geolocation.getCurrentPosition(
  //     weatherApp.geoSuccess,
  //     weatherApp.geoError,
  //     options
  //   );
  // },

  // geoError(error) {
  //   console.error(error.message);
  // },

  // geoSuccess(position) {
  //   const lat = position.coords.latitude;
  //   const lon = position.coords.longitude;

  //   fetch(
  //     `https://api.openweathermap.org/data/2.5/${weatherApp.mode}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${weatherApp.units}`
  //   )
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(response.statusText);
  //       }
  //       return response.json();
  //     })
  //     .then((response) => weatherApp.showWeather(response))
  //     .catch((error) => console.log(error));
  // },

  showWeather(data) {
    console.log(data);
    const { country, name, sunrise, sunset, timezone } = data.city;
    const {
      dt,
      weather: [{ icon, description }],
      main: { temp, feels_like, humidity, temp_max, temp_min },
    } = data.list[0];

    console.log(myImage);

    const weatherTemp = document.querySelector('.weather-temp');
    const weatherImg = document.querySelector('.weather-img');
    const cityName = document.querySelector('.city-name');
    const currentDay = document.querySelector('.current-day');
    const weatherInfo = document.querySelector('.weather-description');
    const feelLike = document.querySelector('.feels-like');
    const sunriseTime = document.querySelector('.sunrise');
    const sunsetTime = document.querySelector('.sunset');
    const currentTime = document.querySelector('.current-time');
    const humidityInput = document.querySelector('.humidity > span');
    const tempMax = document.querySelector('.temp-max > span');
    const tempLow = document.querySelector('.temp-low');
    cityName.textContent = `${name}, ${country}`;
    weatherImg.src = `http://openweathermap.org/img/w/${icon}.png`;
    weatherTemp.textContent = `${temp} ${this.unitsType}`;
    weatherInfo.textContent = `${description} `;
    feelLike.textContent = `Feels like ${feels_like}`;
    sunriseTime.textContent = `Sunrise at ${this.getSunRise(sunrise)}`;
    sunsetTime.textContent = `Sunset at ${this.getSunRise(sunset)}`;
    currentTime.textContent = `Local time is ${this.getCurrentTime()}`;
    humidityInput.textContent = `${humidity} %`;
    currentDay.textContent = this.getCurrentDay(dt, timezone);
    tempMax.textContent = `${temp_max} ${this.unitsType}`;
  },

  getCurrentDay(dt, timezone) {
    return format(new Date(fromUnixTime(dt - timezone)), 'EEEE');
  },

  getSunRise(sunrise) {
    return format(new Date(fromUnixTime(sunrise)), 'HH:mm:ss');
  },

  getSunRise(sunset) {
    return format(new Date(fromUnixTime(sunset)), 'HH:mm:ss');
  },

  getCurrentTime() {
    return format(new Date(), 'HH:mm:ss');
  },

  convertCtoF(c) {
    return (c * 9) / 5 + 32;
  },
  convertFtoC(f) {
    return ((f - 32) * 5) / 9;
  },
};

weatherApp.init();
