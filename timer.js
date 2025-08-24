const { ipcRenderer } = require('electron');

const countdownDisplay = document.getElementById('countdown-display');

// ★★★ 核心修正：移除所有本地計時器變數和函數 ★★★

// ★★★ 核心修正：監聽來自 main.js 的時間更新 ★★★
ipcRenderer.on('time-update', (event, timeString) => {
    countdownDisplay.textContent = timeString;
});

// (監聽 F10 的邏輯不變)
ipcRenderer.on('f10-pressed', () => {
    ipcRenderer.send('toggle-my-frame');
});

// ★★★ 核心修正：初始載入時，請求一次當前時間 ★★★
// (這個邏輯已移至 main.js 的 did-finish-load 中，此處無需操作)