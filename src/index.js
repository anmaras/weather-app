import './style.css';
import apiKey from './api/key.js';

const weatherApp = {
  units: 'metric',
  mode: 'forecast',

  init: () => {
    const buttonFindMe = document.querySelector('.find-btn');
    const buttonSearch = document.querySelector('.search-btn');
    buttonSearch.addEventListener('click', weatherApp.newFunction);
    buttonFindMe.addEventListener('click', weatherApp.getUserPosition);
  },

  async newFunction() {
    const cityName = document.querySelector('#input').value;
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

  geoError(error) {
    console.error(error.message);
  },

  geoSuccess(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(
      `https://api.openweathermap.org/data/2.5/${weatherApp.mode}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${weatherApp.units}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((response) => weatherApp.showWeather(response))
      .catch((error) => console.log(error));
  },

  showWeather(data) {
    console.log(data);
    // data.list.map((items, index) => {
    //   if (index <= 8) {
    //     console.log(items);
    //   }
    // });
    // const date = new Date(data.list[0].dt * 1000);
  },

  convertCtoF(c) {
    return (c * 9) / 5 + 32;
  },
  convertFtoC(f) {
    return ((f - 32) * 5) / 9;
  },
};

weatherApp.init();
