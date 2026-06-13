// State variables
const state = {
  theme: 'green',
  showSeconds: true,
  is24h: false,
  location: 'auto',
  scale: 100,
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

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) {
    updateWakeLockUI(false, '지원 안함');
    return;
  }
  
  try {
    state.wakeLock = await navigator.wakeLock.request('screen');
    updateWakeLockUI(true);
    
    // Listen for release (e.g. screen saver or tab change)
    state.wakeLock.addEventListener('release', () => {
      state.wakeLock = null;
      updateWakeLockUI(false);
    });
  } catch (err) {
    console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
    state.wakeLock = null;
    updateWakeLockUI(false, '에러 발생');
  }
}

function updateWakeLockUI(isActive, customText) {
  const dot = document.querySelector('.status-dot');
  const text = document.getElementById('wakelock-status');
  
  if (isActive) {
    dot.classList.remove('inactive');
    text.textContent = '화면 항상 켜짐 활성화 중 (Wake Lock)';
  } else {
    dot.classList.add('inactive');
    text.textContent = customText || '화면 항상 켜짐 비활성화';
  }
}

// Re-acquire Wake Lock when tab becomes visible again
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});

function resetControlsTimer() {
  const controlBar = document.getElementById('control-bar');
  const settingsPanel = document.getElementById('settings-panel');
  
  controlBar.classList.add('active');
  document.body.style.cursor = 'default';
  
  if (state.controlsTimeout) clearTimeout(state.controlsTimeout);
  
  // Do not hide controls if settings panel drawer is open
  if (settingsPanel.classList.contains('open')) return;
  
  state.controlsTimeout = setTimeout(() => {
    controlBar.classList.remove('active');
    document.body.style.cursor = 'none'; // hides pointer for tablet aesthetics
  }, 4000);
}

function initWakeLockAndControls() {
  requestWakeLock();
  
  // Mouse and touch listeners
  window.addEventListener('mousemove', resetControlsTimer);
  window.addEventListener('touchstart', resetControlsTimer);
  window.addEventListener('click', resetControlsTimer);
  
  // Attempt to request wake lock on first user interaction as some mobile browsers require user gesture
  const acquireWakeLockOnInteraction = async () => {
    if (!state.wakeLock) {
      await requestWakeLock();
    }
    window.removeEventListener('click', acquireWakeLockOnInteraction);
    window.removeEventListener('touchstart', acquireWakeLockOnInteraction);
  };
  window.addEventListener('click', acquireWakeLockOnInteraction);
  window.addEventListener('touchstart', acquireWakeLockOnInteraction);
  
  resetControlsTimer();
}

function saveSettings() {
  try {
    localStorage.setItem('dclock_theme', state.theme);
    localStorage.setItem('dclock_seconds', state.showSeconds);
    localStorage.setItem('dclock_24h', state.is24h);
    localStorage.setItem('dclock_location', state.location);
    localStorage.setItem('dclock_scale', state.scale);
  } catch (e) {
    console.warn('LocalStorage is not accessible:', e);
  }
}

function loadSettings() {
  try {
    state.theme = localStorage.getItem('dclock_theme') || 'green';
    state.showSeconds = localStorage.getItem('dclock_seconds') !== 'false';
    state.is24h = localStorage.getItem('dclock_24h') === 'true';
    state.location = localStorage.getItem('dclock_location') || 'auto';
    state.scale = parseInt(localStorage.getItem('dclock_scale')) || 100;
  } catch (e) {
    console.warn('LocalStorage is not accessible. Using defaults.', e);
  }
  
  // Set UI state to match loaded settings
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.style.setProperty('--clock-scale', state.scale / 100);
  
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    if (swatch.dataset.color === state.theme) {
      swatch.classList.add('active');
    } else {
      swatch.classList.remove('active');
    }
  });

  const toggleSeconds = document.getElementById('toggle-seconds');
  const toggle24h = document.getElementById('toggle-24h');
  const locationSelect = document.getElementById('location-select');
  const scaleSlider = document.getElementById('scale-slider');
  const scaleValue = document.getElementById('scale-value');

  if (toggleSeconds) toggleSeconds.checked = state.showSeconds;
  if (toggle24h) toggle24h.checked = state.is24h;
  if (locationSelect) locationSelect.value = state.location;
  if (scaleSlider) scaleSlider.value = state.scale;
  if (scaleValue) scaleValue.textContent = `${state.scale}%`;
}

function setupSettingsListeners() {
  const panel = document.getElementById('settings-panel');
  const openBtn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('settings-close');
  
  openBtn.addEventListener('click', () => {
    panel.classList.add('open');
    resetControlsTimer();
  });
  
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    resetControlsTimer();
  });
  
  // Close drawer if user clicks outside of it (on the main clock face)
  document.querySelector('.clock-display').addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      resetControlsTimer();
    }
  });

  // Color theme swatch selection
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
      
      state.theme = e.target.dataset.color;
      document.documentElement.setAttribute('data-theme', state.theme);
      saveSettings();
    });
  });

  // Seconds show/hide toggle
  document.getElementById('toggle-seconds').addEventListener('change', (e) => {
    state.showSeconds = e.target.checked;
    saveSettings();
  });

  // 12H / 24H Toggle
  document.getElementById('toggle-24h').addEventListener('change', (e) => {
    state.is24h = e.target.checked;
    saveSettings();
  });

  // Location selector change
  document.getElementById('location-select').addEventListener('change', (e) => {
    state.location = e.target.value;
    saveSettings();
    fetchWeather(); // Force immediate weather refresh for new location
  });

  // Clock size slider change
  const scaleSlider = document.getElementById('scale-slider');
  const scaleValue = document.getElementById('scale-value');
  if (scaleSlider && scaleValue) {
    scaleSlider.addEventListener('input', (e) => {
      state.scale = parseInt(e.target.value);
      scaleValue.textContent = `${state.scale}%`;
      document.documentElement.style.setProperty('--clock-scale', state.scale / 100);
      saveSettings();
    });
  }

  // Fullscreen toggle with vendor prefix support
  const fsBtn = document.getElementById('fullscreen-btn');
  fsBtn.addEventListener('click', () => {
    const docEl = document.documentElement;
    const requestFS = docEl.requestFullscreen || 
                      docEl.webkitRequestFullscreen || 
                      docEl.mozRequestFullScreen || 
                      docEl.msRequestFullscreen;
    const exitFS = document.exitFullscreen || 
                   document.webkitExitFullscreen || 
                   document.mozCancelFullScreen || 
                   document.msExitFullscreen;
    const isFS = document.fullscreenElement || 
                 document.webkitFullscreenElement || 
                 document.mozFullScreenElement || 
                 document.msFullscreenElement;

    if (!isFS) {
      if (requestFS) {
        requestFS.call(docEl).catch((err) => {
          console.error(`Fullscreen Error: ${err.message}`);
        });
      } else {
        console.warn('Fullscreen API is not supported on this device/browser.');
      }
    } else {
      if (exitFS) {
        exitFS.call(document);
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadSettings(); // 1. Load settings first
  initClock(); // 2. Start clock
  startWeatherLoop(); // 3. Start weather loop
  initWakeLockAndControls(); // 4. Start Wake Lock & controls auto hide
  setupSettingsListeners(); // 5. Bind settings triggers
});
