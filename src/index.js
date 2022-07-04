import './style.css';
import { apiKey, key } from './api/key.js';
import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import isTomorrow from 'date-fns/isTomorrow';
import logoIcon from './assets/icons/logo/github.png';

const weatherApp = {
  tempSwitch: true,
  defaultCity: 'Athens',

  init() {
    const buttonSearch = document.querySelector('.search-btn');
    const unitsToggleButton = document.querySelector('.units-btn');
    const searchInput = document.querySelector('.search-input');
    document.querySelector('.header-logo').src = logoIcon;

    unitsToggleButton.addEventListener('click', weatherApp.convertTempUnits);

    buttonSearch.addEventListener('click', () => {
      if (!searchInput.value) return;
      weatherApp.renderWeatherHandler();
      this.clearSearchInput();
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        weatherApp.renderWeatherHandler();
        this.clearSearchInput();
      }
    });

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
        const text = document.querySelector('.loading-text');
        text.textContent = `Couldn't find data for ${cityName}`;

        setTimeout(() => {
          weatherApp.hideBackDrop();
        }, 2000);

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

    weatherApp.renderCurrentWeather(weatherData, location);
    weatherApp.renderHourlyForecast(weatherData);
    weatherApp.renderDailyForecast(weatherData);
    weatherApp.renderWeatherExtraData(weatherData);
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
    )}°C</span>
</li>
<li class="current-description ">${data.current.weather[0].description}
</li>
<li class="temp-max-low">
   H: <span class="temp">${this.roundTempValue(data.daily[0].temp.max)}°C</span
      >
   L: <span class="temp">${this.roundTempValue(data.daily[0].temp.min)}°C</span
      >
</li>
`;

    currentWeather.insertAdjacentHTML('afterbegin', currentWeatherMarkup);
  },

  renderWeatherExtraData(data) {
    const weatherData = document.querySelector('.weather-data');
    if (weatherData.childNodes.length) {
      weatherData.replaceChildren();
    }
    const dataMarkup = `
    <li class="current-sunrise">
    Sunrise<span class="d-block">${this.calcSunRiseSunset(
      data.current.sunrise
    )}</span>
                       </li>
                       <li class="current-sunset">
                       Sunset<span class="d-block">${this.calcSunRiseSunset(
                         data.current.sunset
                       )}</span>
                       </li>
                       <li class="humidity">
                          Humidity<span class="d-block">${
                            data.current.humidity
                          }%</span>
                       </li>
                    <li class="current-feels-like">
                       Feels like<span class="d-block temp">${this.roundTempValue(
                         data.current.feels_like
                       )}°C</span>
                    </li>
                    <li class="current-pressure">
                       Pressure<span class="d-block">${
                         data.current.pressure
                       } hPa</span>
                    </li>
                    <li class="current-uvi">
                       UV Index<span class="d-block">${data.current.uvi}</span>
                    </li>
                    <li class="current-wind-speed">
                       Wind<span class="d-block">${
                         data.current.wind_speed
                       } km/h</span>
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
      .filter((fItem) => {
        if (
          isToday(fromUnixTime(fItem.dt)) ||
          isTomorrow(fromUnixTime(fItem.dt))
        ) {
          return fItem;
        }
      })
      .forEach((fItem) => {
        const imgSrc = `http://openweathermap.org/img/wn/${fItem.weather[0].icon}@2x.png`;
        const markupForecast = `
      <li>
      <p class="hourly-time">${this.getTodayForecastTime(fItem.dt)}</p>
      <img class="weather-img" src=${imgSrc} alt="weather image" />
      <p class="hourly-temp "><span class="temp">${this.roundTempValue(
        fItem.temp
      )}°C</span>
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
        <p class="daily-temp"><span class="temp">${this.roundTempValue(
          fItem.temp.max
        )}°C</span>/
        <span class="temp">${this.roundTempValue(fItem.temp.min)}°C</span></p>
        </li>
        `;

        dailyForecast.insertAdjacentHTML('afterbegin', markupForecast);
      }
    });
  },

  convertTempUnits() {
    const tempValues = [...document.getElementsByClassName('temp')];
    const fahrenheitIcon = document.querySelector('.fahrenheit-symbol');
    const celsiusIcon = document.querySelector('.celsius-symbol');

    if (weatherApp.tempSwitch) {
      tempValues.forEach((value) => {
        value.textContent = weatherApp.convertCtoF(value.textContent);
        celsiusIcon.classList.remove('fw-bold');
        fahrenheitIcon.classList.add('fw-bold');
      });
    }
    if (!weatherApp.tempSwitch) {
      tempValues.forEach((value) => {
        value.textContent = weatherApp.convertFtoC(value.textContent);
        fahrenheitIcon.classList.remove('fw-bold');
        celsiusIcon.classList.add('fw-bold');
      });
    }

    weatherApp.tempSwitch = !weatherApp.tempSwitch;
  },

  showBackDrop() {
    const backDrop = document.querySelector('.backdrop-container');

    backDrop.classList.remove('d-none');
  },

  hideBackDrop() {
    const backDrop = document.querySelector('.backdrop-container');

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

  getTodayForecastTime(dt) {
    return format(fromUnixTime(dt), 'HH:mm');
  },

  calcSunRiseSunset(sunrise) {
    return format(new Date(fromUnixTime(sunrise)), 'HH:mm');
  },

  getCurrentTime() {
    return format(new Date(), 'HH:mm');
  },

  convertCtoF(c) {
    const num = c.replace(/\D/g, '');
    const cToF = (num * 9) / 5 + 32;
    return cToF.toFixed(0) + '°F';
  },

  convertFtoC(f) {
    const num = f.replace(/\D/g, '');
    const fToC = ((num - 32) * 5) / 9;
    return fToC.toFixed(0) + '°C';
  },

  roundTempValue(temp) {
    return Math.round(temp);
  },

  chanceOfRain(pop) {
    const chanceOfRain = pop * 100;
    return chanceOfRain.toFixed(0);
  },

  clearSearchInput() {
    document.querySelector('.search-input').value = '';
  },
};

weatherApp.init();
