# 탁상용 디지털 시계 구현 계획서 (Tabletop Digital Clock Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 안드로이드 태블릿에서 독립적으로 구동되는 오프라인 기반 모던 디지털 탁상시계 PWA 웹 앱을 완성합니다.

**Architecture:** 시각적 정돈과 효율성을 위해 빌드 과정이 없는 Vanilla HTML5, CSS3, ES6 JavaScript 구조를 채택하며, 날씨 조회를 위한 Open-Meteo API 및 화면 켜짐 유지를 위한 Screen Wake Lock API를 연동합니다.

**Tech Stack:** HTML5, Vanilla CSS3 (Custom Variables, Flexbox, Grid), JavaScript (ES6+), Screen Wake Lock API, Open-Meteo Weather API, LocalStorage.

---

## 📁 최종 파일 및 책임 맵
1. `assets/fonts/ChivoMono-VariableFont.ttf`: 시계 숫자에 적용될 현대적 모노스페이스 폰트 (로컬 내장)
2. `index.html`: 전체 화면 그리드 및 구성요소 마크업
3. `style.css`: 테마 색상 변수, LED 전광판 도트 배경 텍스트 발광 연출, 반응형 분기 처리
4. `app.js`: 시계 렌더러, 깜빡임 흔들림 방지, 날씨 비동기 캐시 수신, Wake Lock 화면 차단 방지, LocalStorage 제어

---

## 🛠️ 세부 마일스톤 및 테스크 목록

### Task 1: 프로젝트 폴더 구조화 및 폰트 파일 다운로드

**Files:**
* Create: `assets/fonts/ChivoMono-VariableFont.ttf` (폰트 파일 생성)

- [x] **Step 1: 폰트 저장을 위한 하위 디렉토리 생성**

Run:
```powershell
New-Item -ItemType Directory -Force -Path assets/fonts
```
Expected: `assets/fonts` 폴더가 정상적으로 생성됨.

- [x] **Step 2: Google Fonts 공식 저장소로부터 Chivo Mono Variable Font 다운로드**

Run:
```powershell
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/chivomono/ChivoMono%5Bwght%5D.ttf" -OutFile "assets/fonts/ChivoMono-VariableFont.ttf"
```
Expected: TTF 폰트 파일이 `assets/fonts/`에 저장됨.

- [x] **Step 3: 파일 크기가 정상인지 확인 (다운로드 성공 여부 검증)**

Run:
```powershell
(Get-Item "assets/fonts/ChivoMono-VariableFont.ttf").Length
```
Expected: 파일 크기가 `0`보다 크고 다운로드 완료됨을 확인 (약 50KB~150KB 내외).

- [x] **Step 4: 변경사항 Commit**

Run:
```bash
git add assets/fonts/ChivoMono-VariableFont.ttf
git commit -m "chore: setup project folders and download Chivo Mono font"
```

---

### Task 2: 기본 시계 레이아웃 완성 (HTML)

**Files:**
* Create: `index.html`

