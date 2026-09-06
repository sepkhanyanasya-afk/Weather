/* ==================================================================
   app.js — runs in the visitor's browser.

   It never sees the API key. It only ever calls our own address,
   /api/weather, which Netlify forwards to the server function.
   ================================================================== */

const DEFAULT_CITY = "Yerevan";

/* ==================================================================
   PART 1 — Light / dark mode
   ================================================================== */

const THEME_KEY = "weather-theme";
const root = document.documentElement;

// If a choice was saved last time, apply it before anything is drawn.
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
} catch (e) {
  // Some browsers block storage. Not a problem — we just use the
  // system setting instead.
}

document.getElementById("theme-toggle").addEventListener("click", function () {
  // What are we looking at right now?
  const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = root.getAttribute("data-theme") || (systemIsDark ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";

  root.setAttribute("data-theme", next);
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
});

/* ==================================================================
   PART 2 — Which picture goes with which weather

   WeatherAPI sends a number ("condition code") for each kind of
   weather. These lists say which of our drawings to show for it.
   Full list: https://www.weatherapi.com/docs/weather_conditions.json
   ================================================================== */

const CLOUDY  = [1006, 1009];
const FOG     = [1030, 1135, 1147];
const HAZY    = [1012, 1015, 1018, 1021, 1024, 1027, 1033, 1036, 1039, 1042, 1045, 1048];
const RAIN    = [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195,
                 1198, 1201, 1240, 1243, 1246];
const SNOW    = [1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258];
const SLEET   = [1069, 1072, 1204, 1207, 1237, 1249, 1252, 1261, 1264];
const THUNDER = [1087, 1273, 1276, 1279, 1282];

function sceneFor(code, isDay) {
  if (code === 1000) return isDay ? "sun" : "moon";
  if (code === 1003) return isDay ? "partly-day" : "partly-night";
  if (CLOUDY.includes(code))  return "cloudy";
  if (FOG.includes(code))     return "fog";
  if (HAZY.includes(code))    return "wind";
  if (THUNDER.includes(code)) return "thunder";
  if (SLEET.includes(code))   return "sleet";
  if (SNOW.includes(code))    return "snow";
  if (RAIN.includes(code))    return "rain";
  return "cloudy";  // anything unexpected
}

/* ==================================================================
   PART 3 — The clothing icons

   Each is a small drawing. The CSS gives them their colour, so the
   shapes here only describe the lines.
   ================================================================== */

const ICONS = {
  tshirt:     '<svg viewBox="0 0 24 24"><path d="M8 3.5 4.5 5.5 2.5 10l3.5 1.2V20.5h12V11.2L21.5 10 19.5 5.5 16 3.5a4 4 0 0 1-8 0Z"/></svg>',
  longsleeve: '<svg viewBox="0 0 24 24"><path d="M8 3.5 4 5.5 2 15.5l3 1 1-4.5v8.5h12V12l1 4.5 3-1-2-10-4-2a4 4 0 0 1-8 0Z"/></svg>',
  jacket:     '<svg viewBox="0 0 24 24"><path d="M8 3.5 4 5.5 2.5 11l3 1v8.5h13V12l3-1L20 5.5l-4-2"/><path d="M8 3.5 12 8l4-4.5M12 8v12.5M6.5 8.5v11"/></svg>',
  coat:       '<svg viewBox="0 0 24 24"><path d="M8 2.5 4 4.5 2.5 11l3 1v9.5h13V12l3-1L20 4.5l-4-2"/><path d="M8 2.5 12 7l4-4.5M12 7v14.5M5.5 13.5h13"/></svg>',
  shorts:     '<svg viewBox="0 0 24 24"><path d="M4.5 4h15v4l1 8.5h-6L12 10l-2.5 6.5h-6l1-8.5Z"/><path d="M4.5 8h15"/></svg>',
  beanie:     '<svg viewBox="0 0 24 24"><path d="M4 14a8 8 0 0 1 16 0"/><rect x="2.5" y="14" width="19" height="5" rx="2.5"/></svg>',
  scarf:      '<svg viewBox="0 0 24 24"><path d="M5 6.5h14v4a7 7 0 0 1-14 0Z"/><path d="M9 17.5v4.5M15 17v3.5"/></svg>',
  gloves:     '<svg viewBox="0 0 24 24"><path d="M7 21.5V11a5 5 0 0 1 10 0v10.5Z"/><path d="M17 12.5a2.5 2.5 0 0 1 0 5M7 18h10"/></svg>',
  boots:      '<svg viewBox="0 0 24 24"><path d="M7.5 2.5h5.5v11c0 1 .6 1.7 1.6 2l3.9 1.4v4.6H7.5Z"/><path d="M7.5 18.5h10"/></svg>',
  umbrella:   '<svg viewBox="0 0 24 24"><path d="M2.5 12a9.5 9.5 0 0 1 19 0Z"/><path d="M12 12v7a2.5 2.5 0 0 1-5 0"/></svg>',
  sunglasses: '<svg viewBox="0 0 24 24"><path d="M2.5 8.5h19"/><circle cx="7" cy="13" r="4"/><circle cx="17" cy="13" r="4"/><path d="M11 12.5h2"/></svg>',
  sunscreen:  '<svg viewBox="0 0 24 24"><rect x="7" y="8" width="10" height="13.5" rx="2.5"/><path d="M9.5 8V4.5h5V8M8 12.5h8"/></svg>',
  water:      '<svg viewBox="0 0 24 24"><path d="M8 7h8v12.5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2Z"/><path d="M9.5 7V2.5h5V7M8 13h8"/></svg>',
};

const LABELS = {
  tshirt: "T-shirt", longsleeve: "Long sleeves", jacket: "Jacket", coat: "Warm coat",
  shorts: "Shorts", beanie: "Hat", scarf: "Scarf", gloves: "Gloves", boots: "Boots",
  umbrella: "Umbrella", sunglasses: "Sunglasses", sunscreen: "Sunscreen", water: "Drink water",
};

/* ==================================================================
   PART 4 — What to wear

   All of this is worked out here in the browser from numbers the API
   already sent. No extra request, no extra cost.
   ================================================================== */

function outfitFor(now) {
  const feels = now.feelslike_c;
  const code  = now.condition.code;

  const wet    = RAIN.includes(code) || SLEET.includes(code) || THUNDER.includes(code) || now.precip_mm > 0;
  const snowy  = SNOW.includes(code) || SLEET.includes(code);
  const windy  = now.wind_kph >= 30;
  const sunny  = now.uv >= 6 && now.is_day === 1 && !wet;

  let headline;
  const items = [];

  // Start from how cold it feels — that matters more than the
  // thermometer, because wind and damp change how you experience it.
  if (feels <= -5)      { headline = "Bitterly cold";  items.push("coat", "beanie", "scarf", "gloves", "boots"); }
  else if (feels < 3)   { headline = "Properly cold";  items.push("coat", "beanie", "scarf"); }
  else if (feels < 10)  { headline = "Chilly";         items.push("jacket", "scarf"); }
  else if (feels < 17)  { headline = "Mild";           items.push("jacket", "longsleeve"); }
  else if (feels < 23)  { headline = "Pleasant";       items.push("longsleeve"); }
  else if (feels < 30)  { headline = "Warm";           items.push("tshirt"); }
  else                  { headline = "Hot";            items.push("tshirt", "shorts", "water"); }

  // Then adjust for what the sky is doing.
  if (wet)   { headline += " and wet";   items.push("umbrella"); }
  if (snowy) { items.push("boots"); }
  if (windy) { headline += wet ? ", windy too" : " and windy"; items.push("jacket"); }
  if (sunny) { items.push("sunglasses", "sunscreen"); }

  // Remove anything listed twice, keeping the first appearance.
  const unique = items.filter(function (item, i) { return items.indexOf(item) === i; });

  return { headline: headline, items: unique };
}

/* ==================================================================
   PART 5 — Talking to our server and drawing the result
   ================================================================== */

const form     = document.getElementById("search-form");
const input    = document.getElementById("search-input");
const statusEl = document.getElementById("status");
const errorEl  = document.getElementById("error");
const resultEl = document.getElementById("result");
const scenesEl = document.getElementById("scenes");

function showLoading() { statusEl.hidden = false; errorEl.hidden = true;  resultEl.hidden = true;  }
function showResult()  { statusEl.hidden = true;  errorEl.hidden = true;  resultEl.hidden = false; }
function showError(m)  { statusEl.hidden = true;  errorEl.hidden = false; resultEl.hidden = true; errorEl.textContent = m; }

async function getWeather(city) {
  showLoading();
  try {
    const response = await fetch("/api/weather?q=" + encodeURIComponent(city));
    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Could not load the weather.");
      return;
    }
    render(data);
  } catch (err) {
    showError("Network problem. Check your connection and try again.");
  }
}

