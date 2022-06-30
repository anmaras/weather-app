import './style.css';
import { apiKey, key } from './api/key.js';
import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import logoIcon from './assets/icons/logo/github.png';

const weatherApp = {
  tempSwitch: true,
  unitsType: '℃',
  defaultLat: 38.0657,
  defaultLon: 23.7628,

  init() {
    const buttonSearch = document.querySelector('.search-btn');
    const buttonFahrenheit = document.querySelector('.units-btn');
    const searchInput = document.querySelector('.search-input');
    document.querySelector('.header-logo').src = logoIcon;

    buttonFahrenheit.addEventListener('click', weatherApp.convertTempUnits);
    buttonSearch.addEventListener('click', weatherApp.getData);

    this.fetchWeather();
  },

  async fetchWeather(lat, lon) {
    const defaultLat = 38.0657;
    const defaultLon = 23.7628;
    try {
      const test = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${
          lat || defaultLat
        }&lon=${lon || defaultLon}&appid=${key}&units=metric`
      );

      if (!test.ok) {
        throw new Error("Couldn't find city name");
      }
      const weatherData = await test.json();

      return weatherData;
    } catch (err) {
      console.error(err);
    }
  },

  async fetchLocation() {
    const cityName = document.querySelector('#search').value;
    try {
      const urlDirect = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );
      if (!urlDirect.ok) {
        throw new Error(
          "Couldn't find lat and lon data need, to search for a city"
        );
      }
      const locationData = await urlDirect.json();
      return locationData;
    } catch (err) {
      console.error(err);
    }
  },

  async getData() {
    const location = await weatherApp.fetchLocation();
    const lat = location.coord.lat;
    const lon = location.coord.lon;
    const weatherData = await weatherApp.fetchWeather(lat, lon);

    console.log(weatherData);
    console.log(location);
    weatherApp.renderCurrentWeather(weatherData, location);
  },

  /* Test */

  renderCurrentWeather(data, city) {
    const weatherInfo = document.querySelector('.weather-info');
    const weatherData = document.querySelector('.weather-data');
    const imgSrc = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
    if (weatherInfo.childNodes.length || weatherData.childNodes.length) {
      weatherInfo.replaceChildren();
      weatherData.replaceChildren();
    }
    const markupInfo = `
                   <img class="weather-img" src=${imgSrc} alt="weather image" />
                   <p class="weather-description">${
                     data.current.weather[0].description
                   }</p>
                   <p class="city-name">${city.name}, ${city.sys.country}</p>
                   <p class="weather-temp"><span class="temp">${
                     data.current.temp
                   }</span><span class="unit">${this.unitsType}</span>
                   </p>
                   <p class="feels-like">Feels Like <span class='temp'>${
                     data.current.feels_like
                   }</span><span class="unit">${this.unitsType}</span>
                   </p>
                   <p class="sunrise">Sunrise at ${this.getSunRise(
                     city.sys.sunrise
                   )}</p>
                   <p class="sunset">Sunset at ${this.getSunRise(
                     city.sys.sunset
                   )}</p>
                   <p class="current-time">Local time is ${this.getCurrentTime()}</p>
                   <p class="current-day"> ${this.getCurrentDay(
                     city.dt,
                     city.timezone
                   )}</p>
                   `;
    const markupData = `
                    <p class="humidity">
                       Humidity<span class="d-block">${data.current.humidity}%</span>
                    </p>
                    <p class="pressure">
                       Pressure<span class="d-block">${data.current.pressure} hPa</span>
                    </p>
                    <p class="temp-max">
                       Max temp <span class="temp">${data.current.temp_max}</span
                          ><span class="unit"> ${this.unitsType}</span>
                    </p>
                    <p class="temp-low">
                       Low temp <span class="temp">${data.current.temp_min}</span
                          ><span class="unit"> ${this.unitsType}</span>
                    </p>
                    `;

    weatherInfo.insertAdjacentHTML('afterbegin', markupInfo);
    weatherData.insertAdjacentHTML('afterbegin', markupData);
  },

  renderForecast(fData) {
    const forecast = document.querySelector('.weather-forecast');
    if (forecast.childNodes.length) {
      forecast.replaceChildren();
    }
    fData.list
      .filter((fItem) => {
        let today = weatherApp.getCurrentTest(fItem.dt, fData.city.timezone);
        if (isToday(new Date(today))) {
          return fItem;
        }
      })
      .forEach((fItem) => {
        const imgSrc = `http://openweathermap.org/img/wn/${fItem.weather[0].icon}@2x.png`;
        const markupForecast = `
        <div><p>${fItem.dt_txt.slice(10, 16)}</p>
        <p>${fItem.weather[0].main}</p>
        <img class="weather-img" src=${imgSrc} alt="weather image" />
        <p><span class="temp">${fItem.main.temp}</span><span class="unit">${
          this.unitsType
        }</span>
        </p>
        </div>
        `;

        forecast.insertAdjacentHTML('afterbegin', markupForecast);
      });
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

  showBackDrop() {
    const backDrop = document.querySelector('.backdrop');

    backDrop.classList.remove('d-none');
  },

  hideBackDrop() {
    const backDrop = document.querySelector('.backdrop');

    backDrop.classList.add('d-none');
  },

  toggleLocationListVisibility() {
    const list = document.querySelector('.geo-locations');
    if (list.classList.contains('d-none')) {
      list.classList.toggle('d-none');
    }
  },

  getCurrentDay(dt, timezone) {
    return format(new Date(fromUnixTime(dt - timezone)), 'EEEE');
  },

  getCurrentTest(dt, timezone) {
    return new Date(fromUnixTime(dt - timezone));
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