- [x] **Step 1: index.html 뼈대 작성**
주요 구성 요소(메인 시계, AM/PM & 초단위 서브 영역, 하단 정보 행, 설정 서랍창) 마크업을 완성합니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>데스크탑 디지털 시계</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- LED Matrix Grid Panel Overlay -->
  <div class="led-matrix-overlay"></div>

  <div id="app-container">
    <!-- Main Display Section -->
    <main class="clock-display">
      <!-- Time Display Area (Layout Shift Free structure) -->
      <div class="time-display-container">
        <div class="time-main">
          <span id="clock-hour">00</span><span class="colon" id="clock-colon">:</span><span id="clock-min">00</span>
        </div>
        <div class="time-sub" id="clock-sub-pane">
          <div class="ampm-text" id="clock-ampm">AM</div>
          <div class="seconds-text" id="clock-seconds">00</div>
        </div>
      </div>

      <!-- Info Row (Date & Weather) -->
      <div class="info-row">
        <!-- Date display -->
        <div class="date-section">
          <div id="date-text">2026년 06월 13일 (토)</div>
        </div>

        <!-- Divider line -->
        <div class="divider"></div>

        <!-- Weather display -->
        <div class="weather-section" id="weather-block" style="opacity: 0;">
          <div id="weather-icon-wrapper">
            <!-- Dynamic SVG injected by JS -->
          </div>
          <div class="weather-info">
            <span id="weather-temp">--°C</span>
            <span id="weather-desc">날씨 조회 중...</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Floating UI Controls (Auto hides) -->
    <div id="control-bar" class="active">
      <button id="fullscreen-btn" class="icon-btn" title="전체화면 토글">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
      </button>
      <button id="settings-btn" class="icon-btn" title="설정">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>

    <!-- Settings Drawer -->
    <aside id="settings-panel">
      <div class="settings-header">
        <h2>시계 설정</h2>
        <button id="settings-close" class="close-btn">&times;</button>
      </div>

      <div class="settings-body">
        <!-- Color Theme Select -->
        <div class="setting-item">
          <label>LED 테마 색상</label>
          <div class="color-options">
            <button class="color-swatch active" data-color="green" style="background-color: #34c759;" title="에메랄드 그린"></button>
            <button class="color-swatch" data-color="amber" style="background-color: #ff9500;" title="앰버 오렌지"></button>
            <button class="color-swatch" data-color="red" style="background-color: #ff3b30;" title="루비 레드"></button>
            <button class="color-swatch" data-color="blue" style="background-color: #007aff;" title="아이스 블루"></button>
            <button class="color-swatch" data-color="white" style="background-color: #ffffff;" title="퓨어 화이트"></button>
          </div>
        </div>

        <!-- Seconds Display Switch -->
        <div class="setting-item">
          <div class="toggle-row">
            <span>초(Seconds) 단위 표시</span>
            <label class="switch">
              <input type="checkbox" id="toggle-seconds" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- 12H / 24H Toggle -->
        <div class="setting-item">
          <div class="toggle-row">
            <span>24시간제 형식 사용</span>
            <label class="switch">
              <input type="checkbox" id="toggle-24h">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- Weather Location Setup -->
        <div class="setting-item">
          <label for="location-select">날씨 기준 지역</label>
          <select id="location-select">
            <option value="auto">현재 위치 (자동 IP인식)</option>
            <option value="seoul">서울</option>
            <option value="busan">부산</option>
            <option value="daegu">대구</option>
            <option value="incheon">인천</option>
            <option value="gwangju">광주</option>
            <option value="daejeon">대전</option>
            <option value="ulsan">울산</option>
            <option value="jeju">제주</option>
          </select>
        </div>

        <!-- Screen Wake Lock API Info -->
        <div class="setting-item">
          <label>태블릿 시스템 화면 모드</label>
          <div class="status-badge">
            <div class="status-dot"></div>
            <span id="wakelock-status">화면 항상 켜짐 활성화 중 (Wake Lock)</span>
          </div>
        </div>
      </div>
    </aside>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

- [x] **Step 2: 변경사항 Commit**

Run:
```bash
git add index.html
git commit -m "feat: add basic index.html clock layout"
```

---

### Task 3: 폰트 로드 및 LED 디자인 스타일 완성 (CSS)

**Files:**
* Create: `style.css`

- [x] **Step 1: style.css 완성**
`Chivo Mono` 폰트-페이스 정의, 5가지 테마 컬러 변수 정의, LED 픽셀 도트 배경 및 Glow 효과 연출, 반응형 구조를 정의합니다.

