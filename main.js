const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');


let optionsWindow = null;
let turntableWindow = null;
let timerWindow = null;
let isTurntableFrameless = false;
let isTimerFrameless = false;
let lastKnownOptionsData = [];
let countdownSeconds = 0;
let countdownInterval = null;


function formatTime(totalSeconds) { const sign = totalSeconds < 0 ? "-" : ""; totalSeconds = Math.abs(totalSeconds); const h = Math.floor(totalSeconds / 3600); const m = Math.floor((totalSeconds % 3600) / 60); const s = totalSeconds % 60; return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }
function broadcastTime() { const time = formatTime(countdownSeconds); if (optionsWindow && !optionsWindow.isDestroyed()) optionsWindow.webContents.send('time-update', time); if (timerWindow && !timerWindow.isDestroyed()) timerWindow.webContents.send('time-update', time); }
function startPauseTimer() { if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; } else { countdownInterval = setInterval(() => { countdownSeconds--; broadcastTime(); }, 1000); } }
function resetTimer() { clearInterval(countdownInterval); countdownInterval = null; countdownSeconds = 0; broadcastTime(); }
function adjustTime(seconds) { countdownSeconds += seconds; broadcastTime(); }


function broadcastWindowState() {
    const state = {
        isTurntableOpen: !!(turntableWindow && !turntableWindow.isDestroyed()),
        isTimerOpen: !!(timerWindow && !timerWindow.isDestroyed()),
    };
    if (optionsWindow && !optionsWindow.isDestroyed()) {
        optionsWindow.webContents.send('window-state-update', state);
    }
}


function createOptionsWindow() {
    optionsWindow = new BrowserWindow({
        width: 480, height: 650, x: 620, y: 50,
        webPreferences: { contextIsolation: false, nodeIntegration: true, backgroundThrottling: false },
        icon: path.join(__dirname, 'icon.ico')
    });
    optionsWindow.loadFile('options.html');
    optionsWindow.on('close', () => {
        if (turntableWindow && !turntableWindow.isDestroyed()) turntableWindow.destroy();
        if (timerWindow && !timerWindow.isDestroyed()) timerWindow.destroy();
    });
    optionsWindow.on('closed', () => { app.quit(); });
}

function createTurntableWindow(bounds = null) {
    if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.focus(); return; }
    const windowOptions = { width: 550, height: 550, frame: !isTurntableFrameless, transparent: isTurntableFrameless, webPreferences: { contextIsolation: false, nodeIntegration: true } };
    if (bounds) { Object.assign(windowOptions, bounds); } else { windowOptions.x = 50; windowOptions.y = 50; }
    turntableWindow = new BrowserWindow(windowOptions);
    turntableWindow.loadFile('turntable.html');

    const menuTemplate = [{ label: '控制', submenu: [{ label: '切换边框', accelerator: 'F10', click: () => { if (turntableWindow && !turntableWindow.isDestroyed()) { const currentBounds = turntableWindow.getBounds(); isTurntableFrameless = !isTurntableFrameless; turntableWindow.destroy(); createTurntableWindow(currentBounds); } } }] }];
    const menu = Menu.buildFromTemplate(menuTemplate);
    turntableWindow.setMenu(menu);
    turntableWindow.setMenuBarVisibility(false);

    turntableWindow.webContents.on('did-finish-load', () => { if (turntableWindow && !turntableWindow.isDestroyed()) turntableWindow.webContents.send('wheel-updated', lastKnownOptionsData); });
    turntableWindow.on('close', () => { turntableWindow = null; broadcastWindowState(); });
    broadcastWindowState();
}


function createTimerWindow(bounds = null) {
    if (timerWindow && !timerWindow.isDestroyed()) { timerWindow.focus(); return; }
    const windowOptions = { width: 300, height: 150, frame: !isTimerFrameless, transparent: isTimerFrameless, webPreferences: { contextIsolation: false, nodeIntegration: true, backgroundThrottling: false } };
    if (bounds) { Object.assign(windowOptions, bounds); } else { windowOptions.x = 50; windowOptions.y = 620; }
    timerWindow = new BrowserWindow(windowOptions);
    timerWindow.loadFile('timer.html');

    const menuTemplate = [{ label: '控制', submenu: [{ label: '切换边框', accelerator: 'F10', click: () => { if (timerWindow && !timerWindow.isDestroyed()) { const currentBounds = timerWindow.getBounds(); isTimerFrameless = !isTimerFrameless; timerWindow.destroy(); createTimerWindow(currentBounds); } } }] }];
    const menu = Menu.buildFromTemplate(menuTemplate);
    timerWindow.setMenu(menu);
    timerWindow.setMenuBarVisibility(false);

    timerWindow.webContents.on('did-finish-load', () => { broadcastTime(); });
    timerWindow.on('close', () => { timerWindow = null; broadcastWindowState(); });
    broadcastWindowState();
}


app.whenReady().then(createOptionsWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createOptionsWindow();
    }
});


ipcMain.handle('get-initial-options', () => lastKnownOptionsData);
ipcMain.on('toggle-turntable', () => { if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.close(); } else { createTurntableWindow(); } });
ipcMain.on('toggle-timer', () => { if (timerWindow && !timerWindow.isDestroyed()) { timerWindow.close(); } else { createTimerWindow(); } });
ipcMain.on('update-wheel', (event, optionsData) => { lastKnownOptionsData = optionsData; if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.webContents.send('wheel-updated', optionsData); } });
ipcMain.on('spin-result', (event, timeData) => { const timeToAdd = (timeData.h * 3600) + (timeData.m * 60) + timeData.s; adjustTime(timeToAdd); });
ipcMain.on('timer-control', (event, command) => { if (command === 'start-pause') startPauseTimer(); if (command === 'reset') resetTimer(); });
ipcMain.on('time-adjust', (event, seconds) => { adjustTime(seconds); });