function render(data) {
  const place = data.location;
  const now   = data.current;

  // --- the illustration: hide every scene, then show the right one
  const scenes = scenesEl.querySelectorAll(".scene");
  const wanted = sceneFor(now.condition.code, now.is_day === 1);
  scenes.forEach(function (svg) {
    // NOTE: an <svg> ignores the .hidden property that normal HTML
    // elements have, so we switch a CSS class instead.
    svg.classList.toggle("is-showing", svg.dataset.scene === wanted);
  });

  // --- the numbers
  document.getElementById("temp").textContent           = Math.round(now.temp_c) + "°";
  document.getElementById("condition-text").textContent = now.condition.text;
  document.getElementById("place-name").textContent     = place.name + ", " + place.country;

  // Some places repeat the city name as the region (e.g. Yerevan).
  // Only show the region when it actually adds information.
  document.getElementById("place-region").textContent =
    place.region && place.region !== place.name ? place.region : "";

  // --- what to wear
  const advice = outfitFor(now);
  document.getElementById("outfit-headline").textContent = advice.headline;
  document.getElementById("outfit-items").innerHTML = advice.items.map(function (key) {
    return '<li class="outfit__item">' + ICONS[key] + "<span>" + LABELS[key] + "</span></li>";
  }).join("");

  // --- the detail tiles
  document.getElementById("feelslike").textContent  = Math.round(now.feelslike_c) + "°";
  document.getElementById("humidity").textContent   = now.humidity + "%";
  document.getElementById("wind").textContent       = Math.round(now.wind_kph) + " km/h";
  document.getElementById("uv").textContent         = now.uv;
  document.getElementById("pressure").textContent   = now.pressure_mb + " mb";
  document.getElementById("visibility").textContent = now.vis_km + " km";

  document.getElementById("updated").textContent =
    "Local time " + place.localtime + " · updated " + now.last_updated;

  showResult();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const city = input.value.trim();
  if (city) getWeather(city);
});

getWeather(DEFAULT_CITY);