```css
/* Local Font face import */
@font-face {
  font-family: 'Chivo Mono';
  src: url('assets/fonts/ChivoMono-VariableFont.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
}

/* Default styling variables */
:root {
  --led-active: #34c759;
  --led-glow: rgba(52, 199, 89, 0.45);
  
  --bg-color: #000000;
  --panel-bg: rgba(20, 20, 20, 0.85);
  --text-main: #ffffff;
  --text-secondary: #aaaaaa;
}

/* Color theme mappings */
[data-theme="green"] {
  --led-active: #34c759;
  --led-glow: rgba(52, 199, 89, 0.5);
}
[data-theme="amber"] {
  --led-active: #ff9500;
  --led-glow: rgba(255, 149, 0, 0.5);
}
[data-theme="red"] {
  --led-active: #ff3b30;
  --led-glow: rgba(255, 59, 48, 0.5);
}
[data-theme="blue"] {
  --led-active: #007aff;
  --led-glow: rgba(0, 122, 255, 0.5);
}
[data-theme="white"] {
  --led-active: #ffffff;
  --led-glow: rgba(255, 255, 255, 0.25);
}

/* Base resets */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: 'Chivo Mono', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

/* LED Panel Grid Overlay */
.led-matrix-overlay {
  position: fixed;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 0);
  background-size: 8px 8px;
  pointer-events: none;
  z-index: 10;
}

#app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 2rem;
}

/* Clock display */
.clock-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
}

/* Layout shift free time container */
.time-display-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.5vw;
  margin-bottom: 2vh;
}

.time-main {
  font-size: 14vw;
  color: var(--led-active);
  text-shadow: 0 0 10px var(--led-glow), 0 0 25px var(--led-glow);
  line-height: 0.9;
  letter-spacing: 2px;
  font-weight: 700;
  white-space: nowrap;
  transition: color 0.3s, text-shadow 0.3s;
}

.colon {
  display: inline-block;
  transition: visibility 0.1s;
}

.time-sub {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 10.5vw;
  padding-bottom: 0.8vw;
}

.ampm-text {
  font-size: 2.8vw;
  line-height: 1;
  font-weight: 500;
  color: var(--led-active);
  text-shadow: 0 0 5px var(--led-glow);
  transition: color 0.3s, text-shadow 0.3s;
}

.seconds-text {
  font-size: 4.5vw;
  line-height: 1;
  font-weight: 700;
  color: var(--led-active);
  text-shadow: 0 0 8px var(--led-glow);
  transition: color 0.3s, text-shadow 0.3s;
}

/* Info Row */
.info-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1vh;
  animation: pulse-glow 4s infinite alternate;
}

.date-section {
  font-size: 2.2vw;
  color: var(--led-active);
  text-shadow: 0 0 5px var(--led-glow);
  font-weight: 500;
  transition: color 0.3s, text-shadow 0.3s;
}

.divider {
  width: 2px;
  height: 3vw;
  background-color: var(--led-active);
  box-shadow: 0 0 8px var(--led-glow);
  margin: 0 3vw;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.weather-section {
  display: flex;
  align-items: center;
  color: var(--led-active);
  text-shadow: 0 0 5px var(--led-glow);
  font-size: 2.2vw;
  font-weight: 500;
  transition: color 0.3s, text-shadow 0.3s;
}

#weather-icon-wrapper {
  margin-right: 1vw;
  display: flex;
  align-items: center;
}

.weather-svg {
  width: 3.2vw;
  height: 3.2vw;
  fill: none;
  stroke: var(--led-active);
  stroke-width: 2.5;
  filter: drop-shadow(0 0 4px var(--led-glow));
  transition: stroke 0.3s, filter 0.3s;
}

.weather-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.weather-info span:last-child {
  font-size: 1.4vw;
  opacity: 0.8;
}

/* Floating Controls */
#control-bar {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 100;
}

#control-bar.active {
  opacity: 0.7;
}

#control-bar:hover {
  opacity: 1;
}

.icon-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-main);
  padding: 0.7rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(10, 10, 10, 0.6);
  transition: all 0.3s;
}

.icon-btn:hover {
  border-color: var(--led-active);
  color: var(--led-active);
  transform: scale(1.15);
  box-shadow: 0 0 8px var(--led-glow);
}

/* Settings drawer */
#settings-panel {
  position: fixed;
  top: 0;
  right: -340px;
  width: 340px;
  height: 100%;
  background: var(--panel-bg);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  transition: right 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
  display: flex;
  flex-direction: column;
  font-family: 'Chivo Mono', monospace;
}

#settings-panel.open {
  right: 0;
}

.settings-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-header h2 {
  font-size: 1.2rem;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-main);
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: var(--led-active);
}

.settings-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.setting-item label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.color-options {
  display: flex;
  gap: 0.8rem;
}

.color-swatch {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch.active {
  border-color: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

/* Custom toggles */
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.3s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: #fff;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--led-active);
  box-shadow: 0 0 8px var(--led-glow);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* Select */
select {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-main);
  padding: 0.6rem;
  border-radius: 5px;
  outline: none;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.3s;
}

select:focus {
  border-color: var(--led-active);
}

select option {
  background-color: #111;
  color: #fff;
}

/* Wake Lock badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ccc;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--led-active);
  box-shadow: 0 0 6px var(--led-active);
  transition: background-color 0.3s, box-shadow 0.3s;
}

.status-dot.inactive {
  background-color: #555 !important;
  box-shadow: none !important;
}

@keyframes pulse-glow {
  from { filter: drop-shadow(0 0 1px var(--led-glow)); }
  to { filter: drop-shadow(0 0 3px var(--led-glow)); }
}

/* Tablet Media Query overrides */
@media (max-width: 768px) {
  #app-container {
    padding: 1rem;
  }
  .time-display-container {
    gap: 2.5vw;
  }
  .time-main {
    font-size: 16vw;
  }
  .time-sub {
    height: 12vw;
  }
  .ampm-text {
    font-size: 3.5vw;
  }
  .seconds-text {
    font-size: 5vw;
  }
  .info-row {
    flex-direction: column;
    gap: 1.5vh;
  }
  .date-section, .weather-section {
    font-size: 4.5vw;
  }
  .weather-svg {
    width: 6vw;
    height: 6vw;
  }
  .weather-info span:last-child {
    font-size: 3vw;
  }
  .divider {
    display: none;
  }
  #settings-panel {
    width: 100%;
    right: -100%;
  }
}
```

