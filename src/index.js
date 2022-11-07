import './style.css';
import logoIcon from './assets/logo_white_cropped.png';
import { convertTempUnits, clearSearchInput } from './utilities';
import renderWeatherHandler from './render';

const weatherApp = {
  init() {
    const buttonSearch = document.querySelector('.search-btn');
    const unitsToggleButton = document.querySelector('.units-btn');
    const searchInput = document.querySelector('.search-input');
    document.querySelector('.header-logo').src = logoIcon;

    unitsToggleButton.addEventListener('click', convertTempUnits);

    buttonSearch.addEventListener('click', () => {
      if (!searchInput.value) return;
      renderWeatherHandler();
      clearSearchInput();
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        renderWeatherHandler();
        clearSearchInput();
      }
    });

    renderWeatherHandler();
  },
};

weatherApp.init();
