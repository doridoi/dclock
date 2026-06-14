// State variables
const state = {
  theme: 'green',
  showSeconds: true,
  is24h: false,
  location: 'auto',
  scale: 100,
  fontStyle: 'chivo',
  showDustDetails: false,
  burnInPrevention: false,
  autoTheme: false,
  dayStartHour: 6,
  dayEndHour: 24,
  dayTheme: 'green',
  nightTheme: 'amber',
  weatherIconStyle: 'animated',
  weatherTimer: null,
  controlsTimeout: null,
  wakeLock: null,
  burnInInterval: null
};

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

const LOCATIONS = {
  seoul: { lat: 37.5665, lon: 126.9780, name: '서울' },
  busan: { lat: 35.1796, lon: 129.0756, name: '부산' },
  daegu: { lat: 35.8714, lon: 128.6014, name: '대구' },
  incheon: { lat: 37.4563, lon: 126.7052, name: '인천' },
  gwangju: { lat: 35.1595, lon: 126.8526, name: '광주' },
  daejeon: { lat: 36.3504, lon: 127.3845, name: '대전' },
  ulsan: { lat: 35.5389, lon: 129.3114, name: '울산' },
  jeju: { lat: 33.4996, lon: 126.5312, name: '제주' },
  dongtan: { lat: 37.1999, lon: 127.0962, name: '화성 동탄' },
  yeongtong: { lat: 37.2593, lon: 127.0506, name: '수원 영통' }
};

