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

// --- 計時器變數 ---
let countdownSeconds = 0;
let countdownInterval = null;

// --- 計時器核心函數 ---
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
        startPauseBtn.textContent = '開始';
        startPauseBtn.classList.remove('paused');
    } else {
        countdownInterval = setInterval(() => {
            countdownSeconds--;
            updateDisplay();
        }, 1000);
        startPauseBtn.textContent = '暫停';
        startPauseBtn.classList.add('paused');
    }
}

function resetTimer() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    countdownSeconds = 0;
    updateDisplay();
    startPauseBtn.textContent = '開始';
    startPauseBtn.classList.remove('paused');
}

// --- 選項列表核心函數 ---
const getRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

function updatePercentages() {
    const probInputs = document.querySelectorAll('.option-prob-input');
    let totalWeight = 0;
    probInputs.forEach(input => {
        totalWeight += parseFloat(input.value) || 0;
    });
    document.querySelectorAll('.option-row').forEach(row => {
        const probInput = row.querySelector('.option-prob-input');
        const percentageSpan = row.querySelector('.option-percentage');
        const weight = parseFloat(probInput.value) || 0;
        if (totalWeight > 0) {
            percentageSpan.textContent = `${((weight / totalWeight) * 100).toFixed(1)}%`;
        } else {
            percentageSpan.textContent = '0.0%';
        }
    });
}

function createOptionRow(name = '', probability = 1, color = getRandomColor(), h, m, s) {
    const row = document.createElement('div');
    row.className = 'option-row';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'option-name-input';
    nameInput.placeholder = '選項名稱';
    nameInput.value = name;
    const probInput = document.createElement('input');
    probInput.type = 'number';
    probInput.className = 'option-prob-input';
    probInput.min = '1';
    probInput.value = probability;
    probInput.oninput = updatePercentages;
    const percentageSpan = document.createElement('span');
    percentageSpan.className = 'option-percentage';
    const timerInputs = document.createElement('div');
    timerInputs.className = 'timer-inputs';
    const hInput = document.createElement('input');
    hInput.type = 'number';
    hInput.className = 'option-h-input';
    hInput.placeholder = '時';
    if (h !== undefined) hInput.value = h;
    const mInput = document.createElement('input');
    mInput.type = 'number';
    mInput.className = 'option-m-input';
    mInput.placeholder = '分';
    if (m !== undefined) mInput.value = m;
    const sInput = document.createElement('input');
    sInput.type = 'number';
    sInput.className = 'option-s-input';
    sInput.placeholder = '秒';
    if (s !== undefined) sInput.value = s;
    timerInputs.append(hInput, mInput, sInput);
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'option-color-input';
    colorInput.value = color;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => {
        row.remove();
        updatePercentages();
    };
    row.append(nameInput, probInput, percentageSpan, timerInputs, colorInput, removeBtn);
    optionsList.append(row);
}

// --- 事件監聽與 IPC 通訊 ---

// ★★★ 核心修正：使用更穩健的邏輯來切換按鈕狀態 ★★★
showTurntableBtn.addEventListener('click', () => {
    ipcRenderer.send('toggle-turntable');
    // 立即更新UI以提供反饋，後續由 main.js 的通知來確保最終狀態正確
    if (showTurntableBtn.textContent === '顯示轉盤') {
        showTurntableBtn.textContent = '關閉轉盤';
        showTurntableBtn.classList.add('active');
    } else {
        showTurntableBtn.textContent = '顯示轉盤';
        showTurntableBtn.classList.remove('active');
    }
});

showTimerBtn.addEventListener('click', () => {
    ipcRenderer.send('toggle-timer');
    if (showTimerBtn.textContent === '顯示計時器') {
        showTimerBtn.textContent = '關閉計時器';
        showTimerBtn.classList.add('active');
    } else {
        showTimerBtn.textContent = '顯示計時器';
        showTimerBtn.classList.remove('active');
    }
});

ipcRenderer.on('turntable-window-closed', () => {
    showTurntableBtn.textContent = '顯示轉盤';
    showTurntableBtn.classList.remove('active');
});

ipcRenderer.on('timer-window-closed', () => {
    showTimerBtn.textContent = '顯示計時器';
    showTimerBtn.classList.remove('active');
});


updateWheelBtn.addEventListener('click', () => {
    const parsedOptions = [];
    document.querySelectorAll('.option-row').forEach(row => {
        const name = row.querySelector('.option-name-input').value.trim();
        if (name) {
            parsedOptions.push({
                text: name,
                fillStyle: row.querySelector('.option-color-input').value,
                weight: parseFloat(row.querySelector('.option-prob-input').value) || 1,
                h: parseInt(row.querySelector('.option-h-input').value) || 0,
                m: parseInt(row.querySelector('.option-m-input').value) || 0,
                s: parseInt(row.querySelector('.option-s-input').value) || 0
            });
        }
    });
    ipcRenderer.send('update-wheel', parsedOptions);
});

addOptionBtn.addEventListener('click', () => {
    createOptionRow();
    updatePercentages();
});

startPauseBtn.addEventListener('click', () => ipcRenderer.send('timer-control', 'start-pause'));
resetBtn.addEventListener('click', () => ipcRenderer.send('timer-control', 'reset'));

timeAdjustButtons.forEach(button => {
    button.addEventListener('click', () => {
        const seconds = parseInt(button.dataset.time);
        ipcRenderer.send('time-adjust', seconds);
    });
});

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
window.onload = function() {
    createOptionRow('加 1 分鐘', 1, '#2ecc71', undefined, 1, undefined);
    createOptionRow('減 30 秒', 1, '#e74c3c', undefined, undefined, -30);
    createOptionRow('加 5 分鐘', 1, '#3498db', undefined, 5, undefined);
    updatePercentages();
    updateDisplay();
    updateWheelBtn.click();
};