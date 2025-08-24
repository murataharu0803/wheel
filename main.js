const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// --- 全域變數 ---
let optionsWindow = null;
let turntableWindow = null;
let timerWindow = null;
let isTurntableFrameless = false;
let isTimerFrameless = false;
let lastKnownOptionsData = [];

// ==================================================================
//  ★★★ 終極修正：將計時器狀態和邏輯移至主行程 ★★★
// ==================================================================
let countdownSeconds = 0;
let countdownInterval = null;

// 每秒廣播一次最新時間
function broadcastTime() {
    const time = formatTime(countdownSeconds);
    if (optionsWindow && !optionsWindow.isDestroyed()) {
        optionsWindow.webContents.send('time-update', time);
    }
    if (timerWindow && !timerWindow.isDestroyed()) {
        timerWindow.webContents.send('time-update', time);
    }
}

function startPauseTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    } else {
        countdownInterval = setInterval(() => {
            countdownSeconds--;
            broadcastTime();
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    countdownSeconds = 0;
    broadcastTime();
}

function adjustTime(seconds) {
    countdownSeconds += seconds;
    broadcastTime();
}

// 輔助函數，因為現在只有 main.js 需要它
function formatTime(totalSeconds) { const sign = totalSeconds < 0 ? "-" : ""; totalSeconds = Math.abs(totalSeconds); const h = Math.floor(totalSeconds / 3600); const m = Math.floor((totalSeconds % 3600) / 60); const s = totalSeconds % 60; return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }


// --- 狀態廣播函數 (保持不變) ---
function broadcastWindowState() { /* ... */ }

// --- 視窗創建函數 (加入 backgroundThrottling) ---
function createOptionsWindow() {
    optionsWindow = new BrowserWindow({
        width: 480, height: 650, x: 620, y: 50,
        webPreferences: {
            contextIsolation: false, nodeIntegration: true,
            backgroundThrottling: false // ★★★ 修正問題一 ★★★
        },
        icon: path.join(__dirname, 'icon.ico')
    });
    optionsWindow.loadFile('options.html');
    optionsWindow.on('close', () => { /* ... */ });
    optionsWindow.on('closed', () => { app.quit(); });
}

function createTimerWindow(bounds = null) {
    // (創建邏輯不變，但加入 backgroundThrottling)
    const windowOptions = {
        width: 300, height: 150,
        frame: !isTimerFrameless, transparent: isTimerFrameless, parent: optionsWindow,
        webPreferences: {
            contextIsolation: false, nodeIntegration: true,
            backgroundThrottling: false // ★★★ 修正問題一 ★★★
        }
    };
    // ...
    timerWindow = new BrowserWindow(windowOptions);
    timerWindow.loadFile('timer.html');

    // ★★★ 核心修正：新視窗創建後，立即給它發送一次當前時間 ★★★
    timerWindow.webContents.on('did-finish-load', () => {
        broadcastTime();
    });
    // ...
}
// (createTurntableWindow 函數不變)

// --- 應用程式生命週期 (不變) ---
// ...

// --- IPC 通訊 (現在直接操作 main.js 的計時器) ---
ipcMain.on('timer-control', (event, command) => {
    if (command === 'start-pause') startPauseTimer();
    if (command === 'reset') resetTimer();
});

ipcMain.on('time-adjust', (event, seconds) => {
    adjustTime(seconds);
});

ipcMain.on('spin-result', (event, timeData) => {
    const timeToAdd = (timeData.h * 3600) + (timeData.m * 60) + timeData.s;
    adjustTime(timeToAdd);
});

// (其他 IPC 保持不變)
// ...

// --- 為求完整，附上所有程式碼 ---
function broadcastWindowState() { const state = { isTurntableOpen: !!(turntableWindow && !turntableWindow.isDestroyed()), isTimerOpen: !!(timerWindow && !timerWindow.isDestroyed()), }; if (optionsWindow && !optionsWindow.isDestroyed()) { optionsWindow.webContents.send('window-state-update', state); } }
function createOptionsWindow() { optionsWindow = new BrowserWindow({ width: 480, height: 650, x: 620, y: 50, webPreferences: { contextIsolation: false, nodeIntegration: true, backgroundThrottling: false }, icon: path.join(__dirname, 'icon.ico') }); optionsWindow.loadFile('options.html'); optionsWindow.on('close', () => { if (turntableWindow && !turntableWindow.isDestroyed()) turntableWindow.destroy(); if (timerWindow && !timerWindow.isDestroyed()) timerWindow.destroy(); }); optionsWindow.on('closed', () => { app.quit(); }); }
function createTurntableWindow(bounds = null) { if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.focus(); return; } const windowOptions = { width: 550, height: 550, frame: !isTurntableFrameless, transparent: isTurntableFrameless, parent: optionsWindow, webPreferences: { contextIsolation: false, nodeIntegration: true } }; if (bounds) { Object.assign(windowOptions, bounds); } else { windowOptions.x = 50; windowOptions.y = 50; } turntableWindow = new BrowserWindow(windowOptions); turntableWindow.loadFile('turntable.html'); turntableWindow.webContents.on('did-finish-load', () => { if (turntableWindow && !turntableWindow.isDestroyed()) turntableWindow.webContents.send('wheel-updated', lastKnownOptionsData); }); turntableWindow.on('close', () => { turntableWindow = null; broadcastWindowState(); }); broadcastWindowState(); }
function createTimerWindow(bounds = null) { if (timerWindow && !timerWindow.isDestroyed()) { timerWindow.focus(); return; } const windowOptions = { width: 300, height: 150, frame: !isTimerFrameless, transparent: isTimerFrameless, parent: optionsWindow, webPreferences: { contextIsolation: false, nodeIntegration: true, backgroundThrottling: false } }; if (bounds) { Object.assign(windowOptions, bounds); } else { windowOptions.x = 50; windowOptions.y = 620; } timerWindow = new BrowserWindow(windowOptions); timerWindow.loadFile('timer.html'); timerWindow.webContents.on('did-finish-load', () => { broadcastTime(); }); timerWindow.on('close', () => { timerWindow = null; broadcastWindowState(); }); broadcastWindowState(); }
app.whenReady().then(() => { createOptionsWindow(); globalShortcut.register('F10', () => { const focusedWindow = BrowserWindow.getFocusedWindow(); if (!focusedWindow || focusedWindow.isDestroyed()) return; if (turntableWindow && !turntableWindow.isDestroyed() && focusedWindow.id === turntableWindow.id) { const bounds = turntableWindow.getBounds(); isTurntableFrameless = !isTurntableFrameless; turntableWindow.destroy(); createTurntableWindow(bounds); } else if (timerWindow && !timerWindow.isDestroyed() && focusedWindow.id === timerWindow.id) { const bounds = timerWindow.getBounds(); isTimerFrameless = !isTimerFrameless; timerWindow.destroy(); createTimerWindow(bounds); } }); });
app.on('will-quit', () => { globalShortcut.unregisterAll(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createOptionsWindow(); });
ipcMain.handle('get-initial-options', () => lastKnownOptionsData);
ipcMain.on('toggle-turntable', () => { if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.close(); } else { createTurntableWindow(); } });
ipcMain.on('toggle-timer', () => { if (timerWindow && !timerWindow.isDestroyed()) { timerWindow.close(); } else { createTimerWindow(); } });
ipcMain.on('update-wheel', (event, optionsData) => { lastKnownOptionsData = optionsData; if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.webContents.send('wheel-updated', optionsData); } });