- [x] **Step 2: 변경사항 Commit**

Run:
```bash
git add style.css
git commit -m "feat: implement styles and custom LED themes in style.css"
```

---

### Task 4: 핵심 시계 엔진 설계 및 깜빡임 흔들림 방지 (JS)

**Files:**
* Create: `app.js`

- [x] **Step 1: app.js 기본 뼈대 및 시간 업데이트 구현**
콜론 깜빡임 시 `visibility` 토글을 적용하여 흔들림 없는 렌더링을 보장하는 시계 동작을 작성합니다.

```javascript
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
```

- [x] **Step 2: 초기화 루프 설정**
DOM 로드 시 `updateClock` 루프가 즉각 실행되도록 처리합니다.

```javascript
// Append directly in app.js bottom
function initClock() {
  setInterval(updateClock, 100);
  updateClock();
}

window.addEventListener('DOMContentLoaded', () => {
  initClock();
});
```

- [x] **Step 3: 변경사항 Commit**

Run:
```bash
git add app.js
git commit -m "feat: implement precise layout-shift free ticking clock engine"
```

---

### Task 5: 실시간 기온 및 날씨 정보 연동 (JS)

**Files:**
* Modify: `app.js` (날씨 API 호출 로직 및 SVG 렌더러 구현)

- [x] **Step 1: 날씨 코드 별 SVG 아이콘 및 텍스트 맵핑 구현**

`app.js` 상단에 다음 코드 조각을 추가하여 날씨 상태 데이터를 준비합니다.
```javascript
const LOCATIONS = {
  seoul: { lat: 37.5665, lon: 126.9780, name: '서울' },
  busan: { lat: 35.1796, lon: 129.0756, name: '부산' },
  daegu: { lat: 35.8714, lon: 128.6014, name: '대구' },
  incheon: { lat: 37.4563, lon: 126.7052, name: '인천' },
  gwangju: { lat: 35.1595, lon: 126.8526, name: '광주' },
  daejeon: { lat: 36.3504, lon: 127.3845, name: '대전' },
  ulsan: { lat: 35.5389, lon: 129.3114, name: '울산' },
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
```

- [x] **Step 2: 비동기 날씨 수신 로직 추가**
IP 기반 위치 정보(오프라인 대응 폴백 좌표 포함) 및 Open-Meteo API 호출부를 통합합니다.

```javascript
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
```

- [x] **Step 3: initClock() 내부에서 날씨 루프 실행하도록 등록**
`initClock()` 호출 함수를 변경합니다.

```javascript
// Replace DOMContentLoaded in app.js
window.addEventListener('DOMContentLoaded', () => {
  initClock();
  startWeatherLoop();
});
```

- [x] **Step 4: 변경사항 Commit**

Run:
```bash
git add app.js
git commit -m "feat: integrate weather check module with Open-Meteo"
```

---

### Task 6: 화면 항상 켜짐(Wake Lock) 및 번인 방지 자동 숨김 구현 (JS)

**Files:**
* Modify: `app.js`

