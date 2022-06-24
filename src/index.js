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

  /* Methods for find my location  */
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
