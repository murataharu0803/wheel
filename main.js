const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// ★★★ 核心修正：將 squirrel startup 的處理邏輯，移到 app 被宣告之後 ★★★
// 這是官方推薦的、最穩妥的做法
if (require('electron-squirrel-startup')) {
    app.quit();
}

// 全域變數
let optionsWindow = null;
let turntableWindow = null;
let timerWindow = null;
let isTurntableFrameless = false;
let isTimerFrameless = false;
let lastKnownOptionsData = [];

// 狀態廣播函數
function broadcastWindowState() {
    const state = {
        isTurntableOpen: !!(turntableWindow && !turntableWindow.isDestroyed()),
        isTimerOpen: !!(timerWindow && !timerWindow.isDestroyed()),
    };
    if (optionsWindow && !optionsWindow.isDestroyed()) {
        optionsWindow.webContents.send('window-state-update', state);
    }
}

// --- 視窗創建函數 ---
function createOptionsWindow() {
    optionsWindow = new BrowserWindow({ width: 480, height: 650, x: 620, y: 50, webPreferences: { contextIsolation: false, nodeIntegration: true }, icon: path.join(__dirname, 'icon.ico') });
    optionsWindow.loadFile('options.html');
    
    optionsWindow.on('close', () => {
        if (turntableWindow && !turntableWindow.isDestroyed()) turntableWindow.destroy();
        if (timerWindow && !timerWindow.isDestroyed()) timerWindow.destroy();
    });
    optionsWindow.on('closed', () => { app.quit(); });
}

function createTurntableWindow(bounds = null) {
    if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.focus(); return; }
    const windowOptions = { width: 550, height: 550, frame: !isTurntableFrameless, transparent: isTurntableFrameless, parent: optionsWindow, webPreferences: { contextIsolation: false, nodeIntegration: true } };
    if (bounds) { Object.assign(windowOptions, bounds); } else { windowOptions.x = 50; windowOptions.y = 50; }
    turntableWindow = new BrowserWindow(windowOptions);
    turntableWindow.loadFile('turntable.html');

    turntableWindow.webContents.on('did-finish-load', () => {
        if (turntableWindow && !turntableWindow.isDestroyed()) {
            turntableWindow.webContents.send('wheel-updated', lastKnownOptionsData);
        }
    });

    turntableWindow.on('close', () => {
        turntableWindow = null;
        broadcastWindowState();
    });
    
    broadcastWindowState();
}

function createTimerWindow(bounds = null) {
    if (timerWindow && !timerWindow.isDestroyed()) { timerWindow.focus(); return; }
    const windowOptions = { width: 300, height: 150, frame: !isTimerFrameless, transparent: isTimerFrameless, parent: optionsWindow, webPreferences: { contextIsolation: false, nodeIntegration: true } };
    if (bounds) { Object.assign(windowOptions, bounds); } else { windowOptions.x = 50; windowOptions.y = 620; }
    timerWindow = new BrowserWindow(windowOptions);
    timerWindow.loadFile('timer.html');
    
    timerWindow.on('close', () => {
        timerWindow = null;
        broadcastWindowState();
    });

    broadcastWindowState();
}

// --- 應用程式生命週期 ---
app.whenReady().then(() => {
    createOptionsWindow();
    globalShortcut.register('F10', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || focusedWindow.isDestroyed()) return;
        
        if (turntableWindow && !turntableWindow.isDestroyed() && focusedWindow.id === turntableWindow.id) {
            const bounds = turntableWindow.getBounds();
            isTurntableFrameless = !isTurntableFrameless;
            turntableWindow.destroy();
            createTurntableWindow(bounds);
        } else if (timerWindow && !timerWindow.isDestroyed() && focusedWindow.id === timerWindow.id) {
            const bounds = timerWindow.getBounds();
            isTimerFrameless = !isTimerFrameless;
            timerWindow.destroy();
            createTimerWindow(bounds);
        }
    });
});
app.on('will-quit', () => { globalShortcut.unregisterAll(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createOptionsWindow(); });

// --- IPC 通訊 ---
ipcMain.handle('get-initial-options', () => lastKnownOptionsData);
ipcMain.on('toggle-turntable', () => { if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.close(); } else { createTurntableWindow(); } });
ipcMain.on('toggle-timer', () => { if (timerWindow && !timerWindow.isDestroyed()) { timerWindow.close(); } else { createTimerWindow(); } });
ipcMain.on('update-wheel', (event, optionsData) => { lastKnownOptionsData = optionsData; if (turntableWindow && !turntableWindow.isDestroyed()) { turntableWindow.webContents.send('wheel-updated', optionsData); } });
ipcMain.on('spin-result', (event, timeData) => { if (optionsWindow && !optionsWindow.isDestroyed()) optionsWindow.webContents.send('apply-time-change', timeData); if (timerWindow && !timerWindow.isDestroyed()) timerWindow.webContents.send('apply-time-change', timeData); });
ipcMain.on('timer-control', (event, command) => { if (optionsWindow && !optionsWindow.isDestroyed()) optionsWindow.webContents.send('timer-command', command); if (timerWindow && !timerWindow.isDestroyed()) timerWindow.webContents.send('timer-command', command); });
ipcMain.on('time-adjust', (event, seconds) => { if (optionsWindow && !optionsWindow.isDestroyed()) optionsWindow.webContents.send('adjust-time-command', seconds); if (timerWindow && !timerWindow.isDestroyed()) timerWindow.webContents.send('adjust-time-command', seconds); });