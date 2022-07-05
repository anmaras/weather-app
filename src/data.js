import { hideBackDrop } from './utilities';
import { apiKey, key } from './api/key';

const DEFAULT_CITY = 'Athens';

async function fetchWeather(lat, lon) {
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
}

async function fetchLocation() {
  const cityName = document.querySelector('#search').value || DEFAULT_CITY;
  try {
    const urlDirect = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
    );
    if (!urlDirect.ok) {
      const text = document.querySelector('.loading-text');
      text.textContent = `Couldn't find data for ${cityName}`;

      setTimeout(() => {
        hideBackDrop();
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
}

async function getData() {
  const location = await fetchLocation();
  const weatherData = await fetchWeather(
    location.coord.lat,
    location.coord.lon
  );

  return { location, weatherData };
}

export default getData;
