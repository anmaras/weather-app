import './style.css';
import apiKey from './api/key.js';
import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import logo from './assets/icons/logo/github.png';

const weatherApp = {
  tempSwitch: true,
  unitsType: '℃',
  defaultLat: 38.0657,
  defaultLon: 23.7628,

  init() {
    const buttonSearch = document.querySelector('.search-btn');
    const buttonFahrenheit = document.querySelector('.units-btn');
    const searchInput = document.querySelector('.search-input');
    buttonFahrenheit.addEventListener('click', weatherApp.convertTempUnits);
    document.querySelector('.header-logo').src = logo;
    // searchInput.addEventListener(
    //   'keypress',
    //   weatherApp.toggleLocationListVisibility
    // );

    buttonSearch.addEventListener('click', () => {
      this.toggleLocationListVisibility();
      weatherApp.getLocationOptions();
    });

    this.getCurrentAndForCastWeather();
    this.selectLocation();
    this.showBackDrop();
  },

  async getCurrentAndForCastWeather() {
    weatherApp.showBackDrop();
    try {
      // const test = await fetch(
      //   `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherApp.defaultLat}&lon=${weatherApp.defaultLon}&appid=04d4d495e39f2311c4acd1148b6e2130`
      // );
      const urlCurrent = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?&lat=${weatherApp.defaultLat}&lon=${weatherApp.defaultLon}&appid=${apiKey}&units=metric`
      );
      const urlForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?&lat=${weatherApp.defaultLat}&lon=${weatherApp.defaultLon}&appid=${apiKey}&units=metric`
      );
      if (!urlCurrent.ok && !urlForecast.ok) {
        throw new Error("Couldn't find city name");
      }
      // const anotherTest = await test.json();

      const currentData = await urlCurrent.json();
      const forecastData = await urlForecast.json();
      weatherApp.renderCurrentWeather(currentData);
      weatherApp.renderForecast(forecastData);
      weatherApp.hideBackDrop();
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
      // const urlDirect = await fetch(
      //   `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
      // );
      if (!urlDirect.ok) {
        throw new Error("Couldn't find lat and lon data");
      }
      const geoData = await urlDirect.json();
      weatherApp.renderLocation(geoData);
    } catch (err) {
      console.error(err);
    }
  },

  renderLocation(data) {
    const locations = document.querySelector('.geo-locations');
    if (locations.childNodes.length) {
      locations.replaceChildren();
    }
    data.map((location) => {
      let markup = `<li class="">
      <p><span class="location-name">${
        location.name
      }</span> <span class="location-lat d-none">${location.lat}</span>
      <span class="location-lon d-none">${location.lon}</span>
      ${location.state || ''} ,${location.country} </p>
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
      /* fetch weather after user click on selection */

      document.querySelector('.geo-locations').classList.add('d-none');

      // document.querySelector('#search').value = '';
      this.getCurrentAndForCastWeather();
    });
  },

  renderCurrentWeather(data) {
    const weatherInfo = document.querySelector('.weather-info');
    const weatherData = document.querySelector('.weather-data');
    const imgSrc = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    if (weatherInfo.childNodes.length || weatherData.childNodes.length) {
      weatherInfo.replaceChildren();
      weatherData.replaceChildren();
    }
    const markupInfo = `
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
    const markupData = `
                    <p class="humidity">
                       Humidity<span class="d-block">${data.main.humidity}%</span>
                    </p>
                    <p class="pressure">
                       Pressure<span class="d-block">${data.main.pressure} hPa</span>
                    </p>
                    <p class="temp-max">
                       Max temp <span class="temp">${data.main.temp_max}</span
                          ><span class="unit"> ${this.unitsType}</span>
                    </p>
                    <p class="temp-low">
                       Low temp <span class="temp">${data.main.temp_min}</span
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
