/**
 * Weather App - High Fidelity Animated SVG Icons
 * Provides lightweight, scalable, and responsive SVG weather icons.
 */

const WeatherIcons = {
  // Clear Day - Glowing, slowly spinning sun
  clearDay: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-clear-day" aria-hidden="true">
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFE082" />
          <stop offset="70%" stop-color="#FFB300" />
          <stop offset="100%" stop-color="#FF8F00" />
        </radialGradient>
        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Sun rays -->
      <g class="sun-rays" stroke="#FFA000" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="6" x2="32" y2="13" />
        <line x1="32" y1="51" x2="32" y2="58" />
        <line x1="6" y1="32" x2="13" y2="32" />
        <line x1="51" y1="32" x2="58" y2="32" />
        <line x1="13.6" y1="13.6" x2="18.6" y2="18.6" />
        <line x1="45.4" y1="45.4" x2="50.4" y2="50.4" />
        <line x1="13.6" y1="50.4" x2="18.6" y2="45.4" />
        <line x1="45.4" y1="18.6" x2="50.4" y2="13.6" />
      </g>
      <!-- Central sun sphere -->
      <circle cx="32" cy="32" r="14" fill="url(#sunGlow)" filter="url(#glowEffect)" class="sun-body" />
    </svg>
  `,

  // Clear Night - Radiant moon with subtle stars
  clearNight: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-clear-night" aria-hidden="true">
      <defs>
        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#E0E7FF" />
          <stop offset="100%" stop-color="#818CF8" />
        </linearGradient>
      </defs>
      <!-- Stars -->
      <path d="M14 16 L15 13 L16 16 L19 17 L16 18 L15 21 L14 18 L11 17 Z" fill="#F8FAFC" class="star star-1" />
      <path d="M46 12 L47 10 L48 12 L50 13 L48 14 L47 16 L46 14 L44 13 Z" fill="#F8FAFC" class="star star-2" />
      <path d="M48 46 L49 44 L50 46 L52 47 L50 48 L49 50 L48 48 L46 47 Z" fill="#F8FAFC" class="star star-3" />
      <!-- Crescent Moon -->
      <path d="M37 14 C25.95 14 17 22.95 17 34 C17 45.05 25.95 54 37 54 C42.1 54 46.77 52.09 50.3 48.96 C42.8 48.1 36.8 41.6 36.8 33.7 C36.8 25.9 42.6 19.5 49.9 18.5 C46.2 15.68 41.8 14 37 14 Z" 
            fill="url(#moonGrad)" class="moon-body" />
    </svg>
  `,

  // Cloudy Day - Sun peeking through smooth cloud
  partlyCloudyDay: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-partly-cloudy-day" aria-hidden="true">
      <defs>
        <radialGradient id="sunBehind" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFE082" />
          <stop offset="100%" stop-color="#FF9800" />
        </radialGradient>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>
      </defs>
      <!-- Sun behind -->
      <circle cx="23" cy="23" r="11" fill="url(#sunBehind)" class="sun-behind" />
      <!-- Cloud in front -->
      <path d="M44 48 C49.5 48 54 43.5 54 38 C54 32.8 50 28.5 45 28.1 C44 21.8 38.6 17 32 17 C26.6 17 22 20.2 20 24.8 C18.7 24.3 17.4 24 16 24 C10.5 24 6 28.5 6 34 C6 39.5 10.5 44 16 44 L44 44 Z" 
            fill="url(#cloudGrad)" class="cloud-front" />
    </svg>
  `,

  // Cloudy Night - Moon behind cloud
  partlyCloudyNight: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-partly-cloudy-night" aria-hidden="true">
      <defs>
        <linearGradient id="moonBehindGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#93C5FD" />
        </linearGradient>
        <linearGradient id="nightCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#CBD5E1" />
          <stop offset="100%" stop-color="#64748B" />
        </linearGradient>
      </defs>
      <path d="M26 12 C18 12 11.5 18.5 11.5 26.5 C11.5 31.2 13.8 35.3 17.2 38 C16.5 35 17.5 31.7 19.8 29.5 C22.8 26.5 27.5 26 31 28 C30 19 28 12 26 12 Z" 
            fill="url(#moonBehindGrad)" class="moon-behind" />
      <path d="M44 48 C49.5 48 54 43.5 54 38 C54 32.8 50 28.5 45 28.1 C44 21.8 38.6 17 32 17 C26.6 17 22 20.2 20 24.8 C18.7 24.3 17.4 24 16 24 C10.5 24 6 28.5 6 34 C6 39.5 10.5 44 16 44 L44 44 Z" 
            fill="url(#nightCloudGrad)" class="cloud-front" />
    </svg>
  `,

  // Overcast / Full Clouds
  overcast: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-overcast" aria-hidden="true">
      <defs>
        <linearGradient id="cloudBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#94A3B8" />
          <stop offset="100%" stop-color="#64748B" />
        </linearGradient>
        <linearGradient id="cloudFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F1F5F9" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>
      </defs>
      <!-- Back cloud -->
      <path d="M48 38 C52 38 55 34.5 55 30.5 C55 26.8 52 23.5 48 23 C47 18 43 14 38 14 C33.5 14 29.8 16.5 28 20 C27 19.5 26 19 25 19 C20.5 19 17 22.5 17 27 C17 31.5 20.5 35 25 35 L48 35 Z" 
            fill="url(#cloudBackGrad)" class="cloud-back" />
      <!-- Front cloud -->
      <path d="M44 50 C49.5 50 54 45.5 54 40 C54 34.8 50 30.5 45 30.1 C44 23.8 38.6 19 32 19 C26.6 19 22 22.2 20 26.8 C18.7 26.3 17.4 26 16 26 C10.5 26 6 30.5 6 36 C6 41.5 10.5 46 16 46 L44 46 Z" 
            fill="url(#cloudFrontGrad)" class="cloud-front" />
    </svg>
  `,

  // Rain - Gentle rain drops falling from cloud
  rain: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-rain" aria-hidden="true">
      <defs>
        <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0" />
          <stop offset="100%" stop-color="#94A3B8" />
        </linearGradient>
      </defs>
      <path d="M44 38 C49.5 38 54 33.5 54 28 C54 22.8 50 18.5 45 18.1 C44 11.8 38.6 7 32 7 C26.6 7 22 10.2 20 14.8 C18.7 14.3 17.4 14 16 14 C10.5 14 6 18.5 6 24 C6 29.5 10.5 34 16 34 L44 34 Z" 
            fill="url(#rainCloudGrad)" class="cloud-rain" />
      <!-- Rain drops -->
      <g stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" class="raindrops">
        <line x1="20" y1="42" x2="17" y2="52" class="drop drop-1" />
        <line x1="32" y1="42" x2="29" y2="54" class="drop drop-2" />
        <line x1="44" y1="42" x2="41" y2="52" class="drop drop-3" />
      </g>
    </svg>
  `,

  // Thunderstorm - Cloud with vibrant lightning bolt & rain
  thunderstorm: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-thunderstorm" aria-hidden="true">
      <defs>
        <linearGradient id="stormCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#64748B" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
        <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="100%" stop-color="#EAB308" />
        </linearGradient>
      </defs>
      <path d="M44 36 C49.5 36 54 31.5 54 26 C54 20.8 50 16.5 45 16.1 C44 9.8 38.6 5 32 5 C26.6 5 22 8.2 20 12.8 C18.7 12.3 17.4 12 16 12 C10.5 12 6 16.5 6 22 C6 27.5 10.5 32 16 32 L44 32 Z" 
            fill="url(#stormCloudGrad)" class="cloud-storm" />
      <!-- Lightning bolt -->
      <polygon points="32,32 25,44 31,44 27,58 39,42 33,42" fill="url(#lightningGrad)" class="lightning" />
    </svg>
  `,

  // Snow - Soft cloud with crystalline snowflakes
  snow: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-snow" aria-hidden="true">
      <defs>
        <linearGradient id="snowCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>
      </defs>
      <path d="M44 36 C49.5 36 54 31.5 54 26 C54 20.8 50 16.5 45 16.1 C44 9.8 38.6 5 32 5 C26.6 5 22 8.2 20 12.8 C18.7 12.3 17.4 12 16 12 C10.5 12 6 16.5 6 22 C6 27.5 10.5 32 16 32 L44 32 Z" 
            fill="url(#snowCloudGrad)" />
      <!-- Snowflakes -->
      <g stroke="#93C5FD" stroke-width="2" stroke-linecap="round" class="snowflakes">
        <g transform="translate(18, 44)" class="flake flake-1">
          <line x1="0" y1="-4" x2="0" y2="4" />
          <line x1="-4" y1="0" x2="4" y2="0" />
          <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" />
          <line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
        </g>
        <g transform="translate(32, 48)" class="flake flake-2">
          <line x1="0" y1="-4" x2="0" y2="4" />
          <line x1="-4" y1="0" x2="4" y2="0" />
          <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" />
          <line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
        </g>
        <g transform="translate(46, 44)" class="flake flake-3">
          <line x1="0" y1="-4" x2="0" y2="4" />
          <line x1="-4" y1="0" x2="4" y2="0" />
          <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" />
          <line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
        </g>
      </g>
    </svg>
  `,

  // Fog / Mist - Floating soft waves
  fog: `
    <svg viewBox="0 0 64 64" class="weather-icon-svg icon-fog" aria-hidden="true">
      <defs>
        <linearGradient id="fogGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.2)" />
          <stop offset="50%" stop-color="rgba(255,255,255,0.85)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.2)" />
        </linearGradient>
      </defs>
      <g stroke="url(#fogGrad)" stroke-width="3.5" stroke-linecap="round" class="fog-lines">
        <line x1="12" y1="20" x2="52" y2="20" class="fog-1" />
        <line x1="8" y1="28" x2="56" y2="28" class="fog-2" />
        <line x1="14" y1="36" x2="50" y2="36" class="fog-3" />
        <line x1="10" y1="44" x2="54" y2="44" class="fog-4" />
      </g>
    </svg>
  `,

  // Atmospheric Metric Icons
  wind: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-metric-icon">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
    </svg>
  `,

  sunrise: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-metric-icon sun-rise-icon">
      <path d="M12 2v6"></path>
      <path d="m4.93 10.93 1.41 1.41"></path>
      <path d="M20 18h2"></path>
      <path d="M2 18h2"></path>
      <path d="m19.07 10.93-1.41 1.41"></path>
      <path d="M22 22H2"></path>
      <path d="m8 6 4-4 4 4"></path>
      <path d="M16 18a4 4 0 0 0-8 0"></path>
    </svg>
  `,

  sunset: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-metric-icon sun-set-icon">
      <path d="M12 10v6"></path>
      <path d="m4.93 10.93 1.41 1.41"></path>
      <path d="M20 18h2"></path>
      <path d="M2 18h2"></path>
      <path d="m19.07 10.93-1.41 1.41"></path>
      <path d="M22 22H2"></path>
      <path d="m16 8-4 4-4-4"></path>
      <path d="M16 18a4 4 0 0 0-8 0"></path>
    </svg>
  `,

  // Extended Feature Icons
  leaf: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-metric-icon aqi-icon">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>
  `,

  starOutline: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="star-icon">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  `,

  starFilled: `
    <svg viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="star-icon star-active">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  `,

  mic: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-action-icon">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
  `,

  share: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  `,

  globe: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  `,

  compare: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon">
      <path d="M16 3h5v5"></path>
      <path d="M8 21H3v-5"></path>
      <path d="M21 3l-7 7"></path>
      <path d="M3 21l7-7"></path>
    </svg>
  `,

  chart: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon">
      <path d="M3 3v18h18"></path>
      <path d="m19 9-5 5-4-4-3 3"></path>
    </svg>
  `,

  themeLight: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `,

  themeDark: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `,

  locationPin: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-pin-icon">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `,

  gpsTarget: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="22" y1="12" x2="18" y2="12"></line>
      <line x1="6" y1="12" x2="2" y2="12"></line>
      <line x1="12" y1="6" x2="12" y2="2"></line>
      <line x1="12" y1="22" x2="12" y2="18"></line>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `,

  refresh: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon refresh-icon-svg">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
      <path d="M8 16H3v5"></path>
    </svg>
  `,

  search: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-input-icon">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,

  settings: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-btn-icon">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  `,

  chevronRight: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `,

  chevronLeft: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  `,

  rainDropSmall: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="rain-drop-mini">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
  `,

  alertTriangle: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="severe-icon">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  `
};

