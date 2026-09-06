# Weather app

Current weather and a 3-day forecast for any city, with illustrated
conditions and clothing advice. Plain HTML, CSS and JavaScript, deployed
on Netlify. The WeatherAPI key is kept on the server, never in the browser.

---

## 1. Add your API key (2 minutes)

In this folder, create a file called `.env` (exact name, starts with a dot)
containing one line:

```
WEATHER_API_KEY=paste_your_real_key_here
```

`.env` is listed in `.gitignore`, so it will never be uploaded to GitHub.
`.env.example` is the committed template that shows the format.

## 2. Run it on your computer

You need the Netlify CLI once:

```bash
npm install -g netlify-cli
```

Then, from this folder:

```bash
netlify dev
```

Open <http://localhost:8888>.

> Do **not** just double-click `index.html`. There would be no server to
> answer `/api/weather`, so nothing would load.

## 3. Put it on GitHub

```bash
git init
git branch -M main
git add .
git commit -m "Weather app: current conditions"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Before pushing, run `git status` and confirm `.env` is **not** in the list.

## 4. Deploy on Netlify

1. Go to <https://app.netlify.com> → **Add new site** → **Import an existing project**.
2. Choose GitHub and pick this repository.
3. Build settings: leave **build command** empty, **publish directory** `.`.
   Netlify reads `netlify.toml` and finds the rest itself.
4. **Deploy site.**
5. Then — this step is essential — go to
   **Site configuration → Environment variables → Add a variable**:
   - Key: `WEATHER_API_KEY`
   - Value: your real key
6. **Deploys → Trigger deploy → Deploy site** so the new variable is picked up.

Without step 5 the live site will say *"Server is missing WEATHER_API_KEY."*

---

## How it fits together

```
browser (app.js)
   │  GET /api/weather?q=London
   ▼
netlify.toml redirect
   │
   ▼
netlify/functions/weather.js   ← the key lives here, on the server
   │  GET api.weatherapi.com/v1/current.json?key=...&q=London
   ▼
WeatherAPI  →  JSON  →  back to the browser  →  drawn on the page
```

## Files

| File | What it does |
|---|---|
| `index.html` | The page structure |
| `styles.css` | All styling; colours and spacing live in `:root` at the top |
| `app.js` | Runs in the browser: search box, fetch, draw results |
| `netlify/functions/weather.js` | Runs on the server: adds the key, calls WeatherAPI |
| `netlify.toml` | Tells Netlify where things are, and the `/api/weather` shortcut |
| `.gitignore` | Keeps `.env` out of git |
| `.env.example` | Template for `.env` |
| `CLAUDE.md` | Notes for Claude Code |

## Making changes

The site redeploys itself whenever you push to `main`:

```bash
git add .
git commit -m "what you changed"
git push
```

Watch it build at app.netlify.com under **Deploys**.

## Next up

Possible additions: °C/°F toggle, "use my location", recent searches,
tappable forecast days.
