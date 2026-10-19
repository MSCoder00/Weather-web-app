Weather Web App – Product Requirements Document
Version 1.0 · Stack: HTML, CSS, JavaScript, Weather API
1. Overview
A live weather web app that detects the user's location and shows real-time conditions and forecasts. The screen updates dynamically as the weather, time of day, unit, or city changes. No sign-up is needed.
2. Problem and Goal
Problem: Many weather sites are cluttered, slow, or need a manual city search before they show anything useful.
Goal: Show accurate weather for the user's current location within seconds, on one clean screen.
3. Target Users
• Everyday users who want a quick check before going out.
• Mobile users who need a fast, readable screen.
• Travellers who want to look up other cities.
4. Scope
In scope (Version 1)
• Live weather for the user's current location.
• City search.
• Current conditions, hourly forecast, 5-day forecast.
• °C / °F toggle.
• Auto-refresh.
• Weather-based visual theme (day/night, rain, clear, etc.).
Out of scope (Version 1)
• User accounts and saved cities.
• Weather maps and radar.
• Severe weather alerts and notifications.
• Languages other than English.
5. Functional Requirements
ID
Feature
Requirement
F1
Live location
On load, ask the browser for the user's location (Geolocation API) and fetch weather for those coordinates.
F2
Location fallback
If permission is denied or unavailable, show a clear message and load a default city. The user can still search.
F3
City search
After 2 or more letters, show up to 5 matching cities. Selecting one loads its weather.
F4
Current weather
Show place name, local time, temperature, feels-like, condition text, icon, today's high and low.
F5
Details
Show humidity, wind speed, pressure, visibility (or UV index), sunrise and sunset.
F6
Hourly forecast
Show the next 24 hours in 3-hour steps (time, icon, temperature).
F7
5-day forecast
Show each day's icon, low and high, with a range bar.
F8
Unit toggle
Switch °C / °F instantly, without a new request.
F9
Auto-refresh
Reload data every 10 minutes. A "My location" button refreshes on demand.
F10
Dynamic UI
Background and icons change with the condition (clear, clouds, rain, storm, snow, fog) and with day or night.
F11
States
Show a loading message, and a plain error message with a next step if a request fails.
6. Weather API
Primary: OpenWeatherMap
• Current weather: /data/2.5/weather
• Forecast (3-hourly, 5 days): /data/2.5/forecast
• Query by lat, lon, units=metric, and the API key.
Backup: Open-Meteo (free, no key needed)
• Used automatically if the primary call fails (for example an invalid key or rate limit).
• Also used for city search (geocoding).
Rules
• Both sources are converted to the same internal format so the screen code does not care which one answered.
• The footer states which source supplied the data.
• The API key is visible in front-end code. For a public site, restrict the key's usage in the provider dashboard.
7. User Flow
1. User opens the app.
2. Browser asks for location permission.
3. Allowed: weather loads for the user's coordinates.
4. Denied: a notice appears and the default city loads.
5. User can search another city, switch units, or refresh.
6. Data refreshes automatically every 10 minutes.
8. Screen Layout
1. Top bar: search box, "My location" button, °C/°F toggle.
2. Hero: place name, local time, large temperature, condition, feels-like, high/low.
3. Next 24 hours: horizontal strip.
4. Right now: humidity, wind, pressure, visibility/UV, sunrise, sunset.
5. 5-day forecast: rows with range bars.
6. Footer: data source and refresh note.
9. Non-Functional Requirements
• Speed: weather visible within 3 seconds of location permission on a normal connection.
• Responsive: works from 320px phones to desktop.
• Accessibility: visible keyboard focus, readable contrast, reduced-motion respected.
• Privacy: location is used only to fetch weather. Nothing is stored or sent anywhere else.
• Browsers: current Chrome, Edge, Safari, Firefox. Location needs HTTPS or localhost.
10. Error Handling
Situation
What the user sees
Location denied
Notice plus default city; search still works.
API key rejected
Backup source is used silently.
No internet
Message asking to check the connection and retry.
No city match
"No city found" in the search list.
11. Success Metrics
• Weather appears within 3 seconds for at least 90% of loads.
• Zero blank screens when the primary API fails.
• Temperatures remain correct after unit switching.
• Location detection works for users who allow permission.
12. Risks
Risk
Mitigation
Exposed API key
Restrict usage in the provider dashboard; consider a small server proxy later.
Free-tier call limits
Refresh only every 10 minutes; fall back to Open-Meteo.
Inaccurate location (Wi-Fi/IP)
Request high accuracy; let the user search manually.
Provider downtime
Backup source.
13. Milestones
Phase
Work
1
Layout and styling (HTML, CSS).
2
Location, API calls, data conversion (JavaScript).
3
Search, units, auto-refresh, error states.
4
Testing on phone and desktop, then launch.
14. Future Ideas
• Saved cities and favourites.
• Weather alerts.
• Air quality index.
• Rain radar map.
• Bangla and other languages.