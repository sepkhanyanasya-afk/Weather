/* =================================================================
   netlify/functions/weather.js

   This is SERVER code. It runs on Netlify's machines, never in the
   visitor's browser. That is why it is safe for the API key to be
   here: nobody can view its source.

   Flow:  browser  ->  /api/weather?q=London  ->  this file
          this file  ->  weatherapi.com (with the key)  ->  back
   ================================================================= */

exports.handler = async function (event) {
  // 1. Read the city the browser asked for.
  const query = (event.queryStringParameters && event.queryStringParameters.q) || "";

  if (!query.trim()) {
    return json(400, { error: "Please type a city name." });
  }

  // 2. Read the secret key from the environment.
  //    Locally this comes from the .env file; on Netlify it comes
  //    from Site settings -> Environment variables.
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return json(500, { error: "Server is missing WEATHER_API_KEY." });
  }

  // 3. Build the WeatherAPI request.
  //    forecast.json gives us today's conditions AND the next days in
  //    one call, so it replaces current.json entirely.
  //    days=3 is the maximum on the free plan.
  const url =
    "https://api.weatherapi.com/v1/forecast.json" +
    "?key=" + encodeURIComponent(apiKey) +
    "&q=" + encodeURIComponent(query) +
    "&days=3&aqi=no&alerts=no";

  try {
    const response = await fetch(url);
    const data = await response.json();

    // 4. WeatherAPI reports its own problems in data.error.
    if (!response.ok) {
      const message =
        (data && data.error && data.error.message) || "Weather service error.";
      // Never pass the raw upstream status through blindly — 401 would
      // make the browser think the VISITOR is unauthorised.
      const status = response.status === 400 ? 400 : 502;
      return json(status, { error: message });
    }

    // 5. Send only what the page needs. No key, ever.
    return json(200, {
      location: data.location,
      current: data.current,
      forecast: data.forecast,
    });
  } catch (err) {
    return json(502, { error: "Could not reach the weather service." });
  }
};

// Small helper so every reply has the same shape.
function json(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      // Let the browser cache an answer for 60s. Weather does not
      // change second by second, and it saves your free-tier quota.
      "Cache-Control": "public, max-age=60",
    },
    body: JSON.stringify(body),
  };
}
