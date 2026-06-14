# Digital Clock Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the digital desktop clock PWA by adding custom font selection, real-time fine dust levels from Open-Meteo, OLED burn-in prevention, and an automated Day/Night color theme transition.

**Architecture:** 
- Font selection: Load custom fonts (`Teko` and `DSEG7`) via CDN/Google Fonts inside the HTML page, applying them only to time numbers while retaining a clean system sans-serif font for date/weather texts.
- Weather: Connect to the Open-Meteo Air Quality API to retrieve PM10/PM2.5 levels, formatting the output based on simple vs. detailed view options.
- Burn-in: Dynamically apply a random micro translate offset of -4px to 4px to the main display container every minute.
- Auto-Theme: Poll the current hour inside the clock cycle and switch the root theme between the designated day and night options automatically.

**Tech Stack:** HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+), Open-Meteo API.

---

### Task 1: Include Fonts and Update Region List

**Files:**
- Modify: [index.html](file:///c:/Users/dorio/repo/dclock/index.html)

- [ ] **Step 1: Add External Fonts Stylesheets to HTML Header**
  Insert Google Fonts link for Teko and npm CDN link for DSEG font styles.
  Add this code to `<head>`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Teko:wght@500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dseg@0.46.0/css/dseg.min.css">
  ```

- [ ] **Step 2: Add Yeongtong Region Option to Location Dropdown**
  Modify the `<select id="location-select">` to add Suwon Yeongtong:
  ```html
  <option value="yeongtong">수원 영통</option>
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add index.html
  git commit -m "feat: add font stylesheets and yeongtong region option"
  ```

---

### Task 2: Update Stylesheet with Font Classes and Dust Badge Styles

**Files:**
- Modify: [style.css](file:///c:/Users/dorio/repo/dclock/style.css)

- [ ] **Step 1: Set Date and Weather to Keep Clean System Sans-serif**
  Override date and weather section fonts to ensure they do not inherit Teko/DSEG7 and stay as highly legible system sans-serif:
  ```css
  .date-section, .weather-section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
  }
  ```

- [ ] **Step 2: Add Font Overrides for the Time Elements**
  Define classes on `body` (or time elements) to style the digits:
  ```css
  /* Clock Font Overrides */
  body.font-teko #clock-hour, body.font-teko #clock-min, body.font-teko #clock-seconds {
    font-family: 'Teko', sans-serif;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  body.font-dseg #clock-hour, body.font-dseg #clock-min, body.font-dseg #clock-seconds {
    font-family: 'DSEG7Classic', monospace;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  body.font-chivo #clock-hour, body.font-chivo #clock-min, body.font-chivo #clock-seconds {
    font-family: 'Chivo Mono', monospace;
  }
  ```

- [ ] **Step 3: Add Dust Badge and Formats Style**
  Style the inline dust badge and details spacing:
  ```css
  .dust-badge {
    display: inline-block;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    font-size: 2.2vw;
    font-weight: bold;
    border: 1px solid currentColor;
    line-height: 1;
    margin-left: 0.8vw;
    box-shadow: 0 0 4px var(--led-glow);
  }
  
  @media (max-width: 768px) {
    .dust-badge {
      font-size: 4vw;
      margin-left: 1.5vw;
      padding: 0.2rem 0.5rem;
    }
  }
  ```

- [ ] **Step 4: Commit changes**
  ```bash
  git add style.css
  git commit -m "feat: add font override classes and fine dust styling"
  ```

---

### Task 3: Build the New Setting Control Layouts in HTML

**Files:**
- Modify: [index.html](file:///c:/Users/dorio/repo/dclock/index.html)

- [ ] **Step 1: Add Font Choice Dropdown**
  Under Settings Body, insert the Font Style setting:
  ```html
  <!-- Clock Font Select -->
  <div class="setting-item">
    <label for="font-select">시계 폰트 스타일</label>
    <select id="font-select">
      <option value="chivo">Chivo Mono (기본)</option>
      <option value="teko">Teko (세로형)</option>
      <option value="dseg">DSEG7 (디지털 세그먼트)</option>
    </select>
  </div>
  ```

- [ ] **Step 2: Add Fine Dust Details Toggle**
  Add toggle for detailed fine dust display format:
  ```html
  <!-- Fine Dust Toggle -->
  <div class="setting-item">
    <div class="toggle-row">
      <div>
        <span>미세먼지 상세 수치 표시</span>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">비활성화 시 심플 배지 형태로 표시됩니다.</div>
      </div>
      <label class="switch">
        <input type="checkbox" id="toggle-dust-detail">
        <span class="slider"></span>
      </label>
    </div>
  </div>
  ```

- [ ] **Step 3: Add OLED Burn-in Prevention Toggle**
  Add switch to enable micro pixel shifting:
  ```html
  <!-- OLED Burn-in Toggle -->
  <div class="setting-item">
    <div class="toggle-row">
      <div>
        <span>OLED 번인 방지 모드</span>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">1분 주기로 1~4px 미세 랜덤 시프트 작동</div>
      </div>
      <label class="switch">
        <input type="checkbox" id="toggle-burnin">
        <span class="slider"></span>
      </label>
    </div>
  </div>
  ```

- [ ] **Step 4: Add Day/Night Auto Color Theme Controls**
  Insert the auto-theme toggle and its hidden configuration sub-panel:
  ```html
  <!-- Day/Night Auto Theme -->
  <div class="setting-item">
    <div class="toggle-row">
      <div>
        <span>주/야간 자동 색상 모드</span>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">설정 시간대에 따라 자동으로 색상이 전환됩니다.</div>
      </div>
      <label class="switch">
        <input type="checkbox" id="toggle-auto-theme">
        <span class="slider"></span>
      </label>
    </div>
    
    <!-- Collapsible controls -->
    <div id="auto-theme-panel" style="display: none; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; margin-top: 8px; flex-direction: column; gap: 10px; box-sizing: border-box;">
      <div class="setting-item" style="gap: 4px;">
        <label style="font-size: 0.75rem;">주간 시간대 범위</label>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>시작</span>
          <select id="auto-theme-start" style="flex: 1; padding: 4px 6px;">
            <!-- will be populated by JS -->
          </select>
          <span>~ 종료</span>
          <select id="auto-theme-end" style="flex: 1; padding: 4px 6px;">
            <!-- will be populated by JS -->
          </select>
        </div>
      </div>
      <div class="setting-item" style="gap: 4px;">
        <label style="font-size: 0.75rem;">주간 테마 색상</label>
        <select id="auto-theme-day-color" style="padding: 4px 6px;">
          <option value="green">에메랄드 그린</option>
          <option value="amber">앰버 오렌지</option>
          <option value="red">루비 레드</option>
          <option value="blue">아이스 블루</option>
          <option value="white">퓨어 화이트</option>
        </select>
      </div>
      <div class="setting-item" style="gap: 4px;">
        <label style="font-size: 0.75rem;">야간 테마 색상</label>
        <select id="auto-theme-night-color" style="padding: 4px 6px;">
          <option value="green">에메랄드 그린</option>
          <option value="amber">앰버 오렌지</option>
          <option value="red">루비 레드</option>
          <option value="blue">아이스 블루</option>
          <option value="white">퓨어 화이트</option>
        </select>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 5: Commit changes**
  ```bash
  git add index.html
  git commit -m "feat: design settings layout for fonts, dust details, burnin and auto theme"
  ```

