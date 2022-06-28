import './style.css';
import apiKey from './api/key.js';
import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
import myImage from './assets/icons/humidity/humidity_mid.png';

let test = true;

const weatherApp = {
  tempSwitch: true,
  units: 'metric',
  mode: 'forecast',
  defaultCity: 'athens',
  unitsType: '℃',
  defaultLat: 37.9755,
  defaultLon: 23.7349,

  init() {
    const buttonSearch = document.querySelector('.search-btn');
    const buttonFahrenheit = document.querySelector('.fahrenheit');
    buttonFahrenheit.addEventListener('click', weatherApp.convertTempUnits);

    buttonSearch.addEventListener('click', weatherApp.getLocationOptions);
    this.getWeather();
    this.selectLocation();
  },

  async getWeather() {
    try {
      const urlForeCast = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?&lat=${weatherApp.defaultLat}&lon=${weatherApp.defaultLon}&appid=${apiKey}&units=${weatherApp.units}`
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

  async getLocationOptions() {
    const cityName = document.querySelector('#search').value;
    try {
      const urlDirect = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${apiKey}&units=${weatherApp.units}&limit=5`
      );
      if (urlDirect.ok) {
        const geoData = await urlDirect.json();
        weatherApp.showLocation(geoData);
      } else {
        throw new Error("Couldn't find lat and lon data");
      }
    } catch (err) {
      console.error(err);
    }
  },

  showLocation(data) {
    const locations = document.querySelector('.geo-locations');
    if (locations.childNodes.length) {
      locations.replaceChildren();
    }
    data.map((location) => {
      let markup = `<li>
      <p><span class="location-name">${
        location.name
      }</span> <span class="location-lat d-none">${location.lat}</span> 
      <span class="location-lon d-none">${location.lon}</span> 
      ${location.state || ''} ${location.country} </p>
      </li>`;
      locations.insertAdjacentHTML('afterbegin', markup);
    });
  },

  selectLocation() {
    document.querySelector('.geo-locations').addEventListener('click', (e) => {
      const target = e.target.closest('p');
      if (target) {
        const selectionLat = target.querySelector('.location-lat');
        const selectionLon = target.querySelector('.location-lon');

        this.defaultLat = selectionLat.textContent;
        this.defaultLon = selectionLon.textContent;
      }
      weatherApp.getWeather();
    });
  },

  showWeather(data) {
    const firstSection = document.querySelector('.weather-info');
    const imgSrc = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    const markup = `
                   <img class="weather-img" src=${imgSrc} alt="weather image" />
                   <p class="weather-description">${
                     data.weather[0].description
                   }</p>
                   <p class="city-name">${data.name}, ${data.sys.country}</p>
                   <p class="weather-temp"><span class="temp">${
                     data.main.temp
                   }</span><span class="unit">${this.unitsType}</span>
                   </p>
                   <p class="feels-like">Feels Like <span class='temp'>${
                     data.main.feels_like
                   }</span><span class="unit">${this.unitsType}</span>
                   </p>
                   <p class="sunrise">Sunrise at ${this.getSunRise(
                     data.sys.sunrise
                   )}</p>
                   <p class="sunset">Sunset at ${this.getSunRise(
                     data.sys.sunset
                   )}</p>
                   <p class="current-time">Local time is ${this.getCurrentTime()}</p>
                   <p class="current-day"> ${this.getCurrentDay(
                     data.dt,
                     data.timezone
                   )}</p>
                   `;
    firstSection.insertAdjacentHTML('afterbegin', markup);
  },

  convertTempUnits() {
    const tempValues = [...document.getElementsByClassName('temp')];
    const tempUnits = [...document.getElementsByClassName('unit')];

    if (weatherApp.tempSwitch) {
      tempValues.forEach((value) => {
        value.textContent = weatherApp.convertCtoF(value.textContent);
      });
      tempUnits.forEach((value) => {
        value.textContent = '°F';
      });
    }
    if (!weatherApp.tempSwitch) {
      tempValues.forEach((value) => {
        value.textContent = weatherApp.convertFtoC(value.textContent);
        tempUnits.forEach((value) => {
          value.textContent = '°C';
        });
      });
    }
    this.textContent === '°C'
      ? (this.textContent = '°F')
      : (this.textContent = '°C');
    weatherApp.tempSwitch = !weatherApp.tempSwitch;
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
    const cToF = (c * 9) / 5 + 32;
    return cToF.toFixed(2);
  },
  convertFtoC(f) {
    const fToC = ((f - 32) * 5) / 9;
    return fToC.toFixed(2);
  },
};

weatherApp.init();
