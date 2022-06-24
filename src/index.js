import './style.css';
import apiKey from './api/key.js';

const weatherApp = {
  units: 'metric',
  mode: 'weather',

  init: () => {
    const buttonFindMe = document.querySelector('.findMe');
    buttonFindMe.addEventListener('click', weatherApp.newFunction);
  },

  async newFunction() {
    const cityName = document.querySelector('#input').value;

    try {
      const location = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${apiKey}`
      );
      const locationData = await location.json();
      const lat = locationData[0].lat;
      const lon = locationData[0].lon;
      const urlForeCast = await fetch(
        `https://api.openweathermap.org/data/2.5/${weatherApp.mode}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${weatherApp.units}`
      );
      const weatherData = await urlForeCast.json();
      console.log(weatherData);
    } catch (err) {
      console.error(err);
    }
  },

  // fetchWeather() {
  //   const lat = weatherApp.lat;
  //   const lon = weatherApp.lon;
  //   const units = 'metric';
  //   const mode = 'weather';
  //   const urlForeCast = `https://api.openweathermap.org/data/2.5/${mode}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

  //   fetch(urlForeCast, { mode: 'cors' })
  //     .then((response) => response.json())
  //     .then((response) => console.log(response)) //important data
  //     .catch((e) => console.error(e));
  // },

  // fetchLocation() {
  //   const cityName = document.querySelector('#input').value;
  //   const urlLocation = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  //   fetch(urlLocation, { mode: 'cors' })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error('Empty or not correct city name input');
  //       }
  //       return response.json();
  //     })
  //     .then((response) => {
  //       weatherApp.lat = response[0].lat;
  //       weatherApp.lon = response[0].lon;
  //     }) //important data
  //     .catch((e) => console.error(e));
  // },

  geoError(error) {
    console.error(error.message);
  },

  geoSuccess(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    console.log(lat, lon, position);
  },

  getUserPosition() {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      weatherApp.geoSuccess,
      weatherApp.geoError,
      options
    );
  },
};

weatherApp.init();
