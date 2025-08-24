const { ipcRenderer } = require('electron');

// --- 元素獲取 ---
const showTurntableBtn = document.getElementById('show-turntable-btn');
const showTimerBtn = document.getElementById('show-timer-btn');
const optionsList = document.getElementById('options-list');
const addOptionBtn = document.getElementById('add-option-btn');
const updateWheelBtn = document.getElementById('update-wheel-btn');
const countdownDisplay = document.getElementById('countdown-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const timeAdjustButtons = document.querySelectorAll('.time-btn');

// --- IPC 通訊 ---
ipcRenderer.on('time-update', (event, timeString) => {
    countdownDisplay.textContent = timeString;
});

ipcRenderer.on('window-state-update', (event, state) => {
    if (state.isTurntableOpen) {
        showTurntableBtn.textContent = '關閉轉盤';
        showTurntableBtn.classList.add('active');
    } else {
        showTurntableBtn.textContent = '顯示轉盤';
        showTurntableBtn.classList.remove('active');
    }
    if (state.isTimerOpen) {
        showTimerBtn.textContent = '關閉計時器';
        showTimerBtn.classList.add('active');
    } else {
        showTimerBtn.textContent = '顯示計時器';
        showTimerBtn.classList.remove('active');
    }
});

showTurntableBtn.addEventListener('click', () => ipcRenderer.send('toggle-turntable'));
showTimerBtn.addEventListener('click', () => ipcRenderer.send('toggle-timer'));

updateWheelBtn.addEventListener('click', () => {
    const parsedOptions = [];
    document.querySelectorAll('.option-row').forEach(row => {
        const name = row.querySelector('.option-name-input').value.trim();
        if (name) {
            parsedOptions.push({ text: name, fillStyle: row.querySelector('.option-color-input').value, weight: parseFloat(row.querySelector('.option-prob-input').value) || 1, h: parseInt(row.querySelector('.option-h-input').value) || 0, m: parseInt(row.querySelector('.option-m-input').value) || 0, s: parseInt(row.querySelector('.option-s-input').value) || 0 });
        }
    });
    ipcRenderer.send('update-wheel', parsedOptions);
});

addOptionBtn.addEventListener('click', () => { createOptionRow(); updatePercentages(); });

startPauseBtn.addEventListener('click', () => {
    ipcRenderer.send('timer-control', 'start-pause');
    if (startPauseBtn.textContent === '開始' || startPauseBtn.textContent === '繼續') {
        startPauseBtn.textContent = '暫停';
        startPauseBtn.classList.add('paused');
    } else {
        startPauseBtn.textContent = '繼續';
        startPauseBtn.classList.remove('paused');
    }
});

resetBtn.addEventListener('click', () => {
    ipcRenderer.send('timer-control', 'reset');
    startPauseBtn.textContent = '開始';
    startPauseBtn.classList.remove('paused');
});

timeAdjustButtons.forEach(button => { button.addEventListener('click', () => { const seconds = parseInt(button.dataset.time); ipcRenderer.send('time-adjust', seconds); }); });

// --- 介面核心函數 (保持不變) ---
const getRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
function updatePercentages() { const probInputs = document.querySelectorAll('.option-prob-input'); let totalWeight = 0; probInputs.forEach(input => { totalWeight += parseFloat(input.value) || 0; }); document.querySelectorAll('.option-row').forEach(row => { const probInput = row.querySelector('.option-prob-input'); const percentageSpan = row.querySelector('.option-percentage'); const weight = parseFloat(probInput.value) || 0; if (totalWeight > 0) { percentageSpan.textContent = `${((weight / totalWeight) * 100).toFixed(1)}%`; } else { percentageSpan.textContent = '0.0%'; } }); }
function createOptionRow(name = '', probability = 1, color = getRandomColor(), h, m, s) { const row = document.createElement('div'); row.className = 'option-row'; const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'option-name-input'; nameInput.placeholder = '選項名稱'; nameInput.value = name; const probInput = document.createElement('input'); probInput.type = 'number'; probInput.className = 'option-prob-input'; probInput.min = '1'; probInput.value = probability; probInput.oninput = updatePercentages; const percentageSpan = document.createElement('span'); percentageSpan.className = 'option-percentage'; const timerInputs = document.createElement('div'); timerInputs.className = 'timer-inputs'; const hInput = document.createElement('input'); hInput.type = 'number'; hInput.className = 'option-h-input'; hInput.placeholder = '時'; if (h !== undefined) hInput.value = h; const mInput = document.createElement('input'); mInput.type = 'number'; mInput.className = 'option-m-input'; mInput.placeholder = '分'; if (m !== undefined) mInput.value = m; const sInput = document.createElement('input'); sInput.type = 'number'; sInput.className = 'option-s-input'; sInput.placeholder = '秒'; if (s !== undefined) sInput.value = s; timerInputs.append(hInput, mInput, sInput); const colorInput = document.createElement('input'); colorInput.type = 'color'; colorInput.className = 'option-color-input'; colorInput.value = color; const removeBtn = document.createElement('button'); removeBtn.className = 'remove-btn'; removeBtn.innerHTML = '&times;'; removeBtn.onclick = () => { row.remove(); updatePercentages(); }; row.append(nameInput, probInput, percentageSpan, timerInputs, colorInput, removeBtn); optionsList.append(row); }

// --- 初始載入 ---
window.onload = function() { createOptionRow('加 1 分鐘', 1, '#2ecc71', undefined, 1, undefined); createOptionRow('減 30 秒', 1, '#e74c3c', undefined, undefined, -30); createOptionRow('加 5 分鐘', 1, '#3498db', undefined, 5, undefined); updatePercentages(); updateWheelBtn.click(); };