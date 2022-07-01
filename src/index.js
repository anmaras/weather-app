import './style.css';
import { apiKey, key } from './api/key.js';
import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import logoIcon from './assets/icons/logo/github.png';
import getTime from 'date-fns/getTime';

const weatherApp = {
  tempSwitch: true,
  unitsType: '℃',
  defaultCity: 'Athens',

  init() {
    const buttonSearch = document.querySelector('.search-btn');
    const buttonFahrenheit = document.querySelector('.units-btn');
    const searchInput = document.querySelector('.search-input');
    document.querySelector('.header-logo').src = logoIcon;

    buttonFahrenheit.addEventListener('click', weatherApp.convertTempUnits);
    buttonSearch.addEventListener('click', weatherApp.renderWeatherHandler);

    weatherApp.renderWeatherHandler();
  },

  async fetchWeather(lat, lon) {
    try {
      const test = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
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
    const cityName =
      document.querySelector('#search').value || weatherApp.defaultCity;
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
    const weatherData = await weatherApp.fetchWeather(
      location.coord.lat,
      location.coord.lon
    );

    return { location, weatherData };
  },

  async renderWeatherHandler() {
    weatherApp.showBackDrop();
    const locationAndWeatherData = await weatherApp.getData();
    weatherApp.hideBackDrop();
    const { location, weatherData } = locationAndWeatherData;

    console.log(location, weatherData);

    weatherApp.renderCurrentWeather(weatherData, location);
    weatherApp.renderHourlyForecast(weatherData);
    weatherApp.renderDailyForecast(weatherData);
    weatherApp.renderWeatherExtraData(weatherData);
    // weatherApp.renderWeatherDescription(weatherData, location);
    console.log(weatherData);
  },

  renderCurrentWeather(data, city) {
    const currentWeather = document.querySelector('.current-weather');
    if (currentWeather.childNodes.length) {
      currentWeather.replaceChildren();
    }
    const currentWeatherMarkup = `
<li class="city-name">${city.name}, ${city.sys.country}
</li>
<li class="current-temp "><span class="temp">${this.roundTempValue(
      data.current.temp
    )}</span><span class="unit">${this.unitsType}</span>
</li>
<li class="current-description ">${data.current.weather[0].description}
</li>
<li class="temp-max-low">
   H:<span class="temp">${this.roundTempValue(data.daily[0].temp.max)}</span
      ><span class="unit"> ${this.unitsType}</span>
   L: <span class="temp">${this.roundTempValue(data.daily[0].temp.min)}</span
      ><span class="unit"> ${this.unitsType}</span>
</li>
`;

    currentWeather.insertAdjacentHTML('afterbegin', currentWeatherMarkup);
  },

  renderWeatherDescription(data, city) {
    const weatherDescription = document.querySelector('.weather-description');
    const currentWeatherMarkup = `
                   Today in ${city.name} expect ${data.daily[0].weather[0].description}
                   with the temperatures reaching ${data.daily[0].feels_like.day} at day 
                   and ${data.daily[0].feels_like.night} at night.
                   `;

    weatherDescription.textContent = currentWeatherMarkup;
  },

  renderWeatherExtraData(data) {
    const weatherData = document.querySelector('.weather-data');
    if (weatherData.childNodes.length) {
      weatherData.replaceChildren();
    }
    const dataMarkup = `
                    <li class="humidity">
                       Humidity<span class="d-block">${data.current.humidity}%</span>
                    </li>
                    <li class="pressure">
                       Pressure<span class="d-block">${data.current.pressure} hPa</span>
                    </li>
                    <li class="uvi">
                       UV Index<span class="d-block">${data.current.uvi}</span>
                    </li>
                    <li class="wind-speed">
                       Wind Speed<span class="d-block">${data.current.wind_speed} km/h</span>
                    </li>
                    `;

    weatherData.insertAdjacentHTML('afterbegin', dataMarkup);
  },

  renderHourlyForecast(hData) {
    const forecast = document.querySelector('.hourly-weather');
    if (forecast.childNodes.length) {
      forecast.replaceChildren();
    }
    hData.hourly
      .filter((fItem, index) => {
        if (index <= 24) {
          return fItem;
        }
      })
      .forEach((fItem) => {
        const imgSrc = `http://openweathermap.org/img/wn/${fItem.weather[0].icon}@2x.png`;
        const markupForecast = `
      <li><p class="hourly-time">${this.getTodayForecastTime(
        fItem.dt,
        hData.timezone_offset
      )}</p>
      <img class="weather-img" src=${imgSrc} alt="weather image" />
      <p class="hourly-temp"><span class="temp">${this.roundTempValue(
        fItem.temp
      )}</span><span class="unit">${this.unitsType}</span>
      </p>
      </li>
      `;
        forecast.insertAdjacentHTML('afterbegin', markupForecast);
      });
  },

  renderDailyForecast(dData) {
    const dailyForecast = document.querySelector('.daily-weather');
    if (dailyForecast.childNodes.length) {
      dailyForecast.replaceChildren();
    }
    dData.daily.forEach((fItem, index) => {
      if (index > 0) {
        const imgSrc = `http://openweathermap.org/img/wn/${fItem.weather[0].icon}@2x.png`;
        const markupForecast = `
        <li><p>${this.getCurrentDay(fItem.dt, dData.timezone_offset)}</p>
        <img class="weather-img" src=${imgSrc} alt="weather image" />
        <p><span class="temp">${this.roundTempValue(
          fItem.temp.day
        )}</span><span class="unit">${this.unitsType}</span>
        </p>
        </li>
        `;

        dailyForecast.insertAdjacentHTML('afterbegin', markupForecast);
      }
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

  getTodayTime(dt, timezone) {
    return new Date(fromUnixTime(dt - timezone));
  },

  getTodayForecastTime(dt, timezone) {
    return format(new Date(fromUnixTime(dt - timezone)), 'HH:mm');
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
    return cToF.toFixed(0);
  },
  convertFtoC(f) {
    const fToC = ((f - 32) * 5) / 9;
    return fToC.toFixed(0);
  },

  roundTempValue(temp) {
    return Math.round(temp);
  },

  chanceOfRain(pop) {
    const chanceOfRain = pop * 100;
    return chanceOfRain.toFixed(0);
  },
};

weatherApp.init();
