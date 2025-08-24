// --- 元素獲取 ---
const optionsList = document.getElementById('options-list');
const addOptionBtn = document.getElementById('add-option-btn');
const updateWheelBtn = document.getElementById('update-wheel-btn');
const spinButton = document.getElementById('spin_button');
const modal = document.getElementById('modal');
const winnerText = document.getElementById('winner-text');
const closeModalBtn = document.getElementById('close-modal-btn');
const removeWinnerBtn = document.getElementById('remove-winner-btn');

let theWheel;
let spinning = false;
let currentWinner = null;
let parsedOptions = [];

// --- 輔助函數 ---
const getRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

// --- 更新所有選項的百分比顯示 ---
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
function createOptionRow(name = '', probability = 1, color = getRandomColor()) {
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

    row.append(nameInput, probInput, percentageSpan, colorInput, removeBtn);
    optionsList.append(row);
}

// --- 從介面讀取資料並更新轉盤 (已修正) ---
function updateWheel() {
    parsedOptions = [];
    const rows = document.querySelectorAll('.option-row');

    rows.forEach(row => {
        const name = row.querySelector('.option-name-input').value.trim();
        const probability = parseFloat(row.querySelector('.option-prob-input').value);
        const color = row.querySelector('.option-color-input').value;

        if (name) {
            parsedOptions.push({
                'text': name,
                'fillStyle': color,
                // 這裡儲存的仍然是原始的「權重」
                'weight': (!isNaN(probability) && probability > 0) ? probability : 1
            });
        }
    });

    if (parsedOptions.length === 0) {
        if (theWheel) theWheel.clearCanvas();
        return;
    }

    // ==================================================================
    //  ★★★ 關鍵修正：將權重換算為角度 (Degrees) ★★★
    // ==================================================================
    const totalWeight = parsedOptions.reduce((sum, opt) => sum + opt.weight, 0);

    const segmentsForWheel = parsedOptions.map(opt => {
        return {
            ...opt, // 複製原有屬性 (text, fillStyle)
            // Winwheel 需要的是 size 屬性，代表角度
            'size': (opt.weight / totalWeight) * 360
        };
    });

    // (Winwheel 的配置邏輯)
    theWheel = new Winwheel({
        'numSegments': segmentsForWheel.length,
        'outerRadius': 240, 'innerRadius': 70, 'textFontSize': 16,
        'segments': segmentsForWheel, // ★★★ 使用換算過角度的新陣列 ★★★
        'animation': { 'type': 'spinToStop', 'callbackFinished': alertPrize, 'soundTrigger': 'pin' },
        'pins': { 'number': segmentsForWheel.length * 2, 'fillStyle': 'silver', 'outerRadius': 4 }
    });

    try {
        let tickSound = new Audio('./tick.mp3');
        tickSound.preload = 'auto';
        const playSound = () => { tickSound.currentTime = 0; tickSound.play().catch(e => {}); };
        theWheel.animation.callbackSound = playSound;
    } catch (e) { console.warn("音效檔案 tick.mp3 載入失敗或不存在。"); }
}

// --- 以下是未變更的函數，為求完整性一併附上 ---
function alertPrize(indicatedSegment) {
    // 從 indicatedSegment 中我們只能拿到 text 和 fillStyle，
    // 所以需要從 parsedOptions 中找到完整的物件來取得原始權重
    currentWinner = parsedOptions.find(opt => opt.text === indicatedSegment.text);
    if(currentWinner) {
        winnerText.textContent = currentWinner.text;
    }
    modal.classList.add('visible');
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    spinning = false;
}

spinButton.addEventListener('click', () => {
    if (spinning || !theWheel || theWheel.numSegments === 0) return;
    spinning = true;
    
    // 抽獎邏輯基於原始權重 (parsedOptions)，這樣更準確
    const totalWeight = parsedOptions.reduce((sum, opt) => sum + opt.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    let winningSegmentIndex = -1;
    for (let i = 0; i < parsedOptions.length; i++) {
        randomWeight -= parsedOptions[i].weight;
        if (randomWeight <= 0) { winningSegmentIndex = i; break; }
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

addOptionBtn.addEventListener('click', () => {
    createOptionRow();
    updatePercentages();
});
updateWheelBtn.addEventListener('click', updateWheel);
closeModalBtn.addEventListener('click', () => modal.classList.remove('visible'));
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
    createOptionRow('頭獎', 1, '#FFD700');
    createOptionRow('二獎', 1, '#C0C0C0');
    createOptionRow('三獎', 1, '#CD7F32');
    createOptionRow('安慰獎', 1, '#A9A9A9');
    updateWheel();
    updatePercentages();
};