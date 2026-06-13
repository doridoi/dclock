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

window.addEventListener('DOMContentLoaded', () => {
  initClock();
});
