# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

A small weather web app. Plain HTML, CSS and JavaScript — no framework,
no build step. It shows the **current** weather for a city the user
searches for. Forecast is planned but not built yet.

Data source: [WeatherAPI.com](https://www.weatherapi.com/) `current.json`.
Hosting: [Netlify](https://www.netlify.com/), including Netlify Functions.

The owner is learning to code. Explain changes in plain language and
prefer the simple, readable solution over the clever one.

## Secrets — hard rules

- The WeatherAPI key lives in `WEATHER_API_KEY`, read from `.env`
  locally and from Netlify's environment variables in production.
- **Never read, open, print, log, echo or commit `.env`.** Reading it is
  blocked in `.claude/settings.json`; do not work around that.
- **Never put the key in any file under version control**, and never in
  `app.js` or any other file the browser downloads.
- If a key is ever exposed, say so immediately and tell the owner to
  regenerate it at weatherapi.com.

## Layout

```
index.html                    markup, element IDs, and every SVG weather scene
styles.css                    all styling; colour tokens in :root, animations at the end
app.js                        browser code — theme, scene picking, outfit advice, fetch
netlify/functions/weather.js  server code — holds the key, calls WeatherAPI
netlify.toml                  publish dir, functions dir, /api redirect
.env                          local secrets (gitignored)
.env.example                  template, safe to commit
```

`app.js` is deliberately split into numbered parts:
1. light/dark theme, 2. condition code -> illustration, 3. clothing icons,
4. outfit logic, 5. fetch + render. Keep that shape when adding features.

## The one architectural rule

The browser never talks to weatherapi.com directly. It calls
`/api/weather?q=<city>`, which `netlify.toml` redirects to the function.
The function adds the key server-side. Keep it that way — putting the
key in `app.js` would expose it to every visitor.

## Things that will bite you

- An inline `<svg>` does **not** honour the `.hidden` property that normal
  HTML elements have. Scenes are shown with the `.is-showing` class instead.
- A CSS `transform` animation overrides an SVG `transform` attribute on the
  same element. Anything positioned by attribute and animated by CSS needs a
  wrapping `<g transform="...">`.
- Theme colours are declared three times on purpose: `:root` (light),
  `prefers-color-scheme: dark`, and `[data-theme="dark"]`. Add a new colour
  to all three or it will be wrong in one mode.

## Conventions

- Vanilla JS, no dependencies. Do not add a framework or a bundler
  without being asked.
- CSS: change colours and spacing via the custom properties in `:root`
  rather than hard-coding values further down.
- HTML: elements the JS touches get an `id`; styling hooks get a class.
- Keep the explanatory comments in the code — they are there for the
  owner, not decoration.

## Commands

```bash
netlify dev      # run locally with functions + .env  (http://localhost:8888)
netlify deploy   # draft deploy
```

Opening `index.html` directly in the browser will **not** work: there is
no server to answer `/api/weather`. Always use `netlify dev`.

## Roadmap

1. Current weather — done
2. Illustrated scenes + animations — done
3. Light/dark mode with manual toggle — done
4. "What to wear" advice — done (computed in the browser, no extra API call)
5. Forecast — WeatherAPI `forecast.json`, extra `days` parameter
6. Possible later: °C/°F toggle, geolocation, recent searches
