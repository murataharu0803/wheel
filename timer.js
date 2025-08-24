const { ipcRenderer } = require('electron');

// --- 元素獲取 ---
const countdownDisplay = document.getElementById('countdown-display');

// --- 計時器變數 ---
let countdownSeconds = 0;
let countdownInterval = null;

// ==================================================================
//  ★★★ 以下是之前遺漏的、完整的核心函數 ★★★
// ==================================================================

function formatTime(totalSeconds) {
    const sign = totalSeconds < 0 ? "-" : "";
    totalSeconds = Math.abs(totalSeconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateDisplay() {
    countdownDisplay.textContent = formatTime(countdownSeconds);
}

function adjustTime(seconds) {
    countdownSeconds += seconds;
    updateDisplay();
}

function startPauseTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    } else {
        countdownInterval = setInterval(() => {
            countdownSeconds--;
            updateDisplay();
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    countdownSeconds = 0;
    updateDisplay();
}

// --- IPC 通訊 ---
ipcRenderer.on('timer-command', (event, command) => {
    if (command === 'start-pause') startPauseTimer();
    if (command === 'reset') resetTimer();
});
ipcRenderer.on('adjust-time-command', (event, seconds) => adjustTime(seconds));
ipcRenderer.on('apply-time-change', (event, timeData) => {
    const timeToAdd = (timeData.h * 3600) + (timeData.m * 60) + timeData.s;
    adjustTime(timeToAdd);
});

// --- 初始載入 ---
window.onload = updateDisplay;