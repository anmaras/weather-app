import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
let tempSwitch = true;

function convertTempUnits() {
  const tempValues = [...document.getElementsByClassName('temp')];
  const fahrenheitIcon = document.querySelector('.fahrenheit-symbol');
  const celsiusIcon = document.querySelector('.celsius-symbol');

  if (tempSwitch) {
    tempValues.forEach((value) => {
      value.textContent = convertCtoF(value.textContent);
      celsiusIcon.classList.remove('fw-bold');
      fahrenheitIcon.classList.add('fw-bold');
    });
  }
  if (!tempSwitch) {
    tempValues.forEach((value) => {
      value.textContent = convertFtoC(value.textContent);
      fahrenheitIcon.classList.remove('fw-bold');
      celsiusIcon.classList.add('fw-bold');
    });
  }

  tempSwitch = !tempSwitch;
}

function showBackDrop() {
  const backDrop = document.querySelector('.backdrop-container');

  backDrop.classList.remove('d-none');
}

function hideBackDrop() {
  const backDrop = document.querySelector('.backdrop-container');

  backDrop.classList.add('d-none');
}

function toggleLocationListVisibility() {
  const list = document.querySelector('.geo-locations');
  if (list.classList.contains('d-none')) {
    list.classList.toggle('d-none');
  }
}

function getCurrentDay(dt, timezone) {
  return format(new Date(fromUnixTime(dt - timezone)), 'EEEE');
}

function getTodayForecastTime(dt) {
  return format(fromUnixTime(dt), 'HH:mm');
}

function calcSunRiseSunset(sunrise) {
  return format(new Date(fromUnixTime(sunrise)), 'HH:mm');
}

function getCurrentTime() {
  return format(new Date(), 'HH:mm');
}

function convertCtoF(c) {
  const num = c.replace(/\D/g, '');
  const cToF = (num * 9) / 5 + 32;
  return cToF.toFixed(0) + '°F';
}

function convertFtoC(f) {
  const num = f.replace(/\D/g, '');
  const fToC = ((num - 32) * 5) / 9;
  return fToC.toFixed(0) + '°C';
}

function roundTempValue(temp) {
  return Math.round(temp);
}

function chanceOfRain(pop) {
  const chanceOfRain = pop * 100;
  return chanceOfRain.toFixed(0);
}

function clearSearchInput() {
  document.querySelector('.search-input').value = '';
}

export {
  showBackDrop,
  hideBackDrop,
  convertTempUnits,
  clearSearchInput,
  getCurrentDay,
  getTodayForecastTime,
  calcSunRiseSunset,
  getCurrentTime,
  roundTempValue,
};