/**
 * Returns matching SVG string for given condition code and day/night state.
 */
function getWeatherIcon(condition, isDay = true) {
  const cond = (condition || '').toLowerCase();
  
  if (cond.includes('thunder') || cond.includes('storm')) {
    return WeatherIcons.thunderstorm;
  }
  if (cond.includes('snow') || cond.includes('sleet') || cond.includes('blizzard') || cond.includes('ice')) {
    return WeatherIcons.snow;
  }
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    return WeatherIcons.rain;
  }
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze') || cond.includes('smoke')) {
    return WeatherIcons.fog;
  }
  if (cond.includes('overcast')) {
    return WeatherIcons.overcast;
  }
  if (cond.includes('cloud') || cond.includes('partly')) {
    return isDay ? WeatherIcons.partlyCloudyDay : WeatherIcons.partlyCloudyNight;
  }
  // Default to clear
  return isDay ? WeatherIcons.clearDay : WeatherIcons.clearNight;
}

/**
 * Helper to get local vendored SVG flag image for ISO 2-letter country code
 * Windows does not render flag emojis, so real SVG images in /assets/flags are used.
 */
function getCountryFlagImg(iso, className = 'country-flag-img', size = 22) {
  if (!iso || typeof iso !== 'string' || iso.trim().length !== 2) {
    return `<span class="flag-fallback">🌐</span>`;
  }
  const code = iso.trim().toLowerCase();
  const alt = iso.trim().toUpperCase();
  const h = Math.round(size * 0.73);
  return `<img src="assets/flags/${code}.svg" alt="${alt}" class="${className}" width="${size}" height="${h}" loading="lazy" onerror="this.onerror=null;this.replaceWith(document.createTextNode('${alt}'))" />`;
}

/**
 * Backwards compatibility helper: delegates to SVG flag images
 */
function getCountryFlagEmoji(iso) {
  return getCountryFlagImg(iso);
}