- [ ] **Step 1: HTML5 Screen Wake Lock 활성화 함수 작성**

```javascript
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
      updateWakeLockUI(false);
    });
  } catch (err) {
    console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
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
  if (state.wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});
```

- [ ] **Step 2: 번인 방지를 위한 조작 버튼 4초 자동 숨김 구현**

```javascript
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
  resetControlsTimer();
}
```

- [ ] **Step 3: DOMContentLoaded 리스너 수정 및 최종 결합**
최종 부팅 등록을 완료합니다.

```javascript
// Replace DOMContentLoaded in app.js bottom
window.addEventListener('DOMContentLoaded', () => {
  initClock();
  startWeatherLoop();
  initWakeLockAndControls();
});
```

- [ ] **Step 4: 변경사항 Commit**

Run:
```bash
git add app.js
git commit -m "feat: implement Screen Wake Lock and controls auto-hide"
```

---

### Task 7: 사용자 설정 패널 및 LocalStorage 저장 연동 (JS)

**Files:**
* Modify: `app.js` (설정 이벤트 핸들러 및 LocalStorage 영구 영속성 저장 구현)

- [ ] **Step 1: LocalStorage 세이브 / 로드 함수 구현**

```javascript
function saveSettings() {
  localStorage.setItem('dclock_theme', state.theme);
  localStorage.setItem('dclock_seconds', state.showSeconds);
  localStorage.setItem('dclock_24h', state.is24h);
  localStorage.setItem('dclock_location', state.location);
}

function loadSettings() {
  state.theme = localStorage.getItem('dclock_theme') || 'green';
  state.showSeconds = localStorage.getItem('dclock_seconds') !== 'false';
  state.is24h = localStorage.getItem('dclock_24h') === 'true';
  state.location = localStorage.getItem('dclock_location') || 'auto';
  
  // Set UI state to match loaded settings
  document.documentElement.setAttribute('data-theme', state.theme);
  
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    if (swatch.dataset.color === state.theme) {
      swatch.classList.add('active');
    } else {
      swatch.classList.remove('active');
    }
  });

  document.getElementById('toggle-seconds').checked = state.showSeconds;
  document.getElementById('toggle-24h').checked = state.is24h;
  document.getElementById('location-select').value = state.location;
}
```

- [ ] **Step 2: 설정 패널 토글 및 조작 컨트롤러 이벤트 핸들러 구현**

```javascript
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

  // Fullscreen toggle
  const fsBtn = document.getElementById('fullscreen-btn');
  fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Fullscreen Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });
}
```

- [ ] **Step 3: DOMContentLoaded 내부에서 로드 및 설정 바인딩 연계**

```javascript
// Replace DOMContentLoaded in app.js bottom
window.addEventListener('DOMContentLoaded', () => {
  loadSettings(); // 1. Load settings first
  initClock(); // 2. Start clock
  startWeatherLoop(); // 3. Start weather loop
  initWakeLockAndControls(); // 4. Start Wake Lock & controls auto hide
  setupSettingsListeners(); // 5. Bind settings triggers
});
```

- [ ] **Step 4: 변경사항 Commit**

Run:
```bash
git add app.js
git commit -m "feat: finalize settings persistence and event handling in app.js"
```

---

## 🔍 최종 검증 및 테스트 방법

1. **로컬 파일 직접 실행 테스트:**
   * 타블렛 또는 테스트 브라우저에서 `index.html` 파일을 더블 클릭하여 `file:///` 프로토콜로 직접 엽니다.
   * 콘솔 창(F12)을 켜고 에러 메시지(빨간색 로그)가 찍히지 않는지 점검합니다.
2. **레이아웃 시프팅 검증:**
   * 초 단위를 키거나 끈 상태에서 중앙의 시(Hour)와 분(Minute) 숫자들이 1초마다 콜론이 깜빡일 때 부르르 떨리거나 움직이지 않고 완벽히 고정되는지 확인합니다.
3. **PWA 화면 항상 켜짐 테스트:**
   * 태블릿 브라우저 설정에서 화면 켜짐 유지 뱃지("화면 항상 켜짐 활성화 중 🟢")가 정상 작동 중인지 확인합니다.
   * 시계를 켜둔 채로 1~2분 대기했을 때 기기가 화면 잠금으로 진입하지 않는지 최종 점검합니다.