---

### Task 4: Implement State and Coordinates in Javascript

**Files:**
- Modify: [app.js](file:///c:/Users/dorio/repo/dclock/app.js)

- [ ] **Step 1: Add Suwon Yeongtong Coordinates to LOCATIONS**
  Add yeongtong to LOCATIONS constant:
  ```javascript
  // LOCATIONS updates
  yeongtong: { lat: 37.2593, lon: 127.0506, name: '수원 영통' }
  ```

- [ ] **Step 2: Extend State Object**
  Update the main `state` object at the top of the file:
  ```javascript
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
    weatherTimer: null,
    controlsTimeout: null,
    wakeLock: null,
    burnInInterval: null
  };
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add app.js
  git commit -m "feat: extend javascript state variables and add yeongtong coordinates"
  ```

---

### Task 5: Implement Weather and Fine Dust Fetching

**Files:**
- Modify: [app.js](file:///c:/Users/dorio/repo/dclock/app.js)

- [ ] **Step 1: Write helper function to calculate fine dust ratings**
  Calculate PM10/PM2.5 grades:
  ```javascript
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
  ```

- [ ] **Step 2: Update weather fetching to query Air Quality API**
  Modify `fetchWeather()` to also fetch and render PM10 & PM2.5 details:
  ```javascript
  // inside fetchWeather() after location parsing
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
  ```

- [ ] **Step 3: Render dust data in weather-info DOM container**
  Update the weather info rendering code inside `fetchWeather()`:
  ```javascript
  const weatherDetails = getWeatherDetails(current.weathercode);
  tempEl.textContent = `${Math.round(current.temperature)}°C`;
  descEl.innerHTML = `${weatherDetails.desc}${dustText}`;
  ```

- [ ] **Step 4: Commit changes**
  ```bash
  git add app.js
  git commit -m "feat: integrate open-meteo air quality API and display fine dust info"
  ```

---

### Task 6: Implement OLED Burn-in Prevention and Day/Night Auto Theme

**Files:**
- Modify: [app.js](file:///c:/Users/dorio/repo/dclock/app.js)

- [ ] **Step 1: Write Pixel Shift function**
  Define function to shift clock display layout offset:
  ```javascript
  function applyPixelShift() {
    const clockDisplay = document.querySelector('.clock-display');
    if (!clockDisplay) return;
    
    if (state.burnInPrevention) {
      // Random shift of -4px to +4px
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
      state.burnInInterval = setInterval(applyPixelShift, 60000); // Shift every 1 minute
      applyPixelShift();
    } else {
      applyPixelShift();
    }
  }
  ```

- [ ] **Step 2: Add Auto Theme Clock Checker**
  Inside `updateClock()`, check the current hour if `state.autoTheme` is active and apply theme color:
  ```javascript
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
      // update swatches active states
      document.querySelectorAll('.color-swatch').forEach(swatch => {
        if (swatch.dataset.color === targetTheme) {
          swatch.classList.add('active');
        } else {
          swatch.classList.remove('active');
        }
      });
    }
  }
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add app.js
  git commit -m "feat: implement oled pixel shifting and day/night auto theme rotation"
  ```

---

### Task 7: Wire Setting Listeners and LocalStorage Storage

**Files:**
- Modify: [app.js](file:///c:/Users/dorio/repo/dclock/app.js)

- [ ] **Step 1: Update Save and Load Settings functions**
  Ensure all new options persist to LocalStorage and reflect in state:
  ```javascript
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
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
    }
  }
  
  function loadSettings() {
    // ... existing loads ...
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
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    
    // Apply visual classes
    document.body.className = `font-${state.fontStyle}`;
    applyClockScale();
    initBurnInPrevention();
  }
  ```

- [ ] **Step 2: Add Listeners for Settings Controls**
  Bind DOM event change listeners for font selection, dust detail, burnin, and auto-theme options. Also disable color picking swatches if auto-theme is enabled:
  ```javascript
  function updateAutoThemeUIVisibility() {
    const autoPanel = document.getElementById('auto-theme-panel');
    const colorOptionsContainer = document.querySelector('.color-options');
    
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
  
  function setupNewListeners() {
    // Populate auto theme select options 0 to 23
    const startSelect = document.getElementById('auto-theme-start');
    const endSelect = document.getElementById('auto-theme-end');
    if (startSelect && endSelect) {
      startSelect.innerHTML = '';
      endSelect.innerHTML = '';
      for (let i = 0; i < 24; i++) {
        const hourStr = String(i).padStart(2, '0') + ':00';
        startSelect.add(new Option(hourStr, i));
        endSelect.add(new Option(hourStr, i === 0 ? 24 : i));
      }
      startSelect.value = state.dayStartHour;
      endSelect.value = state.dayEndHour;
    }
    
    // Font selection
    const fontSelect = document.getElementById('font-select');
    if (fontSelect) {
      fontSelect.value = state.fontStyle;
      fontSelect.addEventListener('change', (e) => {
        state.fontStyle = e.target.value;
        document.body.className = `font-${state.fontStyle}`;
        saveSettings();
      });
    }
    
    // Dust Details
    const toggleDust = document.getElementById('toggle-dust-detail');
    if (toggleDust) {
      toggleDust.checked = state.showDustDetails;
      toggleDust.addEventListener('change', (e) => {
        state.showDustDetails = e.target.checked;
        saveSettings();
        fetchWeather();
      });
    }
    
    // Burn-in Toggle
    const toggleBurn = document.getElementById('toggle-burnin');
    if (toggleBurn) {
      toggleBurn.checked = state.burnInPrevention;
      toggleBurn.addEventListener('change', (e) => {
        state.burnInPrevention = e.target.checked;
        saveSettings();
        initBurnInPrevention();
      });
    }
    
    // Auto theme controls
    const toggleAutoTheme = document.getElementById('toggle-auto-theme');
    if (toggleAutoTheme) {
      toggleAutoTheme.checked = state.autoTheme;
      updateAutoThemeUIVisibility();
      
      toggleAutoTheme.addEventListener('change', (e) => {
        state.autoTheme = e.target.checked;
        updateAutoThemeUIVisibility();
        saveSettings();
        updateClock(); // immediately check and apply
      });
    }
    
    // Bind starts, ends, colors
    const dayStartSelect = document.getElementById('auto-theme-start');
    const dayEndSelect = document.getElementById('auto-theme-end');
    const dayThemeSelect = document.getElementById('auto-theme-day-color');
    const nightThemeSelect = document.getElementById('auto-theme-night-color');
    
    if (dayStartSelect) {
      dayStartSelect.addEventListener('change', (e) => {
        state.dayStartHour = parseInt(e.target.value);
        saveSettings();
        updateClock();
      });
    }
    if (dayEndSelect) {
      dayEndSelect.addEventListener('change', (e) => {
        state.dayEndHour = parseInt(e.target.value);
        saveSettings();
        updateClock();
      });
    }
    if (dayThemeSelect) {
      dayThemeSelect.value = state.dayTheme;
      dayThemeSelect.addEventListener('change', (e) => {
        state.dayTheme = e.target.value;
        saveSettings();
        updateClock();
      });
    }
    if (nightThemeSelect) {
      nightThemeSelect.value = state.nightTheme;
      nightThemeSelect.addEventListener('change', (e) => {
        state.nightTheme = e.target.value;
        saveSettings();
        updateClock();
      });
    }
  }
  ```
  And make sure `setupNewListeners()` is called during DOMContentLoaded initialization in `app.js`.

- [ ] **Step 3: Update `applyClockScale()` to handle scale combined with translate**
  Replace `applyClockScale()` to make sure it doesn't overwrite pixel shifting transform:
  ```javascript
  function applyClockScale() {
    applyPixelShift();
  }
  ```

- [ ] **Step 4: Commit changes**
  ```bash
  git add app.js
  git commit -m "feat: connect settings controls to UI and localstorage bindings"
  ```
