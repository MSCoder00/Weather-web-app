/**
 * Aura Weather - Complete Application Architecture
 * Features:
 * - Speed: Stale-While-Revalidate caching, skeleton states, single-request weather + parallel air quality.
 * - Stacking Context Fix: Search dropdown strictly visible above cards with flag emojis & full locations.
 * - World Live Weather: Embedded countries dataset with batched live temperature fetching.
 * - Responsive: Mobile-first layout, bottom navigation bar, touch snap scrolling.
 * - New Features: Favorites, Recent Searches, Air Quality (AQI), Hourly Chart, Moon Phase, Dew Point,
 *   Smart Insights, City Comparison, Severe Weather Alerts, Voice Search, Share API, PWA Service Worker.
 */

(function () {
  'use strict';

  // --- Global Application State ---
  const state = {
    unit: localStorage.getItem('aura_unit') || 'C', // 'C' or 'F'
    colorTheme: localStorage.getItem('aura_theme') || 'dark', // 'dark' | 'light' | 'auto'
    timeFormat: localStorage.getItem('aura_time_format') || '12', // '12' or '24'
    defaultCity: localStorage.getItem('aura_default_city') || 'London,GB,51.5074,-0.1278',
    favorites: JSON.parse(localStorage.getItem('aura_favorites') || '[]'),
    recentSearches: JSON.parse(localStorage.getItem('aura_recents') || '[]'),

    currentLocation: {
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      region: 'England',
      lat: 51.5074,
      lon: -0.1278,
      timezone: 'Europe/London'
    },

    weatherData: null,
    airQualityData: null,
    lastUpdatedTime: null,
    activeView: 'home', // 'home' | 'world'
    
    // World countries dataset & batch cache
    countries: [],
    worldWeatherCache: new Map(), // key: `${lat},${lon}`, val: { tempC, code, isDay, time }
    worldBatchQueue: new Set(),
    worldFilterContinent: 'all',
    worldSortOrder: 'name',

    // Country City Browser state
    activeCountry: null,
    countryCities: [],
    activeDivision: 'all',
    citySearchTerm: '',
    citySortOrder: 'name',
    citiesPage: 1,
    citiesPerPage: 24,
    cityWeatherCache: new Map(),

    // Timers & Controllers
    autoRefreshTimer: null,
    clockTimer: null,
    searchAbortController: null
  };

  // --- DOM Element References ---
  const DOM = {
    body: document.body,
    canvas: document.getElementById('weatherCanvas'),

    // Views
    homeView: document.getElementById('homeWeatherView'),
    worldView: document.getElementById('worldWeatherView'),
    compareView: null,
    navTabBtns: document.querySelectorAll('.nav-tab-btn, .bottom-nav-item'),
    brandLogoBtn: document.getElementById('brandLogoBtn'),

    // Banners
    severeBanner: document.getElementById('severeWeatherBanner'),
    severeText: document.getElementById('severeWeatherText'),
    closeSevereBtn: document.getElementById('closeSevereBannerBtn'),
    locationBanner: document.getElementById('locationNoticeBanner'),
    locationText: document.getElementById('locationNoticeText'),
    tryAgainLocationBtn: document.getElementById('tryAgainLocationBtn'),
    closeNoticeBtn: document.getElementById('closeNoticeBtn'),
    errorBanner: document.getElementById('errorBanner'),
    errorMessageText: document.getElementById('errorMessageText'),
    retryErrorBtn: document.getElementById('retryErrorBtn'),

    // Top Header & Search
    citySearchInput: document.getElementById('citySearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    voiceSearchBtn: document.getElementById('voiceSearchBtn'),
    searchSpinner: document.getElementById('searchSpinner'),
    searchResultsList: document.getElementById('searchResultsList'),

    // Header Controls
    myLocationBtn: document.getElementById('myLocationBtn'),
    unitToggleContainer: document.getElementById('unitToggleContainer'),
    unitBtnC: document.getElementById('unitBtnC'),
    unitBtnF: document.getElementById('unitBtnF'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeToggleIconPlaceholder: document.getElementById('themeToggleIconPlaceholder'),
    manualRefreshBtn: document.getElementById('manualRefreshBtn'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    mobileSettingsBtn: document.getElementById('mobileSettingsBtn'),
    moreActionsBtn: document.getElementById('moreActionsBtn'),
    moreMenuDropdown: document.getElementById('moreMenuDropdown'),
    menuThemeBtn: document.getElementById('menuThemeBtn'),
    menuSettingsBtn: document.getElementById('menuSettingsBtn'),
    liveBadge: document.querySelector('.live-badge'),

    // Hero Section
    heroCityName: document.getElementById('heroCityName'),
    heroCountryTag: document.getElementById('heroCountryTag'),
    heroDateTime: document.getElementById('heroDateTime'),
    toggleFavoriteBtn: document.getElementById('toggleFavoriteBtn'),
    shareCityBtn: document.getElementById('shareCityBtn'),
    conditionText: document.getElementById('conditionText'),
    heroTemperature: document.getElementById('heroTemperature'),
    heroTempUnit: document.getElementById('heroTempUnit'),
    heroFeelsLike: document.getElementById('heroFeelsLike'),
    heroHighTemp: document.getElementById('heroHighTemp'),
    heroLowTemp: document.getElementById('heroLowTemp'),
    heroIconContainer: document.getElementById('heroIconContainer'),

    // Hourly Strip & Chart
    hourlyContainer: document.getElementById('hourlyContainer'),
    scrollHourlyLeft: document.getElementById('scrollHourlyLeft'),
    scrollHourlyRight: document.getElementById('scrollHourlyRight'),
    hourlyChartSvg: document.getElementById('hourlyChartSvg'),

    // Metrics Grid
    aqiNumber: document.getElementById('aqiNumber'),
    aqiStatusBadge: document.getElementById('aqiStatusBadge'),
    aqiAdviceText: document.getElementById('aqiAdviceText'),
    pm25Val: document.getElementById('pm25Val'),
    pm10Val: document.getElementById('pm10Val'),

    windSpeedValue: document.getElementById('windSpeedValue'),
    windUnitText: document.getElementById('windUnitText'),
    windCompassArrow: document.getElementById('windCompassArrow'),
    windDirectionText: document.getElementById('windDirectionText'),
    windGustText: document.getElementById('windGustText'),

    // Sun Arc
    sunPositionOrb: document.getElementById('sunPositionOrb'),
    sunTraveledPath: document.getElementById('sunTraveledPath'),
    sunriseTimeText: document.getElementById('sunriseTimeText'),
    sunsetTimeText: document.getElementById('sunsetTimeText'),
    daylightRemainingText: document.getElementById('daylightRemainingText'),

    // 5-Day Forecast
    fiveDayForecastList: document.getElementById('fiveDayForecastList'),

    // World Page
    continentChips: document.querySelectorAll('.continent-chip'),
    worldSortSelect: document.getElementById('worldSortSelect'),
    countriesGrid: document.getElementById('countriesGrid'),

    // Footer
    dataSourceAttribution: document.getElementById('dataSourceAttribution'),
    lastUpdatedNotice: document.getElementById('lastUpdatedNotice'),

    // World & Country City Browser
    allCountriesContainer: document.getElementById('allCountriesContainer'),
    countryCityBrowserView: document.getElementById('countryCityBrowserView'),
    backToCountriesBtn: document.getElementById('backToCountriesBtn'),
    countryDetailFlag: document.getElementById('countryDetailFlag'),
    countryDetailName: document.getElementById('countryDetailName'),
    countryDetailSubtitle: document.getElementById('countryDetailSubtitle'),
    countryDivisionsStrip: document.getElementById('countryDivisionsStrip'),
    countryCitySearchInput: document.getElementById('countryCitySearchInput'),
    countryCitySortSelect: document.getElementById('countryCitySortSelect'),
    countryCitiesGrid: document.getElementById('countryCitiesGrid'),
    loadMoreCitiesBtn: document.getElementById('loadMoreCitiesBtn'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    timeFormatSelect: document.getElementById('timeFormatSelect'),
    themePreferenceSelect: document.getElementById('themePreferenceSelect'),
    defaultCitySelect: document.getElementById('defaultCitySelect'),
    clearCacheBtn: document.getElementById('clearCacheBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    cancelSettingsBtn: document.getElementById('cancelSettingsBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn')
  };

  // --- Dynamic Particle Canvas Background Engine (Lightweight, DPR scaled & Pauses on Hidden) ---
  const CanvasEngine = {
    ctx: null,
    width: 0,
    height: 0,
    particles: [],
    animationFrameId: null,
    currentTheme: 'clear-day',
    isRunning: false,

    init() {
      if (!DOM.canvas) return;
      this.ctx = DOM.canvas.getContext('2d');
      this.resize();

      let resizeTimer = null;
      const debouncedResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.resize(), 150);
      };

      window.addEventListener('resize', debouncedResize, { passive: true });
      window.addEventListener('orientationchange', debouncedResize, { passive: true });

      // Pause canvas loop when tab is hidden to save CPU/battery
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });

      this.start();
    },

    resize() {
      if (!DOM.canvas || !this.ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.width = w;
      this.height = h;
      DOM.canvas.width = Math.floor(w * dpr);
      DOM.canvas.height = Math.floor(h * dpr);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.createParticles();
    },

    setTheme(theme) {
      if (this.currentTheme === theme) return;
      this.currentTheme = theme;
      this.createParticles();
    },

    createParticles() {
      this.particles = [];
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const count = window.innerWidth < 768 ? 20 : 35; // Lower particle count for max performance

      if (this.currentTheme === 'rain') {
        for (let i = 0; i < count * 1.5; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            length: Math.random() * 16 + 10,
            speedY: Math.random() * 10 + 8,
            speedX: -2,
            opacity: Math.random() * 0.35 + 0.15
          });
        }
      } else if (this.currentTheme === 'snow') {
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 2.5 + 1,
            speedY: Math.random() * 1.2 + 0.4,
            speedX: Math.random() * 0.8 - 0.4,
            opacity: Math.random() * 0.6 + 0.2
          });
        }
      } else if (this.currentTheme === 'clear-night' || this.currentTheme === 'clouds-night') {
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 1.4 + 0.6,
            alpha: Math.random(),
            speedAlpha: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
          });
        }
      } else {
        // Solar warm dust particles
        for (let i = 0; i < count * 0.5; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 2 + 1,
            speedY: -(Math.random() * 0.3 + 0.1),
            speedX: Math.random() * 0.3 - 0.15,
            opacity: Math.random() * 0.25 + 0.1
          });
        }
      }
    },

    start() {
      if (this.isRunning) return;
      this.isRunning = true;

      const render = () => {
        if (!this.isRunning) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.currentTheme === 'rain') {
          this.ctx.strokeStyle = '#38BDF8';
          this.ctx.lineWidth = 1.2;
          for (const p of this.particles) {
            this.ctx.globalAlpha = p.opacity;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.speedX, p.y + p.length);
            this.ctx.stroke();

            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y > this.height) {
              p.y = -p.length;
              p.x = Math.random() * this.width;
            }
          }
        } else if (this.currentTheme === 'snow') {
          this.ctx.fillStyle = '#FFFFFF';
          for (const p of this.particles) {
            this.ctx.globalAlpha = p.opacity;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y > this.height) {
              p.y = -5;
              p.x = Math.random() * this.width;
            }
          }
        } else if (this.currentTheme === 'clear-night' || this.currentTheme === 'clouds-night') {
          this.ctx.fillStyle = '#FFFFFF';
          for (const p of this.particles) {
            p.alpha += p.speedAlpha;
            if (p.alpha <= 0.1 || p.alpha >= 0.9) p.speedAlpha *= -1;
            this.ctx.globalAlpha = Math.max(0.05, Math.min(1, p.alpha));
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
          }
        } else {
          this.ctx.fillStyle = '#FFE082';
          for (const p of this.particles) {
            this.ctx.globalAlpha = p.opacity;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y < 0) {
              p.y = this.height + 5;
              p.x = Math.random() * this.width;
            }
          }
        }

        this.animationFrameId = requestAnimationFrame(render);
      };

      this.animationFrameId = requestAnimationFrame(render);
    },

    stop() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  };

  // --- Weather Codes & Condition Logic ---
  function parseWmoCode(code, isDay = true) {
    switch (code) {
      case 0:
        return { text: isDay ? 'Sunny' : 'Clear Sky', code: 'clear' };
      case 1:
        return { text: isDay ? 'Mainly Clear' : 'Mostly Clear', code: 'clear' };
      case 2:
        return { text: 'Partly Cloudy', code: 'clouds' };
      case 3:
        return { text: 'Overcast', code: 'overcast' };
      case 45:
      case 48:
        return { text: 'Foggy & Mist', code: 'fog' };
      case 51:
      case 53:
      case 55:
        return { text: 'Drizzle', code: 'rain' };
      case 56:
      case 57:
        return { text: 'Freezing Drizzle', code: 'snow' };
      case 61:
        return { text: 'Light Rain', code: 'rain' };
      case 63:
        return { text: 'Moderate Rain', code: 'rain' };
      case 65:
        return { text: 'Heavy Rain', code: 'rain' };
      case 66:
      case 67:
        return { text: 'Freezing Rain', code: 'snow' };
      case 71:
        return { text: 'Light Snow', code: 'snow' };
      case 73:
        return { text: 'Moderate Snow', code: 'snow' };
      case 75:
        return { text: 'Heavy Snow', code: 'snow' };
      case 77:
        return { text: 'Snow Flurries', code: 'snow' };
      case 80:
      case 81:
      case 82:
        return { text: 'Showers', code: 'rain' };
      case 85:
      case 86:
        return { text: 'Snow Showers', code: 'snow' };
      case 95:
        return { text: 'Thunderstorm', code: 'thunderstorm' };
      case 96:
      case 99:
        return { text: 'Thunderstorm & Hail', code: 'thunderstorm' };
      default:
        return { text: 'Partly Cloudy', code: 'clouds' };
    }
  }

  function getWindDirection(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((deg % 360) / 22.5) % 16;
    return `${directions[index]} (${Math.round(deg)}°)`;
  }

  function getAirQualityDetails(aqi) {
    if (aqi <= 20) return { label: 'Good', class: 'aqi-good', advice: 'Air quality is pristine and healthy.' };
    if (aqi <= 40) return { label: 'Fair', class: 'aqi-good', advice: 'Acceptable quality for all activities.' };
    if (aqi <= 60) return { label: 'Moderate', class: 'aqi-moderate', advice: 'Sensitive individuals should limit prolonged exertion.' };
    if (aqi <= 80) return { label: 'Poor', class: 'aqi-unhealthy', advice: 'Unhealthy for sensitive groups; reduce outdoor workouts.' };
    return { label: 'Hazardous', class: 'aqi-hazardous', advice: 'Health alert: avoid outdoor exertion.' };
  }

  // --- Temperature & Unit Converters with Smooth Count-Up ---
  function toUnitTemp(celsius) {
    if (celsius === null || celsius === undefined || isNaN(celsius)) return null;
    return state.unit === 'F' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
  }

  function formatTemp(celsius) {
    const val = toUnitTemp(celsius);
    return val === null ? '--' : `${val}`;
  }

  function formatSpeed(kmh) {
    if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
    return state.unit === 'F' ? Math.round(kmh * 0.621371) : Math.round(kmh);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function animateCountUp(element, targetVal) {
    if (!element || targetVal === null || isNaN(targetVal)) return;
    const startVal = parseInt(element.textContent, 10);
    if (isNaN(startVal)) {
      element.textContent = targetVal;
      return;
    }

    const duration = 400; // ms
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const current = Math.round(startVal + (targetVal - startVal) * progress);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = targetVal;
      }
    };

    requestAnimationFrame(step);
  }

  // --- API Integrations (Single Request + Parallel Air Quality) ---

  /**
   * Fetches full weather in ONE single Open-Meteo call,
   * runs air quality request in parallel with Promise.all.
   */
  async function fetchCombinedWeatherData(lat, lon, locationInfo = {}) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5&timezone=auto`;

    // Promise.all for speed - ZERO request chaining
    const [wRes, aRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl).catch(() => null)
    ]);

    if (!wRes.ok) {
      throw new Error(`Open-Meteo failed with HTTP ${wRes.status}`);
    }

    const wData = await wRes.json();
    let aData = null;
    if (aRes && aRes.ok) {
      try { aData = await aRes.json(); } catch (e) {}
    }

    return normalizeWeatherAndAirQuality(wData, aData, locationInfo);
  }

  function normalizeWeatherAndAirQuality(w, aqi, locInfo) {
    const cur = w.current;
    const isDay = cur.is_day === 1;
    const cond = parseWmoCode(cur.weather_code, isDay);

    // Hourly Forecast (All 24 hours in 1-hour steps in location's timezone)
    const nowIso = new Date().toISOString().slice(0, 13);
    let startIdx = w.hourly.time.findIndex(t => t.startsWith(nowIso));
    if (startIdx < 0) startIdx = 0;

    const hourly = [];
    const hourlyTemps = [];
    const targetTz = w.timezone || 'UTC';

    for (let i = startIdx; i < Math.min(startIdx + 24, w.hourly.time.length); i++) {
      const timeStr = w.hourly.time[i];
      const d = new Date(timeStr);
      const isNow = i === startIdx;

      let formattedHour;
      try {
        formattedHour = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          hour12: state.timeFormat === '12',
          timeZone: targetTz
        }).format(d);
      } catch (e) {
        formattedHour = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: state.timeFormat === '12' });
      }

      const localHour = parseInt(timeStr.slice(11, 13), 10) || d.getHours();
      const isDayHour = localHour >= 6 && localHour < 20;
      const stepCond = parseWmoCode(w.hourly.weather_code[i], isDayHour);

      hourly.push({
        timeString: isNow ? 'Now' : formattedHour,
        epoch: d.getTime() / 1000,
        tempC: w.hourly.temperature_2m[i],
        condition: stepCond.text,
        conditionCode: stepCond.code,
        pop: w.hourly.precipitation_probability ? w.hourly.precipitation_probability[i] || 0 : 0,
        isDay: isDayHour
      });

      hourlyTemps.push({
        hourLabel: isNow ? 'Now' : formattedHour,
        tempC: w.hourly.temperature_2m[i]
      });
    }

    // 5-Day Daily Forecast
    const daily = [];
    const dailyLen = Math.min(5, w.daily.time.length);
    for (let i = 0; i < dailyLen; i++) {
      const d = new Date(w.daily.time[i]);
      const isToday = i === 0;
      const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayCond = parseWmoCode(w.daily.weather_code[i], true);

      daily.push({
        dayName,
        dateString,
        condition: dayCond.text,
        conditionCode: dayCond.code,
        tempMinC: w.daily.temperature_2m_min[i],
        tempMaxC: w.daily.temperature_2m_max[i],
        pop: w.daily.precipitation_probability_max ? w.daily.precipitation_probability_max[i] || 0 : 0,
        isToday
      });
    }

    // Sunrise & Sunset
    const sunriseStr = w.daily.sunrise[0] ? w.daily.sunrise[0].split('T')[1] : '06:00';
    const sunsetStr = w.daily.sunset[0] ? w.daily.sunset[0].split('T')[1] : '18:00';
    const sunriseEpoch = new Date(w.daily.sunrise[0]).getTime() / 1000;
    const sunsetEpoch = new Date(w.daily.sunset[0]).getTime() / 1000;

    // Air Quality
    let aqiVal = 25;
    let pm25 = 8;
    let pm10 = 15;
    if (aqi && aqi.current) {
      aqiVal = aqi.current.european_aqi || aqi.current.us_aqi || 25;
      pm25 = Math.round(aqi.current.pm2_5 || 8);
      pm10 = Math.round(aqi.current.pm10 || 15);
    }

    return {
      location: {
        city: locInfo.city || 'Detected Location',
        country: locInfo.country || '',
        countryCode: locInfo.countryCode || '',
        region: locInfo.region || '',
        lat: w.latitude,
        lon: w.longitude,
        timezone: w.timezone,
        timezoneOffset: w.utc_offset_seconds || 0
      },
      current: {
        tempC: cur.temperature_2m,
        feelsLikeC: cur.apparent_temperature,
        tempMinC: w.daily.temperature_2m_min[0],
        tempMaxC: w.daily.temperature_2m_max[0],
        windSpeedKmh: cur.wind_speed_10m,
        windDirectionDeg: cur.wind_direction_10m,
        condition: cond.text,
        conditionCode: cond.code,
        weatherCode: cur.weather_code,
        isDay,
        sunriseEpoch,
        sunsetEpoch,
        sunriseStr,
        sunsetStr
      },
      airQuality: {
        aqi: aqiVal,
        pm25,
        pm10
      },
      hourly,
      hourlyTemps,
      daily
    };
  }

  // --- Stale-While-Revalidate Engine ---
  async function loadWeather(lat, lon, locationInfo = {}, isBackgroundRefresh = false) {
    hideError();

    // If not a background refresh, render cached state if present for 0ms load speed
    if (!isBackgroundRefresh && !state.weatherData) {
      renderSkeletonHero();
    }

    try {
      const data = await fetchCombinedWeatherData(lat, lon, locationInfo);

      state.weatherData = data;
      state.currentLocation = data.location;
      state.lastUpdatedTime = new Date();

      // Persist in localStorage for instant reload on next visit (Stale-While-Revalidate)
      localStorage.setItem('aura_last_weather', JSON.stringify(data));
      localStorage.setItem('aura_last_location', JSON.stringify(data.location));

      renderAll();
    } catch (err) {
      console.error('Weather load error:', err);
      if (!state.weatherData) {
        showError('Unable to fetch weather data. Please check your connection and try again.');
      }
    }
  }

  function renderSkeletonHero() {
    DOM.heroTemperature.textContent = '--';
    DOM.heroFeelsLike.textContent = '--°';
    DOM.heroHighTemp.textContent = '--°';
    DOM.heroLowTemp.textContent = '--°';
  }

  // --- UI Rendering Controllers ---
  function renderAll() {
    if (!state.weatherData) return;
    const d = state.weatherData;
    const cur = d.current;

    // 1. Theme & Canvas Atmosphere
    updateTheme(cur.conditionCode, cur.isDay);

    // 2. Check Severe Weather Banner
    checkSevereWeather(cur);

    // 3. Hero Section
    renderHero(d);

    // 4. Hourly Forecast & Chart
    renderHourly(d.hourly);
    renderHourlyChart(d.hourlyTemps);

    // 5. Atmospheric Highlights (Air Quality, Wind & Compass, Sun Cycle)
    renderMetrics(cur, d.airQuality);

    // 6. 5-Day Forecast
    renderFiveDay(d.daily);

    // 7. Footer & Live Clock
    renderFooter();
    startLocalClock(d.location.timezone, d.location.timezoneOffset);

    // 8. Update Favorite Star State
    updateFavoriteButtonState();
  }

  function updateTheme(conditionCode, isDay) {
    let condTheme = 'clear-day';
    if (conditionCode === 'thunderstorm') condTheme = 'thunderstorm';
    else if (conditionCode === 'snow') condTheme = 'snow';
    else if (conditionCode === 'rain') condTheme = 'rain';
    else if (conditionCode === 'fog') condTheme = 'fog';
    else if (conditionCode === 'clouds' || conditionCode === 'overcast') condTheme = isDay ? 'clouds-day' : 'clouds-night';
    else condTheme = isDay ? 'clear-day' : 'clear-night';

    DOM.body.setAttribute('data-condition-theme', condTheme);
    DOM.body.setAttribute('data-color-theme', state.colorTheme);
    CanvasEngine.setTheme(condTheme);
  }

  function checkSevereWeather(cur) {
    let severeMsg = null;
    if (cur.conditionCode === 'thunderstorm' || cur.weatherCode >= 95) {
      severeMsg = 'Severe Thunderstorm Warning in effect. Lightning and heavy rainfall expected; stay indoors.';
    } else if (cur.windSpeedKmh > 60) {
      severeMsg = `High Wind Alert: Gale force winds reaching ${formatSpeed(cur.windSpeedKmh)} ${state.unit === 'F' ? 'mph' : 'km/h'}. Secure loose objects.`;
    } else if (cur.tempC >= 38) {
      severeMsg = 'Excessive Heat Warning: Stay hydrated and avoid strenuous outdoor activity during midday.';
    } else if (cur.tempC <= -10) {
      severeMsg = 'Severe Cold Warning: Sub-zero freezing temperatures. Wear insulated thermal layers.';
    }

    if (severeMsg) {
      DOM.severeText.textContent = severeMsg;
      DOM.severeBanner.classList.add('active');
    } else {
      DOM.severeBanner.classList.remove('active');
    }
  }

  function renderHero(data) {
    const cur = data.current;
    const loc = data.location;

    DOM.heroCityName.textContent = loc.city || 'Detected Location';
    DOM.heroCountryTag.textContent = loc.countryCode ? `· ${loc.countryCode}` : (loc.country || '');
    DOM.conditionText.textContent = cur.condition;

    // Animate count-up for hero temperature
    const targetTemp = toUnitTemp(cur.tempC);
    animateCountUp(DOM.heroTemperature, targetTemp);
    DOM.heroTempUnit.textContent = `°${state.unit}`;

    DOM.heroFeelsLike.textContent = `${formatTemp(cur.feelsLikeC)}°`;
    DOM.heroHighTemp.textContent = `${formatTemp(cur.tempMaxC)}°`;
    DOM.heroLowTemp.textContent = `${formatTemp(cur.tempMinC)}°`;

    // Dynamic Weather Summary removed

    // Weather Icon
    DOM.heroIconContainer.innerHTML = getWeatherIcon(cur.conditionCode, cur.isDay);
  }

  function renderHourly(hourlyList) {
    DOM.hourlyContainer.innerHTML = '';

    hourlyList.forEach((hour, idx) => {
      const card = document.createElement('div');
      card.className = `hourly-card ${idx === 0 ? 'active-now' : ''}`;

      const iconSvg = getWeatherIcon(hour.conditionCode, hour.isDay);
      const popBadge = hour.pop > 0 
        ? `<span class="hourly-pop">${WeatherIcons.rainDropSmall} ${hour.pop}%</span>`
        : '';

      card.innerHTML = `
        <span class="hourly-time">${hour.timeString}</span>
        <div class="hourly-icon">${iconSvg}</div>
        <span class="hourly-temp">${formatTemp(hour.tempC)}°</span>
        ${popBadge}
      `;

      DOM.hourlyContainer.appendChild(card);
    });

    requestAnimationFrame(() => updateHourlyScrollButtons());
  }

  function updateHourlyScrollButtons() {
    const container = DOM.hourlyContainer;
    if (!container) return;
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    const left = container.scrollLeft;

    if (DOM.scrollHourlyLeft) {
      const disabled = left <= 2;
      DOM.scrollHourlyLeft.disabled = disabled;
      DOM.scrollHourlyLeft.style.opacity = disabled ? '0.35' : '1';
      DOM.scrollHourlyLeft.style.pointerEvents = disabled ? 'none' : 'auto';
    }
    if (DOM.scrollHourlyRight) {
      const disabled = left >= maxScroll - 2;
      DOM.scrollHourlyRight.disabled = disabled;
      DOM.scrollHourlyRight.style.opacity = disabled ? '0.35' : '1';
      DOM.scrollHourlyRight.style.pointerEvents = disabled ? 'none' : 'auto';
    }
  }

  function scrollHourly(direction) {
    const container = DOM.hourlyContainer;
    if (!container) return;
    const scrollAmount = Math.round(container.clientWidth * 0.8) * direction;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  /**
   * Renders lightweight inline SVG sparkline temperature line chart for 24 hours
   */
  function renderHourlyChart(hourlyTemps) {
    if (!hourlyTemps || !hourlyTemps.length) return;
    const svg = DOM.hourlyChartSvg;
    svg.innerHTML = '';

    const width = 1000;
    const height = 90;
    const padding = 24;

    const temps = hourlyTemps.map(h => toUnitTemp(h.tempC));
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = Math.max(1, maxTemp - minTemp);

    const stepX = (width - padding * 2) / (temps.length - 1);
    const points = temps.map((t, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((t - minTemp) / range) * (height - padding * 2);
      return { x, y, temp: t, label: hourlyTemps[i].hourLabel };
    });

    // Build smooth Bezier Curve Path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    // SVG Gradient & Path elements
    svg.innerHTML = `
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#chartGradient)" />
      <path d="${pathD}" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" />
      ${points.map((p, i) => {
        const isMilestone = i % 3 === 0 || i === 0 || i === points.length - 1;
        return `
          <circle cx="${p.x}" cy="${p.y}" r="${isMilestone ? '3.5' : '2'}" fill="#FFFFFF" stroke="#0284c7" stroke-width="2" />
          ${isMilestone ? `
            <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" font-size="11" font-weight="600" fill="currentColor">${p.temp}°</text>
            <text x="${p.x}" y="${height - 4}" text-anchor="middle" font-size="10" fill="var(--text-tertiary)">${p.label}</text>
          ` : ''}
        `;
      }).join('')}
    `;
  }

  function renderMetrics(cur, aqi) {
    // 1. Air Quality
    if (aqi && DOM.aqiNumber) {
      DOM.aqiNumber.textContent = aqi.aqi;
      const aqiInfo = getAirQualityDetails(aqi.aqi);
      DOM.aqiStatusBadge.textContent = aqiInfo.label;
      DOM.aqiStatusBadge.className = `aqi-badge ${aqiInfo.class}`;
      DOM.aqiAdviceText.textContent = aqiInfo.advice;
      DOM.pm25Val.textContent = aqi.pm25;
      DOM.pm10Val.textContent = aqi.pm10;
    }

    // 2. Wind & Compass
    if (DOM.windSpeedValue) {
      DOM.windSpeedValue.textContent = formatSpeed(cur.windSpeedKmh);
      DOM.windUnitText.textContent = state.unit === 'F' ? 'mph' : 'km/h';
      DOM.windDirectionText.textContent = getWindDirection(cur.windDirectionDeg);
      DOM.windCompassArrow.style.transform = `rotate(${cur.windDirectionDeg}deg)`;

      // Wind gust label
      const windKmh = cur.windSpeedKmh;
      let windDesc = 'Calm atmospheric flow';
      if (windKmh > 62) windDesc = '⚠ Strong gale force winds';
      else if (windKmh > 38) windDesc = 'Brisk winds — hold onto hats';
      else if (windKmh > 20) windDesc = 'Moderate breeze detected';
      else if (windKmh > 8) windDesc = 'Light breeze';
      DOM.windGustText.textContent = windDesc;
    }

    // 3. Sun Arc
    renderSunArc(cur);
  }

  function renderSunArc(cur) {
    DOM.sunriseTimeText.textContent = cur.sunriseStr;
    DOM.sunsetTimeText.textContent = cur.sunsetStr;

    const nowEpoch = Date.now() / 1000;
    const sunrise = cur.sunriseEpoch;
    const sunset = cur.sunsetEpoch;

    let progress = 0;
    if (sunrise && sunset && sunset > sunrise) {
      if (nowEpoch < sunrise) {
        progress = 0;
        const mins = Math.round((sunrise - nowEpoch) / 60);
        DOM.daylightRemainingText.textContent = `Sunrise in ${Math.floor(mins / 60)}h ${mins % 60}m`;
      } else if (nowEpoch > sunset) {
        progress = 1;
        DOM.daylightRemainingText.textContent = 'Sun has set';
      } else {
        progress = (nowEpoch - sunrise) / (sunset - sunrise);
        const minsLeft = Math.round((sunset - nowEpoch) / 60);
        DOM.daylightRemainingText.textContent = `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m remaining`;
      }
    } else {
      progress = cur.isDay ? 0.5 : 1;
    }

    const t = Math.max(0, Math.min(1, progress));
    const p0 = { x: 20, y: 65 };
    const p1 = { x: 150, y: -5 };
    const p2 = { x: 280, y: 65 };

    const orbX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const orbY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

    DOM.sunPositionOrb.setAttribute('cx', orbX);
    DOM.sunPositionOrb.setAttribute('cy', orbY);

    const pathTotalLen = 320;
    const offset = pathTotalLen - (pathTotalLen * t);
    DOM.sunTraveledPath.setAttribute('stroke-dashoffset', offset);
  }



  function renderFiveDay(dailyList) {
    DOM.fiveDayForecastList.innerHTML = '';

    let minSpan = Infinity;
    let maxSpan = -Infinity;

    dailyList.forEach(d => {
      if (d.tempMinC < minSpan) minSpan = d.tempMinC;
      if (d.tempMaxC > maxSpan) maxSpan = d.tempMaxC;
    });

    const totalRange = Math.max(1, maxSpan - minSpan);
    const curTemp = state.weatherData.current.tempC;

    dailyList.forEach(day => {
      const row = document.createElement('div');
      row.className = 'daily-row';

      const iconSvg = getWeatherIcon(day.conditionCode, true);
      const leftPercent = Math.max(0, Math.min(100, ((day.tempMinC - minSpan) / totalRange) * 100));
      const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((day.tempMaxC - day.tempMinC) / totalRange) * 100));

      let currentMarkerHtml = '';
      if (day.isToday) {
        const curPercent = Math.max(0, Math.min(100, ((curTemp - minSpan) / totalRange) * 100));
        currentMarkerHtml = `<div class="current-temp-marker" style="left: ${curPercent}%;" title="Current: ${formatTemp(curTemp)}°"></div>`;
      }

      row.innerHTML = `
        <div class="daily-day-info">
          <span class="daily-day-name">${day.dayName}</span>
          <span class="daily-date">${day.dateString}</span>
        </div>
        <div class="daily-condition-col">
          <div class="daily-weather-icon">${iconSvg}</div>
          <span class="daily-cond-text">${day.condition}</span>
        </div>
        <div class="daily-temp-bar-container">
          <span class="temp-min-label">${formatTemp(day.tempMinC)}°</span>
          <div class="temp-track">
            <div class="temp-range-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
            ${currentMarkerHtml}
          </div>
          <span class="temp-max-label">${formatTemp(day.tempMaxC)}°</span>
        </div>
      `;

      DOM.fiveDayForecastList.appendChild(row);
    });
  }

  function renderFooter() {
    DOM.dataSourceAttribution.textContent = 'Data provided by Open-Meteo & Open-Meteo Air Quality';
    updateLastUpdatedText();
  }

  function updateLastUpdatedText() {
    if (!state.lastUpdatedTime) return;
    const diffMs = Date.now() - state.lastUpdatedTime.getTime();
    const mins = Math.floor(diffMs / 60000);
    DOM.lastUpdatedNotice.textContent = mins < 1 
      ? 'Auto-refreshes every 10 min · Updated just now'
      : `Auto-refreshes every 10 min · Updated ${mins}m ago`;
  }

  function startLocalClock(timezone) {
    if (state.clockTimer) clearInterval(state.clockTimer);

    const updateClock = () => {
      const now = new Date();
      let timeString = '';
      try {
        timeString = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: state.timeFormat === '12',
          timeZone: timezone || undefined
        }).format(now);
      } catch (e) {
        timeString = now.toLocaleString();
      }

      DOM.heroDateTime.textContent = timeString;
      updateLastUpdatedText();
    };

    updateClock();
    state.clockTimer = setInterval(updateClock, 30000);
  }

  // --- Favorites & Quick Strip System ---
  function updateFavoriteButtonState() {
    const isFav = isCurrentCityFavorite();
    DOM.toggleFavoriteBtn.innerHTML = isFav ? WeatherIcons.starFilled : WeatherIcons.starOutline;
    DOM.toggleFavoriteBtn.classList.toggle('active', isFav);
  }

  function isCurrentCityFavorite() {
    if (!state.currentLocation || !state.currentLocation.city) return false;
    return state.favorites.some(f => f.city.toLowerCase() === state.currentLocation.city.toLowerCase());
  }

  function toggleFavorite() {
    if (!state.currentLocation || !state.currentLocation.city) return;
    const city = state.currentLocation.city;
    const idx = state.favorites.findIndex(f => f.city.toLowerCase() === city.toLowerCase());

    if (idx >= 0) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push({
        city,
        country: state.currentLocation.country,
        countryCode: state.currentLocation.countryCode,
        lat: state.currentLocation.lat,
        lon: state.currentLocation.lon
      });
    }

    localStorage.setItem('aura_favorites', JSON.stringify(state.favorites));
    updateFavoriteButtonState();
  }

  // --- Search Engine with Autocomplete, Recents & Keyboard Navigation ---
  let searchDebounceTimer = null;
  let activeDropdownIndex = -1;
  let currentSearchResults = [];

  function handleSearchInput(e) {
    const query = e.target.value.trim();

    if (query.length > 0) {
      DOM.clearSearchBtn.style.display = 'block';
    } else {
      DOM.clearSearchBtn.style.display = 'none';
      showRecentSearchesDropdown();
      return;
    }

    if (query.length < 2) {
      closeSearchDropdown();
      return;
    }

    clearTimeout(searchDebounceTimer);
    if (state.searchAbortController) state.searchAbortController.abort();
    state.searchAbortController = new AbortController();

    DOM.searchSpinner.style.display = 'block';

    searchDebounceTimer = setTimeout(async () => {
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
        const res = await fetch(url, { signal: state.searchAbortController.signal });
        const data = await res.json();

        currentSearchResults = data.results || [];
        renderSearchResults(currentSearchResults, query);
      } catch (err) {
        if (err.name !== 'AbortError') {
          renderSearchResults([], query);
        }
      } finally {
        DOM.searchSpinner.style.display = 'none';
      }
    }, 250);
  }

  function showRecentSearchesDropdown() {
    DOM.searchResultsList.innerHTML = '';
    activeDropdownIndex = -1;

    if (!state.recentSearches || state.recentSearches.length === 0) {
      closeSearchDropdown();
      return;
    }

    const header = document.createElement('div');
    header.className = 'search-section-header';
    header.textContent = 'Recent Searches';
    DOM.searchResultsList.appendChild(header);

    state.recentSearches.slice(0, 5).forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'search-item';
      li.setAttribute('role', 'option');
      li.setAttribute('data-index', index);

      const flag = getCountryFlagEmoji(item.countryCode);
      li.innerHTML = `
        <div class="search-item-main">
          <span class="search-flag">${flag}</span>
          <div class="search-item-info">
            <span class="search-item-city">${item.city}</span>
            <span class="search-item-details">${item.country || ''}</span>
          </div>
        </div>
      `;

      li.addEventListener('click', () => {
        selectSearchResult(item);
      });

      DOM.searchResultsList.appendChild(li);
    });

    DOM.searchResultsList.classList.add('active');
  }

  function renderSearchResults(results, query) {
    DOM.searchResultsList.innerHTML = '';
    activeDropdownIndex = -1;

    if (!results || results.length === 0) {
      const item = document.createElement('li');
      item.className = 'search-no-results';
      item.textContent = `No cities found matching "${query}"`;
      DOM.searchResultsList.appendChild(item);
      DOM.searchResultsList.classList.add('active');
      return;
    }

    results.forEach((city, index) => {
      const li = document.createElement('li');
      li.className = 'search-item';
      li.setAttribute('role', 'option');
      li.setAttribute('data-index', index);

      const flag = getCountryFlagEmoji(city.country_code);
      const regionPart = city.admin1 ? `${city.admin1}, ` : '';
      const countryPart = city.country || '';

      li.innerHTML = `
        <div class="search-item-main">
          <span class="search-flag">${flag}</span>
          <div class="search-item-info">
            <span class="search-item-city">${city.name}</span>
            <span class="search-item-details">${regionPart}${countryPart}</span>
          </div>
        </div>
      `;

      li.addEventListener('click', () => {
        selectSearchResult({
          city: city.name,
          country: city.country,
          countryCode: city.country_code,
          region: city.admin1,
          lat: city.latitude,
          lon: city.longitude
        });
      });

      DOM.searchResultsList.appendChild(li);
    });

    DOM.searchResultsList.classList.add('active');
  }

  function selectSearchResult(item) {
    DOM.citySearchInput.value = '';
    DOM.clearSearchBtn.style.display = 'none';
    closeSearchDropdown();

    // Save to recents
    addRecentSearch(item);

    // Switch to home weather view if in world or compare view
    switchView('home');

    loadWeather(item.lat, item.lon, item);
  }

  function addRecentSearch(item) {
    const existingIdx = state.recentSearches.findIndex(r => r.city.toLowerCase() === item.city.toLowerCase());
    if (existingIdx >= 0) state.recentSearches.splice(existingIdx, 1);
    state.recentSearches.unshift(item);
    if (state.recentSearches.length > 5) state.recentSearches.pop();
    localStorage.setItem('aura_recents', JSON.stringify(state.recentSearches));
  }

  function closeSearchDropdown() {
    DOM.searchResultsList.classList.remove('active');
    DOM.searchResultsList.innerHTML = '';
    activeDropdownIndex = -1;
  }

  function handleSearchKeydown(e) {
    const items = DOM.searchResultsList.querySelectorAll('.search-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeDropdownIndex = (activeDropdownIndex + 1) % items.length;
      updateDropdownHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeDropdownIndex = (activeDropdownIndex - 1 + items.length) % items.length;
      updateDropdownHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeDropdownIndex >= 0 && items[activeDropdownIndex]) {
        items[activeDropdownIndex].click();
      }
    } else if (e.key === 'Escape') {
      closeSearchDropdown();
    }
  }

  function updateDropdownHighlight(items) {
    items.forEach((item, idx) => {
      if (idx === activeDropdownIndex) {
        item.classList.add('highlighted');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('highlighted');
      }
    });
  }

  // --- Voice Search (Web Speech API) ---
  function setupVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    DOM.voiceSearchBtn.style.display = 'flex';
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    DOM.voiceSearchBtn.addEventListener('click', () => {
      try {
        recognition.start();
        DOM.voiceSearchBtn.classList.add('listening');
      } catch (err) {
        recognition.stop();
        DOM.voiceSearchBtn.classList.remove('listening');
      }
    });

    recognition.onresult = (event) => {
      DOM.voiceSearchBtn.classList.remove('listening');
      const spokenCity = event.results[0][0].transcript;
      DOM.citySearchInput.value = spokenCity;
      DOM.clearSearchBtn.style.display = 'block';
      DOM.citySearchInput.dispatchEvent(new Event('input'));
    };

    recognition.onerror = () => {
      DOM.voiceSearchBtn.classList.remove('listening');
    };

    recognition.onend = () => {
      DOM.voiceSearchBtn.classList.remove('listening');
    };
  }

  // --- Location & Initial Geolocation Sequence ---
  /**
   * Detection Order:
   * 1. Cached location (rendered instantly for 0ms startup)
   * 2. GPS with 4-second timeout
   * 3. IP-based location fallback (via get.geojs.io)
   * 4. User-saved fallback city
   * Banner always displays the EXACT city currently rendered!
   */
  async function initLocation() {
    // 1. Cached location in localStorage
    const cachedLoc = localStorage.getItem('aura_last_location');
    const cachedWeather = localStorage.getItem('aura_last_weather');
    let hasCached = false;

    if (cachedWeather && cachedLoc) {
      try {
        state.weatherData = JSON.parse(cachedWeather);
        state.currentLocation = JSON.parse(cachedLoc);
        state.lastUpdatedTime = new Date();
        renderAll();
        hasCached = true;
      } catch (e) {}
    }

    // Guidance notice helper: ALWAYS names the actual displayed city!
    const showAccurateLocationNotice = () => {
      const activeCity = state.currentLocation?.city || 'Selected City';
      DOM.locationText.innerHTML = `We couldn't detect your GPS location automatically. Showing <strong>${activeCity}</strong> (location detection requires HTTPS or localhost). You can search any city above or try again.`;
      DOM.locationBanner.classList.add('active');
    };

    // Helper: IP Geolocation fallback
    const tryIpGeolocation = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (res.ok) {
          const d = await res.json();
          const lat = parseFloat(d.latitude);
          const lon = parseFloat(d.longitude);
          if (!isNaN(lat) && !isNaN(lon)) {
            const locInfo = {
              city: d.city || 'Local Area',
              country: d.country || '',
              countryCode: d.country_code || '',
              region: d.region || '',
              lat,
              lon
            };
            await loadWeather(lat, lon, locInfo, false);
            showAccurateLocationNotice();
            return true;
          }
        }
      } catch (err) {
        console.warn('IP geolocation failed:', err);
      }
      return false;
    };

    // 2. Request GPS with 4-second timeout
    DOM.myLocationBtn.classList.add('loading');

    if ('geolocation' in navigator) {
      let gpsDone = false;
      const gpsTimer = setTimeout(async () => {
        if (!gpsDone) {
          gpsDone = true;
          DOM.myLocationBtn.classList.remove('loading');
          if (!hasCached) {
            const ipSuccess = await tryIpGeolocation();
            if (!ipSuccess) loadFallbackCity();
          } else {
            showAccurateLocationNotice();
          }
        }
      }, 4000);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (gpsDone) return;
          gpsDone = true;
          clearTimeout(gpsTimer);
          DOM.myLocationBtn.classList.remove('loading');
          DOM.locationBanner.classList.remove('active');
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const locInfo = await reverseGeocode(lat, lon);
          loadWeather(lat, lon, locInfo, false);
        },
        async () => {
          if (gpsDone) return;
          gpsDone = true;
          clearTimeout(gpsTimer);
          DOM.myLocationBtn.classList.remove('loading');
          if (!hasCached) {
            const ipSuccess = await tryIpGeolocation();
            if (!ipSuccess) loadFallbackCity();
          } else {
            showAccurateLocationNotice();
          }
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
      );
    } else {
      DOM.myLocationBtn.classList.remove('loading');
      if (!hasCached) {
        const ipSuccess = await tryIpGeolocation();
        if (!ipSuccess) loadFallbackCity();
      } else {
        showAccurateLocationNotice();
      }
    }
  }

  async function reverseGeocode(lat, lon) {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      if (res.ok) {
        const d = await res.json();
        return {
          city: d.city || d.locality || d.principalSubdivision || 'Local Area',
          country: d.countryName || '',
          countryCode: d.countryCode || '',
          region: d.principalSubdivision || ''
        };
      }
    } catch (e) {}
    return { city: 'Local Area', country: '', countryCode: '', region: '' };
  }

  function loadFallbackCity() {
    const [city, countryCode, latStr, lonStr] = state.defaultCity.split(',');
    const lat = parseFloat(latStr) || 51.5074;
    const lon = parseFloat(lonStr) || -0.1278;
    loadWeather(lat, lon, { city, countryCode, country: '' });
    showLocationNotice(city);
  }

  function showLocationNotice(city) {
    const activeCity = city || state.currentLocation?.city || 'the selected location';
    DOM.locationText.innerHTML = `We couldn't detect your GPS location automatically. Showing <strong>${activeCity}</strong> (location detection requires HTTPS or localhost). You can search any city above or try again.`;
    DOM.locationBanner.classList.add('active');
  }

  // --- World Live Weather (All Countries Dataset & Batched Open-Meteo Fetching) ---
  async function initWorldCountries() {
    try {
      const res = await fetch('countries.json');
      state.countries = await res.json();
      renderCountriesGrid();
    } catch (err) {
      console.warn('Could not load countries.json:', err);
    }
  }

  function renderCountriesGrid() {
    DOM.countriesGrid.innerHTML = '';

    // Filter by continent
    let list = state.countries;
    if (state.worldFilterContinent !== 'all') {
      list = list.filter(c => c.continent === state.worldFilterContinent);
    }

    // Sort
    if (state.worldSortOrder === 'hottest') {
      list.sort((a, b) => {
        const tA = state.worldWeatherCache.get(`${a.lat},${a.lon}`)?.tempC ?? -999;
        const tB = state.worldWeatherCache.get(`${b.lat},${b.lon}`)?.tempC ?? -999;
        return tB - tA;
      });
    } else if (state.worldSortOrder === 'coldest') {
      list.sort((a, b) => {
        const tA = state.worldWeatherCache.get(`${a.lat},${a.lon}`)?.tempC ?? 999;
        const tB = state.worldWeatherCache.get(`${b.lat},${b.lon}`)?.tempC ?? 999;
        return tA - tB;
      });
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    list.forEach(country => {
      const card = document.createElement('div');
      card.className = 'country-weather-card glass-panel';
      card.setAttribute('data-lat', country.lat);
      card.setAttribute('data-lon', country.lon);

      const cached = state.worldWeatherCache.get(`${country.lat},${country.lon}`);
      const tempHtml = cached ? `${formatTemp(cached.tempC)}°${state.unit}` : '<span class="skeleton">--°</span>';
      const iconHtml = cached ? getWeatherIcon(cached.code, cached.isDay) : '';

      card.innerHTML = `
        <div class="country-card-header">
          <div class="country-flag-title">
            <span class="country-flag-icon">${country.flag}</span>
            <div>
              <div class="country-name-text">${country.name}</div>
              <div class="country-capital-text">${country.capital}</div>
            </div>
          </div>
        </div>
        <div class="country-card-temp-row">
          <span class="country-temp-val">${tempHtml}</span>
          <div class="country-icon-mini">${iconHtml}</div>
        </div>
      `;

      // Open Country City Browser on click
      card.addEventListener('click', () => {
        openCountryCityBrowser(country);
      });

      DOM.countriesGrid.appendChild(card);
    });

    // Setup lazy observer to batch fetch live temps for visible cards
    setupWorldIntersectionObserver();
  }

  function setupWorldIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const cards = DOM.countriesGrid.querySelectorAll('.country-weather-card');
    const observer = new IntersectionObserver((entries) => {
      const toFetch = [];
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lat = entry.target.getAttribute('data-lat');
          const lon = entry.target.getAttribute('data-lon');
          const key = `${lat},${lon}`;
          if (!state.worldWeatherCache.has(key)) {
            toFetch.push({ lat, lon, element: entry.target });
          }
          observer.unobserve(entry.target);
        }
      });

      if (toFetch.length > 0) {
        batchFetchWorldTemps(toFetch);
      }
    }, { rootMargin: '200px' });

    cards.forEach(card => observer.observe(card));
  }

  async function batchFetchWorldTemps(batch) {
    // Open-Meteo allows up to 50 comma-separated coordinates in one request!
    const chunkSize = 40;
    for (let i = 0; i < batch.length; i += chunkSize) {
      const chunk = batch.slice(i, i + chunkSize);
      const lats = chunk.map(c => c.lat).join(',');
      const lons = chunk.map(c => c.lon).join(',');

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,is_day`;
        const res = await fetch(url);
        const data = await res.json();

        // If single location, Open-Meteo returns object; if multiple, returns array of objects
        const results = Array.isArray(data) ? data : [data];

        results.forEach((item, idx) => {
          const target = chunk[idx];
          if (!target || !item || !item.current) return;
          const key = `${target.lat},${target.lon}`;
          const isDay = item.current.is_day === 1;
          const cond = parseWmoCode(item.current.weather_code, isDay);

          const weatherObj = {
            tempC: item.current.temperature_2m,
            code: cond.code,
            isDay,
            time: Date.now()
          };

          state.worldWeatherCache.set(key, weatherObj);

          // Update card element
          const tempEl = target.element.querySelector('.country-temp-val');
          const iconEl = target.element.querySelector('.country-icon-mini');
          if (tempEl) tempEl.textContent = `${formatTemp(weatherObj.tempC)}°${state.unit}`;
          if (iconEl) iconEl.innerHTML = getWeatherIcon(weatherObj.code, weatherObj.isDay);
        });
      } catch (err) {
        console.warn('Batch fetch error:', err);
      }
    }
  }

  // --- Location Browser: Country > Region/Division > City/Town ---
  async function openCountryCityBrowser(country) {
    state.activeCountry = country;
    state.activeDivision = 'all';
    state.citySearchTerm = '';
    state.citySortOrder = 'name';
    state.citiesPage = 1;

    DOM.allCountriesContainer.style.display = 'none';
    DOM.countryCityBrowserView.style.display = 'block';

    DOM.countryDetailFlag.textContent = country.flag || '🏳️';
    DOM.countryDetailName.textContent = country.name;
    DOM.countryDetailSubtitle.textContent = `All Divisions, Districts & Cities in ${country.name}`;

    DOM.countryCitySearchInput.value = '';
    DOM.countryCitySortSelect.value = 'name';

    // Show loading state in cities grid
    DOM.countryCitiesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-tertiary);">
        Loading cities for ${country.name}...
      </div>
    `;

    try {
      const res = await fetch(`data/cities/${country.iso}.json`);
      if (res.ok) {
        state.countryCities = await res.json();
      } else {
        // Fallback for countries without dedicated JSON file: generate default entry
        state.countryCities = [{
          name: country.capital,
          region: 'Capital',
          latitude: country.lat,
          longitude: country.lon,
          population: 1500000,
          timezone: 'UTC'
        }];
      }
    } catch (e) {
      state.countryCities = [{
        name: country.capital,
        region: 'Capital',
        latitude: country.lat,
        longitude: country.lon,
        population: 1500000,
        timezone: 'UTC'
      }];
    }

    renderDivisionFilters();
    renderCountryCities();
  }

  function closeCountryCityBrowser() {
    DOM.countryCityBrowserView.style.display = 'none';
    DOM.allCountriesContainer.style.display = 'block';
    state.activeCountry = null;
  }

  function renderDivisionFilters() {
    DOM.countryDivisionsStrip.innerHTML = '';

    // Extract unique divisions/regions
    const divisions = new Set();
    state.countryCities.forEach(c => {
      if (c.region) divisions.add(c.region);
    });

    const sortedDivisions = Array.from(divisions).sort();

    // "All Divisions" pill
    const allChip = document.createElement('button');
    allChip.className = `division-chip ${state.activeDivision === 'all' ? 'active' : ''}`;
    allChip.textContent = `All (${state.countryCities.length})`;
    allChip.addEventListener('click', () => {
      state.activeDivision = 'all';
      state.citiesPage = 1;
      updateDivisionChipStates();
      renderCountryCities();
    });
    DOM.countryDivisionsStrip.appendChild(allChip);

    sortedDivisions.forEach(divName => {
      const chip = document.createElement('button');
      chip.className = `division-chip ${state.activeDivision === divName ? 'active' : ''}`;
      chip.textContent = divName;
      chip.setAttribute('data-division', divName);
      chip.addEventListener('click', () => {
        state.activeDivision = divName;
        state.citiesPage = 1;
        updateDivisionChipStates();
        renderCountryCities();
      });
      DOM.countryDivisionsStrip.appendChild(chip);
    });
  }

  function updateDivisionChipStates() {
    DOM.countryDivisionsStrip.querySelectorAll('.division-chip').forEach(chip => {
      const divAttr = chip.getAttribute('data-division');
      const isAll = !divAttr;
      if (isAll) {
        chip.classList.toggle('active', state.activeDivision === 'all');
      } else {
        chip.classList.toggle('active', state.activeDivision === divAttr);
      }
    });
  }

  function renderCountryCities() {
    DOM.countryCitiesGrid.innerHTML = '';

    // 1. Filter by division
    let list = state.countryCities;
    if (state.activeDivision !== 'all') {
      list = list.filter(c => c.region === state.activeDivision);
    }

    // 2. Filter by search query
    if (state.citySearchTerm) {
      const q = state.citySearchTerm.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || (c.region && c.region.toLowerCase().includes(q)));
    }

    // 3. Sort
    if (state.citySortOrder === 'population') {
      list.sort((a, b) => (b.population || 0) - (a.population || 0));
    } else if (state.citySortOrder === 'hottest') {
      list.sort((a, b) => {
        const latA = a.lat ?? a.latitude;
        const lonA = a.lon ?? a.longitude;
        const latB = b.lat ?? b.latitude;
        const lonB = b.lon ?? b.longitude;
        const tA = state.cityWeatherCache.get(`${latA},${lonA}`)?.tempC ?? -999;
        const tB = state.cityWeatherCache.get(`${latB},${lonB}`)?.tempC ?? -999;
        return tB - tA;
      });
    } else if (state.citySortOrder === 'coldest') {
      list.sort((a, b) => {
        const latA = a.lat ?? a.latitude;
        const lonA = a.lon ?? a.longitude;
        const latB = b.lat ?? b.latitude;
        const lonB = b.lon ?? b.longitude;
        const tA = state.cityWeatherCache.get(`${latA},${lonA}`)?.tempC ?? 999;
        const tB = state.cityWeatherCache.get(`${latB},${lonB}`)?.tempC ?? 999;
        return tA - tB;
      });
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (list.length === 0) {
      DOM.countryCitiesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-tertiary);">
          No cities found matching your filter.
        </div>
      `;
      DOM.loadMoreCitiesBtn.style.display = 'none';
      return;
    }

    // 4. Pagination
    const displayedCount = state.citiesPage * state.citiesPerPage;
    const paginatedList = list.slice(0, displayedCount);

    DOM.loadMoreCitiesBtn.style.display = displayedCount < list.length ? 'block' : 'none';

    // 5. Render cards
    paginatedList.forEach(city => {
      const card = document.createElement('div');
      card.className = 'city-weather-card glass-panel';
      const cityLat = city.lat ?? city.latitude;
      const cityLon = city.lon ?? city.longitude;
      card.setAttribute('data-lat', cityLat);
      card.setAttribute('data-lon', cityLon);

      const cacheKey = `${cityLat},${cityLon}`;
      const cached = state.cityWeatherCache.get(cacheKey);
      const tempHtml = cached ? `${formatTemp(cached.tempC)}°${state.unit}` : '<span class="skeleton">--°</span>';
      const iconHtml = cached ? getWeatherIcon(cached.code, cached.isDay) : '';

      const popFormatted = city.population 
        ? (city.population >= 1000000 
            ? `${(city.population / 1000000).toFixed(1)}M` 
            : `${(city.population / 1000).toFixed(0)}k`)
        : '';

      card.innerHTML = `
        <div class="city-card-header">
          <div class="city-name-text">${city.name}</div>
          <div class="city-region-text">${city.region || state.activeCountry.name}</div>
        </div>
        <div class="city-card-temp-row">
          <span class="city-temp-val">${tempHtml}</span>
          <div class="city-icon-mini">${iconHtml}</div>
        </div>
        ${popFormatted ? `<span class="city-pop-label">Pop: ${popFormatted}</span>` : ''}
      `;

      card.addEventListener('click', () => {
        switchView('home');
        loadWeather(cityLat, cityLon, {
          city: city.name,
          country: state.activeCountry.name,
          countryCode: state.activeCountry.iso,
          region: city.region || ''
        });
      });

      DOM.countryCitiesGrid.appendChild(card);
    });

    setupCityIntersectionObserver();
  }

  function setupCityIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const cards = DOM.countryCitiesGrid.querySelectorAll('.city-weather-card');
    const observer = new IntersectionObserver((entries) => {
      const toFetch = [];
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lat = entry.target.getAttribute('data-lat');
          const lon = entry.target.getAttribute('data-lon');
          const key = `${lat},${lon}`;
          if (!state.cityWeatherCache.has(key)) {
            toFetch.push({ lat, lon, element: entry.target });
          }
          observer.unobserve(entry.target);
        }
      });

      if (toFetch.length > 0) {
        batchFetchCityTemps(toFetch);
      }
    }, { rootMargin: '200px' });

    cards.forEach(card => observer.observe(card));
  }

  async function batchFetchCityTemps(batch) {
    const validBatch = batch.filter(c => c.lat && c.lon && !isNaN(parseFloat(c.lat)) && !isNaN(parseFloat(c.lon)));
    if (!validBatch.length) return;

    const chunkSize = 40;
    for (let i = 0; i < validBatch.length; i += chunkSize) {
      const chunk = validBatch.slice(i, i + chunkSize);
      const lats = chunk.map(c => c.lat).join(',');
      const lons = chunk.map(c => c.lon).join(',');

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,is_day`;
        const res = await fetch(url);
        const data = await res.json();
        const results = Array.isArray(data) ? data : [data];

        results.forEach((item, idx) => {
          const target = chunk[idx];
          if (!target || !item || !item.current) return;
          const key = `${target.lat},${target.lon}`;
          const isDay = item.current.is_day === 1;
          const cond = parseWmoCode(item.current.weather_code, isDay);

          const weatherObj = {
            tempC: item.current.temperature_2m,
            code: cond.code,
            isDay,
            time: Date.now()
          };

          state.cityWeatherCache.set(key, weatherObj);

          const tempEl = target.element.querySelector('.city-temp-val');
          const iconEl = target.element.querySelector('.city-icon-mini');
          if (tempEl) tempEl.textContent = `${formatTemp(weatherObj.tempC)}°${state.unit}`;
          if (iconEl) iconEl.innerHTML = getWeatherIcon(weatherObj.code, weatherObj.isDay);
        });
      } catch (err) {
        console.warn('Batch city fetch error:', err);
      }
    }
  }

  // --- View Switcher (Home, World) ---
  function switchView(viewName) {
    state.activeView = viewName;

    DOM.homeView.style.display = viewName === 'home' ? 'flex' : 'none';
    DOM.worldView.style.display = viewName === 'world' ? 'flex' : 'none';

    // Update active tab buttons
    DOM.navTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    if (viewName === 'world') {
      if (!state.countries.length) initWorldCountries();
    }
  }

  // --- Theme Toggle Handler ---
  function setTheme(theme) {
    state.colorTheme = theme;
    localStorage.setItem('aura_theme', theme);
    DOM.body.setAttribute('data-color-theme', theme);
    DOM.themeToggleIconPlaceholder.innerHTML = theme === 'light' ? WeatherIcons.themeDark : WeatherIcons.themeLight;
  }

  function toggleTheme() {
    setTheme(state.colorTheme === 'light' ? 'dark' : 'light');
  }

  // --- Unit Toggle Handler (°C / °F) ---
  function setUnit(newUnit) {
    if (state.unit === newUnit) return;
    state.unit = newUnit;
    localStorage.setItem('aura_unit', newUnit);

    DOM.unitToggleContainer.setAttribute('data-active', newUnit);
    DOM.unitBtnC.classList.toggle('active', newUnit === 'C');
    DOM.unitBtnC.setAttribute('aria-checked', newUnit === 'C');
    DOM.unitBtnF.classList.toggle('active', newUnit === 'F');
    DOM.unitBtnF.setAttribute('aria-checked', newUnit === 'F');

    // Instant re-render with NO new network request!
    if (state.weatherData) {
      renderAll();
    }
    if (state.activeView === 'world') {
      renderCountriesGrid();
    }
  }

  // --- Share & Copy Link ---
  function shareCurrentWeather() {
    const loc = state.currentLocation;
    const cur = state.weatherData?.current;
    const shareText = `Live weather in ${loc.city}: ${formatTemp(cur?.tempC)}°${state.unit}, ${cur?.condition || 'Clear'}. Check Aura Weather!`;

    if (navigator.share) {
      navigator.share({
        title: `Weather in ${loc.city} — Aura`,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`).then(() => {
        alert('Weather summary link copied to clipboard!');
      });
    }
  }

  // --- Error & Notification Helpers ---
  function showError(msg) {
    DOM.errorMessageText.textContent = msg;
    DOM.errorBanner.classList.add('active');
  }

  function hideError() {
    DOM.errorBanner.classList.remove('active');
  }

  // --- Static Icon Initializer ---
  function populateStaticIcons() {
    document.querySelectorAll('.weather-icon-placeholder').forEach(el => el.innerHTML = '');
    if (DOM.themeToggleIconPlaceholder) {
      DOM.themeToggleIconPlaceholder.innerHTML = state.colorTheme === 'light' ? WeatherIcons.themeDark : WeatherIcons.themeLight;
    }
    const aqiIcon = document.getElementById('aqiIconPlaceholder');
    if (aqiIcon) aqiIcon.innerHTML = WeatherIcons.leaf;
    const windIcon = document.getElementById('windIconPlaceholder');
    if (windIcon) windIcon.innerHTML = WeatherIcons.wind;
    const sunCycleIcon = document.getElementById('sunCycleIconPlaceholder');
    if (sunCycleIcon) sunCycleIcon.innerHTML = WeatherIcons.sunrise;
    const sunriseIcon = document.getElementById('sunriseIconInline');
    if (sunriseIcon) sunriseIcon.innerHTML = WeatherIcons.sunrise;
    const sunsetIcon = document.getElementById('sunsetIconInline');
    if (sunsetIcon) sunsetIcon.innerHTML = WeatherIcons.sunset;
  }

  // --- Event Listeners Setup ---
  function attachEventListeners() {
    // Brand logo returns to Home
    DOM.brandLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('home');
    });

    // Navigation Tabs
    DOM.navTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view) switchView(view);
      });
    });

    // Search Input Events
    DOM.citySearchInput.addEventListener('input', handleSearchInput);
    DOM.citySearchInput.addEventListener('keydown', handleSearchKeydown);
    DOM.citySearchInput.addEventListener('focus', () => {
      if (!DOM.citySearchInput.value.trim()) {
        showRecentSearchesDropdown();
      }
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.citySearchInput.value = '';
      DOM.clearSearchBtn.style.display = 'none';
      closeSearchDropdown();
      DOM.citySearchInput.focus();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        closeSearchDropdown();
      }
    });

    // Keyboard shortcut '/' focuses search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== DOM.citySearchInput) {
        e.preventDefault();
        DOM.citySearchInput.focus();
        DOM.citySearchInput.select();
      }
    });

    // Action Buttons
    DOM.myLocationBtn.addEventListener('click', () => initLocation());
    DOM.unitBtnC.addEventListener('click', () => setUnit('C'));
    DOM.unitBtnF.addEventListener('click', () => setUnit('F'));
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    DOM.toggleFavoriteBtn.addEventListener('click', toggleFavorite);
    DOM.shareCityBtn.addEventListener('click', shareCurrentWeather);

    DOM.manualRefreshBtn.addEventListener('click', () => {
      DOM.manualRefreshBtn.classList.add('loading');
      loadWeather(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation, true).finally(() => {
        DOM.manualRefreshBtn.classList.remove('loading');
      });
    });

    // Mobile More Actions Menu
    if (DOM.moreActionsBtn && DOM.moreMenuDropdown) {
      DOM.moreActionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = DOM.moreMenuDropdown.classList.toggle('active');
        DOM.moreActionsBtn.setAttribute('aria-expanded', String(expanded));
      });
    }

    if (DOM.menuThemeBtn) {
      DOM.menuThemeBtn.addEventListener('click', () => {
        toggleTheme();
        if (DOM.moreMenuDropdown) DOM.moreMenuDropdown.classList.remove('active');
        if (DOM.moreActionsBtn) DOM.moreActionsBtn.setAttribute('aria-expanded', 'false');
      });
    }

    if (DOM.menuSettingsBtn) {
      DOM.menuSettingsBtn.addEventListener('click', () => {
        openSettings();
        if (DOM.moreMenuDropdown) DOM.moreMenuDropdown.classList.remove('active');
        if (DOM.moreActionsBtn) DOM.moreActionsBtn.setAttribute('aria-expanded', 'false');
      });
    }

    document.addEventListener('click', (e) => {
      if (DOM.moreMenuDropdown && DOM.moreMenuDropdown.classList.contains('active')) {
        if (!e.target.closest('#moreMenuWrapper')) {
          DOM.moreMenuDropdown.classList.remove('active');
          if (DOM.moreActionsBtn) DOM.moreActionsBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Online / Offline Status Updates for Live Badge
    const updateLiveStatus = () => {
      if (DOM.liveBadge) {
        if (navigator.onLine) {
          DOM.liveBadge.innerHTML = '<span class="live-dot"></span>Live';
          DOM.liveBadge.style.color = '#10B981';
        } else {
          DOM.liveBadge.innerHTML = '<span class="live-dot" style="background-color:#EF4444;box-shadow:0 0 8px #EF4444;"></span>Offline';
          DOM.liveBadge.style.color = '#EF4444';
        }
      }
    };
    window.addEventListener('online', updateLiveStatus);
    window.addEventListener('offline', updateLiveStatus);

    // Banner Buttons
    DOM.closeSevereBtn.addEventListener('click', () => DOM.severeBanner.classList.remove('active'));
    DOM.closeNoticeBtn.addEventListener('click', () => DOM.locationBanner.classList.remove('active'));
    DOM.tryAgainLocationBtn.addEventListener('click', () => initLocation());
    DOM.retryErrorBtn.addEventListener('click', () => {
      loadWeather(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation);
    });

    // Hourly Strip Scrolling with Event Delegation & Keyboard navigation
    if (DOM.scrollHourlyLeft) {
      DOM.scrollHourlyLeft.addEventListener('click', () => scrollHourly(-1));
    }
    if (DOM.scrollHourlyRight) {
      DOM.scrollHourlyRight.addEventListener('click', () => scrollHourly(1));
    }
    if (DOM.hourlyContainer) {
      DOM.hourlyContainer.addEventListener('scroll', () => updateHourlyScrollButtons(), { passive: true });
      DOM.hourlyContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          scrollHourly(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          scrollHourly(1);
        }
      });
    }
    window.addEventListener('resize', () => updateHourlyScrollButtons(), { passive: true });

    // Map and Compare listeners removed

    // Country City Browser Controls
    if (DOM.backToCountriesBtn) DOM.backToCountriesBtn.addEventListener('click', closeCountryCityBrowser);
    if (DOM.countryCitySearchInput) {
      DOM.countryCitySearchInput.addEventListener('input', (e) => {
        state.citySearchTerm = e.target.value.trim();
        state.citiesPage = 1;
        renderCountryCities();
      });
    }
    if (DOM.countryCitySortSelect) {
      DOM.countryCitySortSelect.addEventListener('change', (e) => {
        state.citySortOrder = e.target.value;
        renderCountryCities();
      });
    }
    if (DOM.loadMoreCitiesBtn) {
      DOM.loadMoreCitiesBtn.addEventListener('click', () => {
        state.citiesPage++;
        renderCountryCities();
      });
    }

    // World Page Controls
    DOM.continentChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.continentChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.worldFilterContinent = chip.getAttribute('data-continent');
        renderCountriesGrid();
      });
    });

    DOM.worldSortSelect.addEventListener('change', (e) => {
      state.worldSortOrder = e.target.value;
      renderCountriesGrid();
    });

    // Settings Modal
    const openSettings = () => {
      DOM.timeFormatSelect.value = state.timeFormat;
      DOM.themePreferenceSelect.value = state.colorTheme;
      DOM.defaultCitySelect.value = state.defaultCity;
      DOM.settingsModal.classList.add('active');
    };

    const closeSettings = () => DOM.settingsModal.classList.remove('active');

    DOM.openSettingsBtn.addEventListener('click', openSettings);
    DOM.mobileSettingsBtn.addEventListener('click', openSettings);
    DOM.closeSettingsBtn.addEventListener('click', closeSettings);
    DOM.cancelSettingsBtn.addEventListener('click', closeSettings);

    DOM.saveSettingsBtn.addEventListener('click', () => {
      state.timeFormat = DOM.timeFormatSelect.value;
      state.defaultCity = DOM.defaultCitySelect.value;
      setTheme(DOM.themePreferenceSelect.value);

      localStorage.setItem('aura_time_format', state.timeFormat);
      localStorage.setItem('aura_default_city', state.defaultCity);

      closeSettings();
      renderAll();
    });

    DOM.clearCacheBtn.addEventListener('click', () => {
      if (confirm('Clear all saved favorites and cached weather data?')) {
        localStorage.clear();
        state.favorites = [];
        state.recentSearches = [];
        closeSettings();
        location.reload();
      }
    });

    // Auto-refresh every 10 minutes
    state.autoRefreshTimer = setInterval(() => {
      if (state.currentLocation) {
        loadWeather(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation, true);
      }
    }, 600000);
  }

  // --- Service Worker Registration for PWA Offline Shell ---
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  }

  // --- App Initialization Entry Point ---
  function init() {
    DOM.body.setAttribute('data-color-theme', state.colorTheme);
    populateStaticIcons();
    CanvasEngine.init();
    attachEventListeners();
    setupVoiceSearch();
    initLocation();
    initWorldCountries();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
