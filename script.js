/* =============================================
   SKYE — Weather Advisor
   script.js
   ============================================= */

const msgs = {
  walk: {
    yes: [
      "Go touch grass. Literally.",
      "Outside is calm. Unlike your overthinking.",
      "Fresh air might fix your attitude.",
      "Go clear your head. It needs it.",
      "Nature called. Pick up."
    ],
    no: [
      "Sun said violence today.",
      "Walk if you enjoy regret.",
      "Your skin will file a complaint.",
      "Stay in. Hydrate. Reconsider.",
      "Today is an indoor character arc."
    ]
  },
  gym: {
    yes: [
      "Stop negotiating. Go lift something.",
      "Weather approved. Your excuses denied.",
      "Go before motivation logs out.",
      "If not today, then when? 2032?",
      "Even the clouds are more consistent than you."
    ],
    no: [
      "Fine. Even I wouldn't step out in this.",
      "Okay, this one's valid. Rest day.",
      "Today the weather wins. You rest.",
      "We train tomorrow. Today we survive.",
      "Even discipline has limits."
    ]
  },
  college: {
    yes: [
      "Attendance matters. Unlike your attention span.",
      "Weather's fine. No excuse. Shocking.",
      "Your GPA is quietly begging.",
      "The lecture won't attend itself.",
      "Professors noticed. Surprisingly."
    ],
    no: [
      "Canvas exists for a reason.",
      "Zoom link is right there.",
      "Academic integrity intact. Attendance debatable.",
      "Study from bed. The couch approves.",
      "Even your professor is reconsidering."
    ]
  },
  outing: {
    yes: [
      "Go. Look put-together. Pretend you planned this.",
      "Main character energy is valid today.",
      "Peak vibe hours. Don't waste them.",
      "The city is yours. Try not to overspend.",
      "Slay. The weather cooperated."
    ],
    no: [
      "The plans cancelled themselves.",
      "Postpone. Your dignity thanks you.",
      "Stay in. Order food. No shame.",
      "Outdoor chaos is not the aesthetic.",
      "The vibe is off. Literally."
    ]
  }
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function analyze(weatherData, purpose) {
  const temp     = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const wind     = weatherData.wind.speed;
  const skyMain  = weatherData.weather[0].main.toLowerCase();
  const isRain   = ['rain', 'drizzle', 'thunderstorm', 'snow'].includes(skyMain);

  let go = false, risk = 'Low', bestTime = '';

  if (purpose === 'walk') {
    go       = !isRain && temp > 10 && temp < 38 && wind < 10;
    risk     = isRain ? 'High' : (temp > 35 || humidity > 85) ? 'Medium' : 'Low';
    bestTime = temp > 30 ? '6–8 AM' : '7–9 AM';
  } else if (purpose === 'gym') {
    go       = !isRain && temp < 42 && wind < 15;
    risk     = (isRain || wind > 15) ? 'High' : temp > 38 ? 'Medium' : 'Low';
    bestTime = '6–8 AM or 6–8 PM';
  } else if (purpose === 'college') {
    go       = !['thunderstorm', 'snow'].includes(skyMain) && temp > 5 && wind < 20;
    risk     = skyMain === 'thunderstorm' ? 'High' : isRain ? 'Medium' : 'Low';
    bestTime = '8–9 AM';
  } else if (purpose === 'outing') {
    go       = ['clear', 'clouds'].includes(skyMain) && temp > 15 && temp < 36
                 && humidity < 80 && !isRain && wind < 12;
    risk     = isRain ? 'High' : (temp > 34 || humidity > 80) ? 'Medium' : 'Low';
    bestTime = '5–8 PM';
  }

  return { go, risk, bestTime };
}

async function checkWeather() {
  const city       = document.getElementById('cityInput').value.trim();
  const purpose    = document.getElementById('purposeSelect').value;
  const btn        = document.getElementById('checkBtn');
  const btnText    = document.getElementById('btnText');
  const resultCard = document.getElementById('resultCard');
  const errorMsg   = document.getElementById('errorMsg');

  resultCard.classList.remove('visible');
  errorMsg.classList.remove('visible');

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  btn.disabled      = true;
  btnText.innerHTML = 'Fetching… <span class="spinner"></span>';

  try {
    // ✅ Calls your own Vercel serverless function — API key stays on the server
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

    if (!response.ok) {
      const err = await response.json();
      if (response.status === 404) throw new Error("City not found. Check the spelling.");
      throw new Error(err.error || "Something went wrong. Please try again.");
    }

    const data = await response.json();
    const { go, risk, bestTime } = analyze(data, purpose);

    const banner = document.getElementById('decisionBanner');
    banner.className = `decision-banner ${go ? 'go' : 'no-go'}`;

    document.getElementById('dIcon').textContent    = go ? '✅' : '⛔';
    document.getElementById('dLabel').textContent   = go ? 'Decision — Go ahead' : 'Decision — Stay in';
    document.getElementById('dVerdict').textContent = go
      ? `Good conditions for your ${purpose} today.`
      : `Not ideal for your ${purpose} today.`;
    document.getElementById('dSassy').textContent   = pick(msgs[purpose][go ? 'yes' : 'no']);

    const riskEl       = document.getElementById('riskVal');
    riskEl.textContent = risk;
    riskEl.className   = `mc-val risk-${risk.toLowerCase()}`;

    document.getElementById('bestTime').textContent = bestTime;
    document.getElementById('condVal').textContent  = data.weather[0].main;

    const temp = data.main.temp;
    let tempIcon = '🌡️';
    if      (temp > 35) tempIcon = '🔥';
    else if (temp > 25) tempIcon = '☀️';
    else if (temp > 15) tempIcon = '🌤️';
    else                tempIcon = '❄️';

    document.getElementById('tempIcon').textContent  = tempIcon;
    document.getElementById('tempVal').textContent   = `${Math.round(temp)}°C`;
    document.getElementById('feelsVal').textContent  = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidVal').textContent  = `${data.main.humidity}%`;
    document.getElementById('windVal').textContent   = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('visVal').textContent    = data.visibility
      ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A';
    document.getElementById('cloudsVal').textContent = `${data.clouds.all}%`;
    document.getElementById('locationLine').textContent =
      `${data.name}, ${data.sys.country} · ${data.weather[0].description}`;

    resultCard.classList.add('visible');

  } catch (error) {
    showError(error.message);
  } finally {
    btn.disabled        = false;
    btnText.textContent = 'Check Weather';
  }
}

function showError(message) {
  const el       = document.getElementById('errorMsg');
  el.textContent = message;
  el.classList.add('visible');
}

document.getElementById('cityInput').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') checkWeather();
});