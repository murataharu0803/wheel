const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let turntableWindow, optionsWindow, timerWindow;

function createAllWindows() {
    // 建立轉盤視窗 (無變化)
    turntableWindow = new BrowserWindow({ /* ... */ });
    turntableWindow.loadFile('turntable.html');
    turntableWindow.on('closed', () => { turntableWindow = null; });

    // 建立選項設定視窗 (無變化)
    optionsWindow = new BrowserWindow({ /* ... */ });
    optionsWindow.loadFile('options.html');
    optionsWindow.on('closed', () => { optionsWindow = null; });

    // 建立計時器視窗 (無變化)
    timerWindow = new BrowserWindow({ /* ... */ });
    timerWindow.loadFile('timer.html');
    timerWindow.on('closed', () => { timerWindow = null; });
}

app.whenReady().then(createAllWindows);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createAllWindows(); });

// ==================================================================
//  ★★★ 升級後的跨行程通訊 (IPC) ★★★
// ==================================================================

// 轉發選項更新 (無變化)
ipcMain.on('update-wheel', (event, optionsData) => {
    if (turntableWindow) {
        turntableWindow.webContents.send('wheel-updated', optionsData);
    }
});

// 轉發中獎時間 (無變化)
ipcMain.on('spin-result', (event, timeData) => {
    // ★★★ 現在廣播給兩個視窗 ★★★
    if (optionsWindow) optionsWindow.webContents.send('apply-time-change', timeData);
    if (timerWindow) timerWindow.webContents.send('apply-time-change', timeData);
});

// ★★★ 新增：監聽並廣播計時器控制指令 ★★★
ipcMain.on('timer-control', (event, command) => {
    // command 可以是 'start-pause' 或 'reset'
    if (optionsWindow) optionsWindow.webContents.send('timer-command', command);
    if (timerWindow) timerWindow.webContents.send('timer-command', command);
});

// ★★★ 新增：監聽並廣播手動時間調整指令 ★★★
ipcMain.on('time-adjust', (event, seconds) => {
    if (optionsWindow) optionsWindow.webContents.send('adjust-time-command', seconds);
    if (timerWindow) timerWindow.webContents.send('adjust-time-command', seconds);
});

// 為了讓程式碼更簡潔，補上視窗建立的詳細設定
function createAllWindows() {
    turntableWindow = new BrowserWindow({ width: 550, height: 550, x: 50, y: 50, webPreferences: { contextIsolation: false, nodeIntegration: true }, icon: path.join(__dirname, 'icon.ico') });
    turntableWindow.loadFile('turntable.html');
    turntableWindow.on('closed', () => { turntableWindow = null; });
    
    optionsWindow = new BrowserWindow({ width: 480, height: 620, x: 620, y: 50, parent: turntableWindow, webPreferences: { contextIsolation: false, nodeIntegration: true } });
    optionsWindow.loadFile('options.html');
    optionsWindow.on('closed', () => { optionsWindow = null; });

    timerWindow = new BrowserWindow({ width: 300, height: 150, x: 50, y: 620, parent: turntableWindow, webPreferences: { contextIsolation: false, nodeIntegration: true } });
    timerWindow.loadFile('timer.html');
    timerWindow.on('closed', () => { timerWindow = null; });
}