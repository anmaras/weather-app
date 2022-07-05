import isToday from 'date-fns/isToday';
import isTomorrow from 'date-fns/isTomorrow';
import fromUnixTime from 'date-fns/fromUnixTime';

import {
  showBackDrop,
  hideBackDrop,
  getCurrentDay,
  getTodayForecastTime,
  calcSunRiseSunset,
  roundTempValue,
} from './utilities';
import getData from './data';

function renderCurrentWeather(data, city) {
  const currentWeather = document.querySelector('.current-weather');
  if (currentWeather.childNodes.length) {
    currentWeather.replaceChildren();
  }
  const currentWeatherMarkup = `
    <li class="city-name">${city.name}, ${city.sys.country}</li>
    <li class="current-temp"><span class="temp">${roundTempValue(
      data.current.temp
    )}°C</span></li>
    <li class="current-description">${data.current.weather[0].description}</li>
    <li class="temp-max-low">
      H:
      <span class="temp">${roundTempValue(data.daily[0].temp.max)}°C</span> L:
      <span class="temp">${roundTempValue(data.daily[0].temp.min)}°C</span>
    </li>
    `;

  currentWeather.insertAdjacentHTML('afterbegin', currentWeatherMarkup);
}

function renderWeatherExtraData(data) {
  const weatherData = document.querySelector('.weather-data');
  if (weatherData.childNodes.length) {
    weatherData.replaceChildren();
  }
  const dataMarkup = `
    <li class="current-sunrise">
    Sunrise<span class="d-block">${calcSunRiseSunset(
      data.current.sunrise
    )}</span>
                       </li>
                       <li class="current-sunset">
                       Sunset<span class="d-block">${calcSunRiseSunset(
                         data.current.sunset
                       )}</span>
                       </li>
                       <li class="humidity">
                          Humidity<span class="d-block">${
                            data.current.humidity
                          }%</span>
                       </li>
                    <li class="current-feels-like">
                       Feels like<span class="d-block temp">${roundTempValue(
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
}

function renderHourlyForecast(hData) {
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
      <p class="hourly-time">${getTodayForecastTime(fItem.dt)}</p>
      <img class="weather-img" src=${imgSrc} alt="weather image" />
      <p class="hourly-temp "><span class="temp">${roundTempValue(
        fItem.temp
      )}°C</span>
      </p>
      </li>
      `;
      forecast.insertAdjacentHTML('afterbegin', markupForecast);
    });
}

function renderDailyForecast(dData) {
  const dailyForecast = document.querySelector('.daily-weather');
  if (dailyForecast.childNodes.length) {
    dailyForecast.replaceChildren();
  }
  dData.daily.forEach((fItem, index) => {
    if (index > 0) {
      const imgSrc = `http://openweathermap.org/img/wn/${fItem.weather[0].icon}@2x.png`;
      const markupForecast = `
        <li><p>${getCurrentDay(fItem.dt, dData.timezone_offset)}</p>
        <img class="weather-img" src=${imgSrc} alt="weather image" />
        <p class="daily-temp"><span class="temp">${roundTempValue(
          fItem.temp.max
        )}°C</span>/
        <span class="temp">${roundTempValue(fItem.temp.min)}°C</span></p>
        </li>
        `;

      dailyForecast.insertAdjacentHTML('afterbegin', markupForecast);
    }
  });
}

async function renderWeatherHandler() {
  showBackDrop();
  const locationAndWeatherData = await getData();
  hideBackDrop();
  const { location, weatherData } = locationAndWeatherData;

  renderCurrentWeather(weatherData, location);
  renderHourlyForecast(weatherData);
  renderDailyForecast(weatherData);
  renderWeatherExtraData(weatherData);
}

export default renderWeatherHandler;
