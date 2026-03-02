// api/weather.js
// This runs on Vercel's server — the API key never reaches the browser

export default async function handler(req, res) {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  const API_KEY = process.env.WEATHER_API_KEY; // read from Vercel env variables
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
}