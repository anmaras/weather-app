import { hideBackDrop } from './utilities';

const DEFAULT_CITY = 'Athens';
const api_key_01 = process.env.API_KEY01;

async function fetchWeather(lat, lon) {
  try {
    const weather = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${api_key_01}&units=metric`,
      {
        mode: 'cors',
      }
    );

    if (!weather.ok) {
      throw new Error("Couldn't find city name");
    }
    return await weather.json();
  } catch (err) {
    console.error(err);
  }
}

async function fetchLocation() {
  const cityName = document.querySelector('#search').value || DEFAULT_CITY;
  try {
    const urlDirect = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.API_KEY02}&units=metric`,
      {
        mode: 'cors',
      }
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
    return await urlDirect.json();
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