function getWeatherDetails(code, isDay = true) {
  let desc = '맑음';
  let svgContent = '';
  let iconFile = 'day.svg';

  if (code === 0) {
    desc = '맑음';
    iconFile = isDay ? 'day.svg' : 'night.svg';
    svgContent = `
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2.5" fill="none"/>
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.22-8.78l-1.42 1.42m-11.3 11.3l-1.42 1.42m0-14.14l1.42 1.42m11.3 11.3l1.42 1.42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (code === 1) {
    desc = '대체로 맑음';
    iconFile = isDay ? 'cloudy-day-1.svg' : 'cloudy-night-1.svg';
    svgContent = `
      <path d="M12 6a3.5 3.5 0 0 1 3.5 3.5c0 .35-.05.69-.15 1" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    `;
  } else if (code === 2) {
    desc = '구름 조금';
    iconFile = isDay ? 'cloudy-day-2.svg' : 'cloudy-night-2.svg';
    svgContent = `
      <path d="M12 6a3.5 3.5 0 0 1 3.5 3.5c0 .35-.05.69-.15 1" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    `;
  } else if (code === 3) {
    desc = '흐림';
    iconFile = 'cloudy.svg';
    svgContent = `
      <path d="M12 6a3.5 3.5 0 0 1 3.5 3.5c0 .35-.05.69-.15 1" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    `;
  } else if (code === 45 || code === 48) {
    desc = '안개';
    iconFile = 'cloudy.svg';
    svgContent = `
      <path d="M18.4 11a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5h12.7z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M4 16h16M6 20h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (code >= 51 && code <= 55) {
    desc = '이슬비';
    iconFile = isDay ? 'rainy-1.svg' : 'rainy-2.svg';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M8 20l-1 2m4-2l-1 2m4-2l-1 2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if ((code >= 61 && code <= 65) || code === 56 || code === 57 || code === 66 || code === 67) {
    desc = '비';
    iconFile = isDay ? 'rainy-5.svg' : 'rainy-6.svg';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M8 20l-1 2m4-2l-1 2m4-2l-1 2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (code >= 80 && code <= 82) {
    desc = '소나기';
    iconFile = isDay ? 'rainy-3.svg' : 'rainy-4.svg';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M8 20l-1 2m4-2l-1 2m4-2l-1 2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if ((code >= 71 && code <= 73) || code === 85 || code === 86) {
    desc = '눈';
    iconFile = isDay ? 'snowy-3.svg' : 'snowy-4.svg';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M8 20h.01M12 20h.01M16 20h.01M10 22h.01M14 22h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (code === 75) {
    desc = '폭설';
    iconFile = 'snowy-5.svg';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M8 20h.01M12 20h.01M16 20h.01M10 22h.01M14 22h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (code === 77) {
    desc = '진눈깨비';
    iconFile = 'snowy-6.svg';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M8 20h.01M12 20h.01M16 20h.01M10 22h.01M14 22h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (code >= 95 && code <= 99) {
    desc = '뇌우';
    iconFile = 'thunder.svg';
    svgContent = `
      <path d="M18.4 13a4 4 0 0 0-7.7-1 4.5 4.5 0 0 0-4.7 4.5 4.5 0 0 0 4.5 4.5h8a4 4 0 0 0 .3-8z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <path d="M12 19l-2 3h3l-1 3" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    `;
  }

  return {
    desc,
    svg: `<svg class="weather-svg" viewBox="0 0 24 24">${svgContent}</svg>`,
    iconFile
  };
}

function getPm10Grade(value) {
  if (value <= 30) return { label: '좋음', color: 'green' };
  if (value <= 80) return { label: '보통', color: 'blue' };
  if (value <= 150) return { label: '나쁨', color: 'amber' };
  return { label: '매우나쁨', color: 'red' };
}

function getPm25Grade(value) {
  if (value <= 15) return { label: '좋음', color: 'green' };
  if (value <= 35) return { label: '보통', color: 'blue' };
  if (value <= 75) return { label: '나쁨', color: 'amber' };
  return { label: '매우나쁨', color: 'red' };
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

  // Day/Night Auto Theme checking
  if (state.autoTheme) {
    const currentHour = now.getHours();
    let isDay = false;
    const start = state.dayStartHour;
    const end = state.dayEndHour;
    if (start < end) {
      isDay = (currentHour >= start && currentHour < end);
    } else {
      isDay = (currentHour >= start || currentHour < end);
    }
    const targetTheme = isDay ? state.dayTheme : state.nightTheme;
    if (state.theme !== targetTheme) {
      state.theme = targetTheme;
      document.documentElement.setAttribute('data-theme', targetTheme);
      document.querySelectorAll('.color-swatch').forEach(swatch => {
        if (swatch.dataset.color === targetTheme) {
          swatch.classList.add('active');
        } else {
          swatch.classList.remove('active');
        }
      });
    }
  }
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
    const isDay = current.is_day !== 0;
    const weatherDetails = getWeatherDetails(current.weathercode, isDay);

    let dustText = '';
    try {
      const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5`;
      const airRes = await fetch(airUrl);
      if (airRes.ok) {
        const airData = await airRes.json();
        const pm10 = Math.round(airData.current.pm10);
        const pm25 = Math.round(airData.current.pm2_5);
        const pm10Grade = getPm10Grade(pm10);
        const pm25Grade = getPm25Grade(pm25);

        if (state.showDustDetails) {
          dustText = ` | 미세 ${pm10}(${pm10Grade.label}) · 초미세 ${pm25}(${pm25Grade.label})`;
        } else {
          dustText = ` <span class="dust-badge" style="color: var(--led-active)">미세 ${pm10Grade.label}</span>`;
        }
      }
    } catch (airErr) {
      console.error('Air quality fetch failed:', airErr);
    }

    tempEl.textContent = `${Math.round(current.temperature)}°C`;
    descEl.innerHTML = `${weatherDetails.desc}${dustText}`;

    if (state.weatherIconStyle === 'monochrome') {
      iconWrapper.innerHTML = weatherDetails.svg;
    } else {
      const folder = state.weatherIconStyle; // 'static' or 'animated'
      iconWrapper.innerHTML = `<img class="weather-icon-img" src="assets/icon/${folder}/${weatherDetails.iconFile}" alt="${weatherDetails.desc}">`;
    }
    weatherBlock.style.opacity = '1';
    
    // Update the location info in the settings drawer
    const currentLocEl = document.getElementById('current-weather-location');
    if (currentLocEl) {
      currentLocEl.textContent = locName;
    }
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
    localStorage.setItem('dclock_fontStyle', state.fontStyle);
    localStorage.setItem('dclock_showDustDetails', state.showDustDetails);
    localStorage.setItem('dclock_burnin', state.burnInPrevention);
    localStorage.setItem('dclock_autoTheme', state.autoTheme);
    localStorage.setItem('dclock_dayStartHour', state.dayStartHour);
    localStorage.setItem('dclock_dayEndHour', state.dayEndHour);
    localStorage.setItem('dclock_dayTheme', state.dayTheme);
    localStorage.setItem('dclock_nightTheme', state.nightTheme);
    localStorage.setItem('dclock_weatherIconStyle', state.weatherIconStyle);
  } catch (e) {
    console.warn('LocalStorage is not accessible:', e);
  }
}

function applyClockScale() {
  applyPixelShift();
}

function applyPixelShift() {
  const clockDisplay = document.querySelector('.clock-display');
  if (!clockDisplay) return;
  
  if (state.burnInPrevention) {
    const x = Math.floor(Math.random() * 9) - 4;
    const y = Math.floor(Math.random() * 9) - 4;
    clockDisplay.style.transform = `scale(${state.scale / 100}) translate(${x}px, ${y}px)`;
  } else {
    clockDisplay.style.transform = `scale(${state.scale / 100})`;
  }
}

function initBurnInPrevention() {
  if (state.burnInInterval) clearInterval(state.burnInInterval);
  if (state.burnInPrevention) {
    state.burnInInterval = setInterval(applyPixelShift, 60000);
    applyPixelShift();
  } else {
    applyPixelShift();
  }
}

function updateAutoThemeUIVisibility() {
  const autoPanel = document.getElementById('auto-theme-panel');
  const colorOptionsContainer = document.querySelector('.color-options');
  if (!autoPanel) return;

  if (state.autoTheme) {
    autoPanel.style.display = 'flex';
    if (colorOptionsContainer) {
      colorOptionsContainer.style.opacity = '0.5';
      colorOptionsContainer.style.pointerEvents = 'none';
    }
  } else {
    autoPanel.style.display = 'none';
    if (colorOptionsContainer) {
      colorOptionsContainer.style.opacity = '1';
      colorOptionsContainer.style.pointerEvents = 'auto';
    }
  }
}

function loadSettings() {
  try {
    state.theme = localStorage.getItem('dclock_theme') || 'green';
    state.showSeconds = localStorage.getItem('dclock_seconds') !== 'false';
    state.is24h = localStorage.getItem('dclock_24h') === 'true';
    state.location = localStorage.getItem('dclock_location') || 'auto';
    state.scale = parseInt(localStorage.getItem('dclock_scale')) || 100;
    state.fontStyle = localStorage.getItem('dclock_fontStyle') || 'chivo';
    state.showDustDetails = localStorage.getItem('dclock_showDustDetails') === 'true';
    state.burnInPrevention = localStorage.getItem('dclock_burnin') === 'true';
    state.autoTheme = localStorage.getItem('dclock_autoTheme') === 'true';
    state.dayStartHour = parseInt(localStorage.getItem('dclock_dayStartHour')) || 6;
    state.dayEndHour = parseInt(localStorage.getItem('dclock_dayEndHour')) || 24;
    state.dayTheme = localStorage.getItem('dclock_dayTheme') || 'green';
    state.nightTheme = localStorage.getItem('dclock_nightTheme') || 'amber';
    state.weatherIconStyle = localStorage.getItem('dclock_weatherIconStyle') || 'animated';
  } catch (e) {
    console.warn('LocalStorage is not accessible. Using defaults.', e);
  }
  
  // Set UI state to match loaded settings
  document.documentElement.setAttribute('data-theme', state.theme);
  applyClockScale();
  initBurnInPrevention();
  
  // Apply Font Style
  document.body.className = `font-${state.fontStyle}`;
  
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

  const fontSelect = document.getElementById('font-select');
  const toggleDust = document.getElementById('toggle-dust-detail');
  const toggleBurn = document.getElementById('toggle-burnin');
  const toggleAutoTheme = document.getElementById('toggle-auto-theme');
  const dayStartSelect = document.getElementById('auto-theme-start');
  const dayEndSelect = document.getElementById('auto-theme-end');
  const dayThemeSelect = document.getElementById('auto-theme-day-color');
  const nightThemeSelect = document.getElementById('auto-theme-night-color');

  if (toggleSeconds) toggleSeconds.checked = state.showSeconds;
  if (toggle24h) toggle24h.checked = state.is24h;
  if (locationSelect) locationSelect.value = state.location;
  if (scaleSlider) scaleSlider.value = state.scale;
  if (scaleValue) scaleValue.textContent = `${state.scale}%`;

  if (fontSelect) fontSelect.value = state.fontStyle;
  if (toggleDust) toggleDust.checked = state.showDustDetails;
  if (toggleBurn) toggleBurn.checked = state.burnInPrevention;
  if (toggleAutoTheme) toggleAutoTheme.checked = state.autoTheme;

  const weatherIconStyleSelect = document.getElementById('weather-icon-style-select');
  if (weatherIconStyleSelect) weatherIconStyleSelect.value = state.weatherIconStyle;

  // Populate auto theme options dynamically
  if (dayStartSelect && dayStartSelect.options.length === 0) {
    for (let i = 0; i < 24; i++) {
      const hourStr = String(i).padStart(2, '0') + ':00';
      dayStartSelect.add(new Option(hourStr, i));
      dayEndSelect.add(new Option(hourStr, i === 0 ? 24 : i));
    }
  }
  if (dayStartSelect) dayStartSelect.value = state.dayStartHour;
  if (dayEndSelect) dayEndSelect.value = state.dayEndHour;
  if (dayThemeSelect) dayThemeSelect.value = state.dayTheme;
  if (nightThemeSelect) nightThemeSelect.value = state.nightTheme;

  updateAutoThemeUIVisibility();

  const currentLocEl = document.getElementById('current-weather-location');
  if (currentLocEl) {
    if (state.location === 'auto') {
      currentLocEl.textContent = '현재 위치 (조회 중...)';
    } else {
      currentLocEl.textContent = LOCATIONS[state.location]?.name || '--';
    }
  }
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

  // Weather Icon Style selector change
  const weatherIconStyleSelect = document.getElementById('weather-icon-style-select');
  if (weatherIconStyleSelect) {
    weatherIconStyleSelect.addEventListener('change', (e) => {
      state.weatherIconStyle = e.target.value;
      saveSettings();
      fetchWeather(); // Force immediate weather refresh to show the new style
    });
  }

  // Clock size slider change
  const scaleSlider = document.getElementById('scale-slider');
  const scaleValue = document.getElementById('scale-value');
  if (scaleSlider && scaleValue) {
    scaleSlider.addEventListener('input', (e) => {
      state.scale = parseInt(e.target.value);
      scaleValue.textContent = `${state.scale}%`;
      applyClockScale();
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

  // --- New Settings Listeners ---
  const fontSelect = document.getElementById('font-select');
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      state.fontStyle = e.target.value;
      document.body.className = `font-${state.fontStyle}`;
      saveSettings();
    });
  }

  const toggleDust = document.getElementById('toggle-dust-detail');
  if (toggleDust) {
    toggleDust.addEventListener('change', (e) => {
      state.showDustDetails = e.target.checked;
      saveSettings();
      fetchWeather();
    });
  }

  const toggleBurn = document.getElementById('toggle-burnin');
  if (toggleBurn) {
    toggleBurn.addEventListener('change', (e) => {
      state.burnInPrevention = e.target.checked;
      saveSettings();
      initBurnInPrevention();
    });
  }

  const toggleAutoTheme = document.getElementById('toggle-auto-theme');
  if (toggleAutoTheme) {
    toggleAutoTheme.addEventListener('change', (e) => {
      state.autoTheme = e.target.checked;
      updateAutoThemeUIVisibility();
      saveSettings();
      updateClock();
    });
  }

  const dayStartSelect = document.getElementById('auto-theme-start');
  if (dayStartSelect) {
    dayStartSelect.addEventListener('change', (e) => {
      state.dayStartHour = parseInt(e.target.value);
      saveSettings();
      updateClock();
    });
  }

  const dayEndSelect = document.getElementById('auto-theme-end');
  if (dayEndSelect) {
    dayEndSelect.addEventListener('change', (e) => {
      state.dayEndHour = parseInt(e.target.value);
      saveSettings();
      updateClock();
    });
  }

  const dayThemeSelect = document.getElementById('auto-theme-day-color');
  if (dayThemeSelect) {
    dayThemeSelect.addEventListener('change', (e) => {
      state.dayTheme = e.target.value;
      saveSettings();
      updateClock();
    });
  }

  const nightThemeSelect = document.getElementById('auto-theme-night-color');
  if (nightThemeSelect) {
    nightThemeSelect.addEventListener('change', (e) => {
      state.nightTheme = e.target.value;
      saveSettings();
      updateClock();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadSettings(); // 1. Load settings first
  initClock(); // 2. Start clock
  startWeatherLoop(); // 3. Start weather loop
  initWakeLockAndControls(); // 4. Start Wake Lock & controls auto hide
  setupSettingsListeners(); // 5. Bind settings triggers
});
