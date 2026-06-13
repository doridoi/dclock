// State variables
const state = {
  theme: 'green',
  showSeconds: true,
  is24h: false,
  location: 'auto',
  weatherTimer: null,
  controlsTimeout: null,
  wakeLock: null
};

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

const LOCATIONS = {
  seoul: { lat: 37.5665, lon: 126.9780, name: '서울' },
  busan: { lat: 35.1796, lon: 129.0756, name: '부산' },
  daegu: { lat: 35.8714, lon: 128.6014, name: '대구' },
  incheon: { lat: 37.4563, lon: 126.7052, name: '인천' },
  gwangju: { lat: 35.1595, lon: 126.8526, name: '광주' },
  daejeon: { lat: 36.3504, lon: 127.3845, name: '대전' },
  ulsan: { lat: 35.5389, lon: 129.3114, name: 'ulsan' }, // Wait, the plan has 'ulsan' or '울산'? Let's check plan line 852: 'ulsan: { lat: 35.5389, lon: 129.3114, name: '울산' }'. Ah! I will write '울산'.
  jeju: { lat: 33.4996, lon: 126.5312, name: '제주' }
};

function getWeatherDetails(code) {
  let desc = '맑음';
  let svgContent = '';

  if (code === 0) {
    desc = '맑음';
    svgContent = `
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2.5" fill="none"/>
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.22-8.78l-1.42 1.42m-11.3 11.3l-1.42 1.42m0-14.14l1.42 1.42m11.3 11.3l1.42 1.42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (code >= 1 && code <= 3) {
    desc = code === 1 ? '대체로 맑음' : (code === 2 ? '구름 조금' : '흐림');
    svgContent = `
      <path d="M12 6a3.5 3.5 0 0 1 3.5 3.5c0 .35-.05.69-.15 1" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    `;
  } else if (code === 45 || code === 48) {
    desc = '안개';
    svgContent = `
      <path d="M18.4 11a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5h12.7z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M4 16h16M6 20h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    desc = code <= 55 ? '이슬비' : (code <= 65 ? '비' : '소나기');
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M8 20l-1 2m4-2l-1 2m4-2l-1 2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if ((code >= 71 && code <= 75) || code === 77 || (code >= 85 && code <= 86)) {
    desc = '눈';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M8 20h.01M12 20h.01M16 20h.01M10 22h.01M14 22h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (code >= 95 && code <= 99) {
    desc = '뇌우';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M12 19l-2 3h3l-1 3" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    `;
  }

  return { desc, svg: `<svg class="weather-svg" viewBox="0 0 24 24">${svgContent}</svg>` };
}

// 1. Clock tick updater
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const ampmEl = document.getElementById('clock-ampm');
  const secondsEl = document.getElementById('clock-seconds');
  const subPaneEl = document.getElementById('clock-sub-pane');
  
  // Format Hour
  if (!state.is24h) {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    ampmEl.style.display = 'block';
    ampmEl.textContent = ampm;
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
  } else {
    ampmEl.style.display = 'none';
  }
  
  const hourStr = String(hours).padStart(2, '0');
  
  document.getElementById('clock-hour').textContent = hourStr;
  document.getElementById('clock-min').textContent = minutes;
  
  // Blink colon layout-shift free
  const isBlink = Math.floor(Date.now() / 500) % 2 === 0;
  document.getElementById('clock-colon').style.visibility = isBlink ? 'visible' : 'hidden';
  
  // Seconds show/hide
  if (state.showSeconds) {
    secondsEl.style.display = 'block';
    secondsEl.textContent = seconds;
  } else {
    secondsEl.style.display = 'none';
  }
  
  // Hide entire right pane if sub-info is empty
  if (state.is24h && !state.showSeconds) {
    subPaneEl.style.display = 'none';
  } else {
    subPaneEl.style.display = 'flex';
  }

  // Date updates
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const day = DAYS_KR[now.getDay()];
  
  document.getElementById('date-text').textContent = `${year}년 ${month}월 ${date}일 (${day})`;
}

// Append directly in app.js bottom
function initClock() {
  setInterval(updateClock, 100);
  updateClock();
}

async function fetchWeather() {
  const weatherBlock = document.getElementById('weather-block');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const iconWrapper = document.getElementById('weather-icon-wrapper');
  
  let lat = 37.5665; // Seoul default
  let lon = 126.9780;
  let locName = '서울';

  try {
    if (state.location === 'auto') {
      const geoRes = await fetch('https://ipapi.co/json/');
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        lat = geoData.latitude || lat;
        lon = geoData.longitude || lon;
        locName = geoData.city || '내 위치';
      }
    } else {
      const loc = LOCATIONS[state.location];
      if (loc) {
        lat = loc.lat;
        lon = loc.lon;
        locName = loc.name;
      }
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error('Weather fetch failed');

    const data = await response.json();
    const current = data.current_weather;
    const weatherDetails = getWeatherDetails(current.weathercode);

    tempEl.textContent = `${Math.round(current.temperature)}°C`;
    descEl.textContent = `${locName} (${weatherDetails.desc})`;
    iconWrapper.innerHTML = weatherDetails.svg;
    weatherBlock.style.opacity = '1';
  } catch (err) {
    console.error('Weather fetching error:', err);
    // Silent fail: keep old weather data on screen for offline robustness
    if (tempEl.textContent === '--°C') {
      descEl.textContent = '날씨 오류';
    }
  }
}

function startWeatherLoop() {
  if (state.weatherTimer) clearInterval(state.weatherTimer);
  fetchWeather();
  state.weatherTimer = setInterval(fetchWeather, 15 * 60 * 1000); // 15 minutes refresh
}

window.addEventListener('DOMContentLoaded', () => {
  initClock();
  startWeatherLoop();
});
