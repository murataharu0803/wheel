// --- 元素獲取 ---
const optionsList = document.getElementById('options-list');
const addOptionBtn = document.getElementById('add-option-btn');
const updateWheelBtn = document.getElementById('update-wheel-btn');
const spinButton = document.getElementById('spin_button');
const modal = document.getElementById('modal');
const winnerText = document.getElementById('winner-text');
const closeModalBtn = document.getElementById('close-modal-btn');
const removeWinnerBtn = document.getElementById('remove-winner-btn');
const countdownDisplay = document.getElementById('countdown-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const timeAdjustButtons = document.querySelectorAll('.time-btn');

// --- 全域變數 ---
let theWheel;
let spinning = false;
let currentWinner = null;
let parsedOptions = [];
let countdownSeconds = 0;
let countdownInterval = null;

// --- 輔助函數 ---
const getRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

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

// --- 百分比計算函數 ---
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
            const percentage = (weight / totalWeight) * 100;
            percentageSpan.textContent = `${percentage.toFixed(1)}%`;
        } else {
            percentageSpan.textContent = '0.0%';
        }
    });
}

// --- 動態建立選項行 ---
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
    hInput.placeholder = 'hh';
    if (h !== undefined) hInput.value = h;

    const mInput = document.createElement('input'); 
    mInput.type = 'number'; 
    mInput.className = 'option-m-input';
    mInput.placeholder = 'mm';
    if (m !== undefined) mInput.value = m;

    const sInput = document.createElement('input'); 
    sInput.type = 'number'; 
    sInput.className = 'option-s-input';
    sInput.placeholder = 'ss';
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
        updateWheel(); 
        updatePercentages(); 
    };
    
    row.append(nameInput, probInput, percentageSpan, timerInputs, colorInput, removeBtn);
    optionsList.append(row);
}

// --- 更新轉盤核心函數 ---
function updateWheel() {
    parsedOptions = [];
    const rows = document.querySelectorAll('.option-row');
    rows.forEach(row => {
        const name = row.querySelector('.option-name-input').value.trim();
        const probability = parseFloat(row.querySelector('.option-prob-input').value);
        const color = row.querySelector('.option-color-input').value;

        const h = parseInt(row.querySelector('.option-h-input').value) || 0;
        const m = parseInt(row.querySelector('.option-m-input').value) || 0;
        const s = parseInt(row.querySelector('.option-s-input').value) || 0;
        
        if (name) {
            parsedOptions.push({
                'text': name, 'fillStyle': color,
                'weight': (!isNaN(probability) && probability > 0) ? probability : 1,
                'h': h, 'm': m, 's': s
            });
        }
    });

    if (parsedOptions.length === 0) { 
        if (theWheel) theWheel.clearCanvas(); 
        return; 
    }

    const totalWeight = parsedOptions.reduce((sum, opt) => sum + opt.weight, 0);
    const segmentsForWheel = parsedOptions.map(opt => ({ 
        ...opt, 
        'size': (opt.weight / totalWeight) * 360 
    }));

    theWheel = new Winwheel({
        'numSegments': segmentsForWheel.length, 
        'outerRadius': 240, 
        'innerRadius': 70, 
        'textFontSize': 16,
        'segments': segmentsForWheel,
        'animation': { 'type': 'spinToStop', 'callbackFinished': alertPrize, 'soundTrigger': 'pin' },
        'pins': { 'number': segmentsForWheel.length * 2, 'fillStyle': 'silver', 'outerRadius': 4 }
    });
}

// --- 轉盤結束回呼函數 ---
function alertPrize(indicatedSegment) {
    currentWinner = parsedOptions.find(opt => opt.text === indicatedSegment.text);
    if (currentWinner) {
        winnerText.textContent = currentWinner.text;
        const timeToAdd = (currentWinner.h * 3600) + (currentWinner.m * 60) + currentWinner.s;
        adjustTime(timeToAdd);
    }
    modal.classList.add('visible');
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    spinning = false;
}

// --- 事件監聽 ---
addOptionBtn.addEventListener('click', () => { 
    createOptionRow(); 
    updatePercentages(); 
});

updateWheelBtn.addEventListener('click', () => {
    document.querySelectorAll('.option-h-input, .option-m-input, .option-s-input').forEach(input => {
        if (!input.value) {
            input.value = 0;
        }
    });
    updateWheel();
});

closeModalBtn.addEventListener('click', () => modal.classList.remove('visible'));

startPauseBtn.addEventListener('click', startPauseTimer);

resetBtn.addEventListener('click', resetTimer);

timeAdjustButtons.forEach(button => {
    button.addEventListener('click', () => {
        const time = parseInt(button.dataset.time);
        adjustTime(time);
    });
});

spinButton.addEventListener('click', () => {
    if (spinning || !theWheel || theWheel.numSegments === 0) return;
    spinning = true;

    // 重新更新一次資料，確保轉盤使用的是最新的設定
    updateWheel(); 
    
    const totalWeight = parsedOptions.reduce((sum, opt) => sum + opt.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    let winningSegmentIndex = -1;
    for (let i = 0; i < parsedOptions.length; i++) {
        randomWeight -= parsedOptions[i].weight;
        if (randomWeight <= 0) { 
            winningSegmentIndex = i; 
            break; 
        }
    }
    const winningSegment = theWheel.segments[winningSegmentIndex + 1];
    const stopAt = Math.floor(Math.random() * (winningSegment.endAngle - winningSegment.startAngle)) + winningSegment.startAngle;
    const randomSpins = Math.floor(Math.random() * 8) + 8;
    const randomDuration = Math.floor(Math.random() * 5) + 7;
    theWheel.animation = { ...theWheel.animation, spins: randomSpins, duration: randomDuration, stopAngle: stopAt };
    theWheel.stopAnimation(false);
    theWheel.rotationAngle = 0;
    theWheel.startAnimation();
});

removeWinnerBtn.addEventListener('click', () => {
    if (!currentWinner) return;
    document.querySelectorAll('.option-row').forEach(row => {
        if (row.querySelector('.option-name-input').value.trim() === currentWinner.text.trim()) {
            row.remove();
        }
    });
    updateWheel();
    updatePercentages();
    modal.classList.remove('visible');
    currentWinner = null;
});

// --- 初始載入 ---
window.onload = function() {
    createOptionRow('加 1 分鐘', 1, '#2ecc71', undefined, 1, undefined);
    createOptionRow('減 30 秒', 1, '#e74c3c', undefined, undefined, -30);
    createOptionRow('加 5 分鐘', 1, '#3498db', undefined, 5, undefined);
    createOptionRow('神秘獎勵', 1, '#9b59b6');
    updateWheel();
    updatePercentages();
    updateDisplay();
};