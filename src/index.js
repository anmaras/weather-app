import './style.css';
import apiKey from './api/key.js';

const weatherApp = {
  units: 'metric',
  mode: 'weather',

  init: () => {
    const buttonFindMe = document.querySelector('.find-btn');
    const buttonSearch = document.querySelector('.search-btn');
    buttonSearch.addEventListener('click', weatherApp.newFunction);
    buttonFindMe.addEventListener('click', weatherApp.getUserPosition);
  },

  async newFunction() {
    const cityName = document.querySelector('#input').value;

    try {
      /* Fetch location data based user input 
      using openWeather geolocation API*/
      const location = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${apiKey}`
      );
      const locationData = await location.json();
      const lat = locationData[0].lat;
      const lon = locationData[0].lon;

      /* Fetch weather data based user input 
      using openWeather  API*/
      const urlForeCast = await fetch(
        `https://api.openweathermap.org/data/2.5/${weatherApp.mode}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${weatherApp.units}`
      );
      const weatherData = await urlForeCast.json();
    } catch (err) {
      console.error(err);
    }
  },

  /* Methods for find my location using js geolocation */
  geoError(error) {
    console.error(error.message);
  },

  geoSuccess(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(
      `https://api.openweathermap.org/data/2.5/${weatherApp.mode}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${weatherApp.units}`
    )
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
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
