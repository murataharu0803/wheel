const { ipcRenderer } = require('electron');

const spinButton = document.getElementById('spin_button');
// ★★★ 新增彈窗元素的獲取 ★★★
const modal = document.getElementById('modal');
const winnerText = document.getElementById('winner-text');
const closeModalBtn = document.getElementById('close-modal-btn');

let theWheel;
let spinning = false;
let parsedOptions = [];

ipcRenderer.on('wheel-updated', (event, optionsData) => {
    parsedOptions = optionsData;
    updateWheel(optionsData);
});

// (updateWheel 函數不變)

// ★★★ 更新：alertPrize 現在自己處理彈窗 ★★★
function alertPrize(indicatedSegment) {
    spinning = false;
    const currentWinner = parsedOptions.find(opt => opt.text === indicatedSegment.text);
    if (currentWinner) {
        // 1. 發送時間訊息給 main.js (不變)
        ipcRenderer.send('spin-result', { h: currentWinner.h, m: currentWinner.m, s: currentWinner.s });
        
        // 2. 在本視窗顯示彈窗和特效
        winnerText.textContent = currentWinner.text;
        modal.classList.add('visible');
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
}

// 關閉彈窗的事件監聽
closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
});

// (spinButton.addEventListener 函數不變)

// --- 附上未變更的函數 ---
function updateWheel(options) { /* ... */ }
spinButton.addEventListener('click', () => { /* ... */ });

function updateWheel(options) { if (options.length === 0) { if (theWheel) theWheel.clearCanvas(); return; } const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0); const segmentsForWheel = options.map(opt => ({ ...opt, 'size': (opt.weight / totalWeight) * 360 })); theWheel = new Winwheel({ 'numSegments': segmentsForWheel.length, 'outerRadius': 240, 'innerRadius': 70, 'textFontSize': 16, 'segments': segmentsForWheel, 'animation': { 'type': 'spinToStop', 'callbackFinished': alertPrize, 'soundTrigger': 'pin' }, 'pins': { 'number': segmentsForWheel.length * 2, 'fillStyle': 'silver', 'outerRadius': 4 } }); }
spinButton.addEventListener('click', () => { if (spinning || !theWheel || theWheel.numSegments === 0) return; spinning = true; const totalWeight = parsedOptions.reduce((sum, opt) => sum + opt.weight, 0); let randomWeight = Math.random() * totalWeight; let winningSegmentIndex = -1; for (let i = 0; i < parsedOptions.length; i++) { randomWeight -= parsedOptions[i].weight; if (randomWeight <= 0) { winningSegmentIndex = i; break; } } const winningSegment = theWheel.segments[winningSegmentIndex + 1]; const stopAt = Math.floor(Math.random() * (winningSegment.endAngle - winningSegment.startAngle)) + winningSegment.startAngle; const randomSpins = Math.floor(Math.random() * 8) + 8; const randomDuration = Math.floor(Math.random() * 5) + 7; theWheel.animation = { ...theWheel.animation, spins: randomSpins, duration: randomDuration, stopAt }; theWheel.stopAnimation(false); theWheel.rotationAngle = 0; theWheel.startAnimation(); });