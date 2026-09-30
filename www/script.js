// Game state
let totalSpins = 3;
let currentSpin = 0;
let maxMinutes = 25;
let totalMinutes = 0;
let plusFiveBonus = 0;
let isSpinning = false;
let wheelRotation = 0;
let segments = [];
let holdProgress = 0;
let isHolding = false;
let holdInterval = null;
let minutesLocked = false;
let lockPermanent = false;
let spinButtonInitialized = false;
let spinButtonLocked = false;
let finalGambleMinutes = 0;
let gambleChoice = 'none';

// Visual themes. CSS handles the page (body[data-theme]); these settings drive the canvas wheel.
const themes = {
    candy: {
        font: 'Fredoka', weight: 600, fontSize: 27,
        palette: [['#ffc4dd', '#ff8fc0'], ['#ffe0c2', '#ffb98a'], ['#d3fbe6', '#8fe6bd'], ['#e4d6ff', '#b99cff'], ['#cdeaff', '#8ec9ff'], ['#fff5b8', '#ffe066']],
        special: ['#fff3a6', '#ffc233'], text: '#7a2b64', textStroke: '#ffffff', strokeWidth: 5, specialText: '#8a4a00',
        sep: '#ffffff', sepWidth: 3, rim: ['#ffffff', '#ffd0e8', '#ffffff'], rimInner: '#ffb3d9',
        bulbs: ['#ff4fa3'], glow: 'rgba(255,79,163,.95)', shadow: 'rgba(200,80,160,.45)', gloss: 0.5,
        confetti: ['#ff8fc0', '#ffe066', '#8fe6bd', '#b99cff', '#8ec9ff'],
        fx: 'sparkles'
    },
    galaxy: {
        font: 'Baloo 2', weight: 800, fontSize: 27,
        palette: [['#ff3da8', '#c2107a'], ['#8f5bff', '#4a1fc4'], ['#19d3ff', '#0a78d6'], ['#ff9a3d', '#e0561b'], ['#2ee6a6', '#0a9a78'], ['#ff5d6c', '#c01f4a']],
        special: ['#fff27a', '#ffb400'], text: '#ffffff', textStroke: 'rgba(25,0,70,.6)', strokeWidth: 5, specialText: '#4a2600',
        sep: '#150a38', sepWidth: 3.5, rim: ['#2f1a7e', '#0d0522', '#3f2599'], rimInner: '#0b0420',
        bulbs: ['#19d3ff', '#ff3da8'], glow: 'rgba(120,200,255,1)', shadow: 'rgba(150,80,255,.75)', gloss: 0.16,
        confetti: ['#ff3da8', '#19d3ff', '#ffe14d', '#8f5bff', '#2ee6a6'],
        fx: 'stars'
    },
    glam: {
        font: 'Poppins', weight: 600, fontSize: 24,
        palette: [['#ffb199', '#ff7e88'], ['#ffd58a', '#ffab5e'], ['#f7a8d8', '#d96bb8'], ['#c9b3ff', '#8d78f0'], ['#9fe3e0', '#4fc1c8'], ['#ffc6d9', '#ff8fb0']],
        special: ['#fff0b8', '#f2bd45'], text: '#ffffff', textStroke: 'rgba(120,40,80,.55)', strokeWidth: 4.5, specialText: '#7a4210',
        sep: 'rgba(255,255,255,.9)', sepWidth: 2.5, rim: ['#fbe3d3', '#e8b4a0', '#fff3e8', '#d9998a', '#fbe3d3'], rimInner: '#c98a7c',
        bulbs: ['#ffffff'], glow: 'rgba(255,255,255,1)', shadow: 'rgba(180,90,120,.45)', gloss: 0.42,
        confetti: ['#ff7e88', '#ffd58a', '#f7a8d8', '#c9b3ff', '#9fe3e0'],
        fx: 'blobs'
    },
    classic: {
        font: 'Arial', weight: 700, fontSize: 28,
        palette: [['#E74C3C', '#E74C3C'], ['#2ECC71', '#2ECC71'], ['#3498DB', '#3498DB'], ['#9B59B6', '#9B59B6'], ['#F39C12', '#F39C12']],
        special: null, text: '#FFF8DC', textStroke: '#8B4513', strokeWidth: 4, specialText: '#FFF8DC',
        sep: '#1a3a52', sepWidth: 4, rim: ['#1a3a52', '#1a3a52'], rimInner: '#0a1929',
        bulbs: ['#FFD700'], glow: 'rgba(255,215,0,.8)', shadow: 'rgba(0,0,0,.35)', gloss: 0,
        confetti: ['#E74C3C', '#2ECC71', '#3498DB', '#F39C12', '#9B59B6'],
        fx: null
    }
};
const DEFAULT_THEME = 'candy';
let currentTheme = DEFAULT_THEME;
let winIndex = -1;
let confettiParticles = [];
let canvasSize = 400;

function applyTheme(key) {
    if (!themes[key]) key = DEFAULT_THEME;
    currentTheme = key;
    document.body.dataset.theme = key;
    buildThemeFx(themes[key].fx);
    if (isWheelVisible()) drawWheel();
}

function buildThemeFx(kind) {
    const fx = document.getElementById('themeFx');
    fx.innerHTML = '';
    if (!kind || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rnd = (min, max) => min + Math.random() * (max - min);
    if (kind === 'sparkles') {
        const symbols = ['✦', '♥', '✿', '✧', '★'];
        for (let i = 0; i < 22; i++) {
            const el = document.createElement('span');
            el.className = 'fx-spark';
            el.textContent = symbols[i % symbols.length];
            el.style.left = rnd(0, 97) + '%';
            el.style.top = rnd(30, 100) + '%';
            el.style.fontSize = rnd(12, 28) + 'px';
            el.style.animationDuration = rnd(8, 16) + 's';
            el.style.animationDelay = -rnd(0, 14) + 's';
            fx.appendChild(el);
        }
    } else if (kind === 'stars') {
        for (let i = 0; i < 110; i++) {
            const el = document.createElement('i');
            el.className = 'fx-star';
            const size = Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1;
            el.style.width = el.style.height = size + 'px';
            el.style.left = rnd(0, 100) + '%';
            el.style.top = rnd(0, 100) + '%';
            el.style.animationDuration = rnd(2, 5) + 's';
            el.style.animationDelay = -rnd(0, 4) + 's';
            fx.appendChild(el);
        }
    } else if (kind === 'blobs') {
        [['#ffb9c9', 34, 8, 0], ['#c8b6ff', 30, 70, 30], ['#a8f0dc', 34, 5, 62], ['#ffe2a8', 24, 75, 5]].forEach(([color, size, x, y], i) => {
            const el = document.createElement('div');
            el.className = 'fx-blob';
            el.style.cssText = `background:${color};width:${size}vmax;height:${size}vmax;left:${x}%;top:${y}%;animation-delay:${-i * 3}s`;
            fx.appendChild(el);
        });
    }
}

function isWheelVisible() {
    return document.getElementById('wheelScreen').style.display === 'block';
}

function startGame() {
    // Get settings
    totalSpins = parseInt(document.getElementById('numSpins').value);
    maxMinutes = parseInt(document.getElementById('maxMinutes').value);
    localStorage.setItem('numSpins', totalSpins);
    localStorage.setItem('maxMinutes', maxMinutes);
    const bgValue = document.getElementById('backgroundSelect').value;
    localStorage.setItem('theme', bgValue);
    currentSpin = 0;
    totalMinutes = 0;
    plusFiveBonus = 0;
    winIndex = -1;
    confettiParticles = [];
    minutesLocked = false;
    lockPermanent = false;
    gambleChoice = 'none';
    unlockSpinButton();

    // Generate wheel segments
    generateSegments();

    // Switch screens
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('gambleScreen').style.display = 'none';
    document.getElementById('gambleResultScreen').style.display = 'none';
    document.getElementById('wheelScreen').style.display = 'block';

    // Update displays
    updateSpinCounter();
    updateMinutesDisplay();

    // Initialize and draw wheel
    initializeCanvas();
    drawWheel();

    // Setup spin button events
    setupSpinButton();
}

function generateSegments() {
    segments = [];

    let hasMax = false;

    // Add 14 random minute values in increments of 5
    for (let i = 0; i < 14; i++) {
        const minValue = Math.ceil(5 / 5) * 5;
        const maxValue = Math.floor(maxMinutes / 5) * 5;
        const possibleValues = [];

        for (let val = minValue; val <= maxValue; val += 5) {
            possibleValues.push(val);
        }

        const randomValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
        if (randomValue === maxValue) {
            hasMax = true;
        }
        segments.push({
            value: randomValue,
            type: 'minutes'
        });
    }

    if (!hasMax) {
        segments[0].value = Math.floor(maxMinutes / 5) * 5;
    }

    // Add special segments
    segments.push({ value: '↻', type: 'tryAgain' });
    segments.push({ value: '+5', type: 'bonus' });

    // Shuffle segments
    segments.sort(() => Math.random() - 0.5);
}

function initializeCanvas() {
    const canvas = document.getElementById('wheelCanvas');
    const container = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Logical size matches the container; the backing store is scaled for sharp rendering
    canvasSize = Math.min(400, container.offsetWidth);
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
}

function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const theme = themes[currentTheme];
    const size = canvasSize;
    if (size <= 0 || segments.length === 0) return;
    const dpr = canvas.width / size;
    const centerX = size / 2;
    const centerY = size / 2;
    const rimWidth = size * 0.055;
    const radius = size / 2 - rimWidth - 10;
    const anglePerSegment = (Math.PI * 2) / segments.length;
    const now = performance.now() / 1000;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Rim (the drop shadow is a CSS filter on the canvas so it is not clipped)
    const rimGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    theme.rim.forEach((color, i) => rimGradient.addColorStop(i / (theme.rim.length - 1), color));
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + rimWidth, 0, Math.PI * 2);
    ctx.fillStyle = rimGradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = theme.rimInner;
    ctx.fill();

    // Segments
    segments.forEach((segment, index) => {
        const startAngle = index * anglePerSegment + wheelRotation;
        const endAngle = startAngle + anglePerSegment;
        const isSpecial = segment.type !== 'minutes' && theme.special;
        const pair = isSpecial ? theme.special : theme.palette[index % theme.palette.length];

        const fill = ctx.createRadialGradient(centerX, centerY, radius * 0.15, centerX, centerY, radius);
        fill.addColorStop(0, pair[0]);
        fill.addColorStop(1, pair[1]);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = theme.sep;
        ctx.lineWidth = theme.sepWidth;
        ctx.stroke();
    });

    // Glossy highlight
    if (theme.gloss > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        const gloss = ctx.createLinearGradient(0, centerY - radius, 0, centerY);
        gloss.addColorStop(0, `rgba(255,255,255,${theme.gloss})`);
        gloss.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gloss;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - radius * 0.5, radius * 0.86, radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,.14)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Labels
    const fontSize = theme.fontSize * (size / 320);
    segments.forEach((segment, index) => {
        const isSpecial = segment.type !== 'minutes' && theme.special;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(index * anglePerSegment + wheelRotation + anglePerSegment / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.font = `${theme.weight} ${fontSize + (isSpecial ? 2 : 0)}px "${theme.font}", Arial, sans-serif`;
        const text = segment.value.toString();
        ctx.strokeStyle = isSpecial ? 'rgba(255,255,255,.9)' : theme.textStroke;
        ctx.lineWidth = theme.strokeWidth;
        ctx.strokeText(text, radius * 0.72, 1);
        ctx.fillStyle = isSpecial ? theme.specialText : theme.text;
        ctx.fillText(text, radius * 0.72, 1);
        ctx.restore();
    });

    // Pulse the winning segment once the wheel has stopped
    if (winIndex >= 0 && !isSpinning) {
        const startAngle = winIndex * anglePerSegment + wheelRotation;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + anglePerSegment);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${0.12 + 0.18 * (0.5 + 0.5 * Math.sin(now * 7))})`;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    // Rim lights: chase while spinning, twinkle when idle
    const bulbCount = 22;
    const bulbRadius = radius + rimWidth * 0.62;
    for (let i = 0; i < bulbCount; i++) {
        const angle = (i / bulbCount) * Math.PI * 2;
        const lit = isSpinning ? (i + Math.floor(now * 12)) % 2 === 0 : true;
        const alpha = isSpinning ? (lit ? 1 : 0.25) : 0.65 + 0.35 * Math.sin(now * 2.4 + i * 0.7);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = lit ? 10 : 0;
        ctx.beginPath();
        ctx.arc(centerX + Math.cos(angle) * bulbRadius, centerY + Math.sin(angle) * bulbRadius, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = theme.bulbs[i % theme.bulbs.length];
        ctx.fill();
        ctx.restore();
    }

    // Confetti
    confettiParticles = confettiParticles.filter(p => p.life > 0);
    confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.99;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
    });

    updatePointerTilt(anglePerSegment);
}

function updatePointerTilt(anglePerSegment) {
    const pointer = document.getElementById('pointer');
    if (!pointer) return;
    let tilt = 0;
    if (isSpinning) {
        const position = (((3 * Math.PI / 2 - wheelRotation) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / anglePerSegment;
        tilt = -28 * Math.max(0, ((position % 1) - 0.62) / 0.38);
    }
    pointer.style.setProperty('--tilt', tilt + 'deg');
}

function burstConfetti() {
    const colors = themes[currentTheme].confetti;
    for (let i = 0; i < 70; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        const speed = 3 + Math.random() * 6;
        confettiParticles.push({
            x: canvasSize / 2, y: canvasSize / 2,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
            rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
            w: 5 + Math.random() * 6, h: 3 + Math.random() * 4,
            color: colors[i % colors.length], life: 90 + Math.random() * 60
        });
    }
}

// Keeps rim lights and the winner pulse animating while the wheel is idle
function idleLoop() {
    if (isWheelVisible() && !isSpinning) drawWheel();
    requestAnimationFrame(idleLoop);
}

function setupSpinButton() {
    if (spinButtonInitialized) return;
    spinButtonInitialized = true;

    const spinButton = document.getElementById('spinButton');

    // Mouse events
    spinButton.addEventListener('mousedown', startHold);
    spinButton.addEventListener('mouseup', endHold);
    spinButton.addEventListener('mouseleave', endHold);

    // Touch events
    spinButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHold();
    });
    spinButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        endHold();
    });
}

function lockSpinButton() {
    spinButtonLocked = true;
    const btn = document.getElementById('spinButton');
    if (btn) btn.classList.add('locked');
}

function unlockSpinButton() {
    spinButtonLocked = false;
    const btn = document.getElementById('spinButton');
    if (btn) btn.classList.remove('locked');
}

function startHold() {
    if (isSpinning || spinButtonLocked) return;

    isHolding = true;
    holdProgress = 0;
    document.getElementById('progressBar').style.opacity = '1';

    holdInterval = setInterval(() => {
        holdProgress += 2;
        document.getElementById('progressFill').style.width = holdProgress + '%';

        if (holdProgress >= 100) {
            endHold();
        }
    }, 20);
}

function endHold() {
    if (!isHolding || isSpinning) return;

    isHolding = false;
    clearInterval(holdInterval);
    document.getElementById('progressBar').style.opacity = '0';
    document.getElementById('progressFill').style.width = '0%';

    if (holdProgress > 10) {
        spin(holdProgress / 100);
    }
}

function spin(power) {
    if (isSpinning || spinButtonLocked) return;

    if (currentSpin >= totalSpins - 1) {
        lockSpinButton();
    }

    if (minutesLocked) {
        lockPermanent = true;
        updateMinutesDisplay();
    }

    isSpinning = true;
    winIndex = -1;
    const spinDuration = 3000 + (power * 2000);
    const spinRotations = 5 + (power * 5);
    const totalRotation = spinRotations * Math.PI * 2 + Math.random() * Math.PI * 2;

    const startTime = Date.now();
    const startRotation = wheelRotation;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);

        // Easing function for deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);

        wheelRotation = startRotation + totalRotation * easeOut;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spin complete
            isSpinning = false;
            checkResult();
        }
    }

    animate();
}

function checkResult() {
    // Calculate which segment the top pointer is pointing to
    const normalizedRotation = wheelRotation % (Math.PI * 2);
    const anglePerSegment = (Math.PI * 2) / segments.length;

    // The pointer is at the top (12 o'clock position)
    let pointerAngle = (3 * Math.PI / 2) - normalizedRotation;
    while (pointerAngle < 0) pointerAngle += Math.PI * 2;
    pointerAngle = pointerAngle % (Math.PI * 2);

    const winningIndex = Math.floor(pointerAngle / anglePerSegment);
    const result = segments[winningIndex];
    winIndex = winningIndex;
    burstConfetti();

    // Handle result based on type
    if (result.type === 'tryAgain') {
        // "↻" - award an extra spin without advancing the counter
        totalSpins++;
        setTimeout(() => {
            showAnimatedMessage("You won extra spin!");
        }, 500);
        updateSpinCounter();
    } else if (result.type === 'bonus') {
        // "+5" - add to bonus-counter if not locked
        if (!minutesLocked) {
            plusFiveBonus += 5;
            updateMinutesDisplay();
            setTimeout(() => {
                showAnimatedMessage("Extra 5 minutes added!", true);
            }, 500);
        }
    } else {
        // Regular number - this is the new total (not cumulative)
        if (!minutesLocked) {
            totalMinutes = result.value;
        }
        currentSpin++;
        updateMinutesDisplay();
        updateSpinCounter();

        if (currentSpin >= totalSpins) {
            setTimeout(showGambleScreen, 1000);
        }
    }

    if (currentSpin < totalSpins) {
        unlockSpinButton();
    }
}

function showAnimatedMessage(text, isBonus = false) {
    const messageEl = document.getElementById('animatedMessage');
    const messageTextEl = document.getElementById('messageText');

    // Set the message text
    messageTextEl.textContent = text;

    // Remove any existing classes
    messageEl.classList.remove('show', 'bonus');

    // Add appropriate classes
    if (isBonus) {
        messageEl.classList.add('bonus');
    }

    // Trigger reflow to restart animation
    void messageEl.offsetWidth;

    // Show the message
    messageEl.classList.add('show');

    // Remove the show class after animation completes
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 2500);
}

function updateSpinCounter() {
    document.getElementById('spinCounter').textContent =
        `Spin ${Math.min(currentSpin + 1, totalSpins)} of ${totalSpins}`;

    // Finishing early only makes sense once at least one spin has been played
    const finishBtn = document.querySelector('.end-game-button');
    if (finishBtn) {
        finishBtn.disabled = currentSpin === 0;
        finishBtn.title = currentSpin === 0 ? 'Spin the wheel first' : '';
    }
}

function updateMinutesDisplay() {
    let displayText = `${totalMinutes} Minutes`;

    if (minutesLocked) {
        displayText += ' \uD83D\uDD12';
    }

    if (plusFiveBonus > 0) {
        displayText += ` (+${plusFiveBonus})`;
    }

    const minutesEl = document.getElementById('minutesDisplay');
    minutesEl.textContent = displayText;
    updateLockTooltip();
}

function updateLockTooltip() {
    const minutesEl = document.getElementById('minutesDisplay');
    let tooltip;

    if (!minutesLocked) {
        tooltip = 'Tap to lock';
    } else if (!lockPermanent) {
        tooltip = 'Tap to unlock';
    } else {
        tooltip = 'Score locked';
    }
    minutesEl.setAttribute('data-tooltip', tooltip);
}

function toggleLock() {
    if (isSpinning) return;

    if (!minutesLocked) {
        minutesLocked = true;
        lockPermanent = false;
    } else if (!lockPermanent) {
        minutesLocked = false;
    }

    updateMinutesDisplay();
}

function endGameEarly() {
    // Only allow ending early if we have at least completed one spin
    if (!isSpinning && currentSpin > 0) {
        showGambleScreen();
    }
}

function showGambleScreen() {
    const totalCurrent = totalMinutes + plusFiveBonus;
    document.getElementById('wheelScreen').style.display = 'none';
    document.getElementById('gambleScreen').style.display = 'block';

    let extraTime = Math.round((totalCurrent * 0.5) / 5) * 5;
    const gambleWinLabel = document.getElementById('gambleWinLabel');
    if (gambleWinLabel) {
        gambleWinLabel.textContent = `+${extraTime} min`;
    }

    // Check if the element exists in case the original header text still exists
    const gamblePotentialScoreElement = document.getElementById('gamblePotentialScore');
    if (gamblePotentialScoreElement) {
        gamblePotentialScoreElement.textContent = totalCurrent;
    }

    document.getElementById('keepTotalMinutes').textContent = totalCurrent;
}

function handleGamble() {
    gambleChoice = 'gamble';
    const gambleBtn = document.querySelector('.gamble-action-button');
    gambleBtn.disabled = true;
    gambleBtn.textContent = '🎲 GAMBLING...';

    setTimeout(() => {
        const win = Math.random() > 0.5;
        let finalMinutes = totalMinutes + plusFiveBonus;

        document.getElementById('gambleScreen').style.display = 'none';
        document.getElementById('gambleResultScreen').style.display = 'block';

        if (win) {
            let extraTime = Math.round((finalMinutes * 0.5) / 5) * 5;
            finalMinutes = finalMinutes + extraTime;

            document.getElementById('gambleWinAmount').textContent = `+${extraTime} min`;
            document.getElementById('gambleWinPanel').style.display = 'block';
            document.getElementById('gambleLosePanel').style.display = 'none';
        } else {
            finalMinutes = 10;

            document.getElementById('gambleWinPanel').style.display = 'none';
            document.getElementById('gambleLosePanel').style.display = 'block';
        }

        finalGambleMinutes = finalMinutes;

    }, 1200);
}

function handleSafeGamble() {
    gambleChoice = 'safe';
    let finalMinutes = totalMinutes + plusFiveBonus;
    finalGambleMinutes = finalMinutes;

    document.getElementById('gambleScreen').style.display = 'none';
    document.getElementById('gambleResultScreen').style.display = 'block';

    document.getElementById('gambleWinPanel').style.display = 'none';
    document.getElementById('gambleLosePanel').style.display = 'none';

    document.getElementById('safePanelMinutes').textContent = finalMinutes;
    document.getElementById('gambleSafePanel').style.display = 'block';
}

function continueFromGamble() {
    document.getElementById('gambleResultScreen').style.display = 'none';
    showEndScreen(finalGambleMinutes);
}

function showEndScreen(forcedMinutes = null) {
    const finalMinutes = forcedMinutes !== null ? forcedMinutes : (totalMinutes + plusFiveBonus);

    // Calculate Breakdown
    const regularMinutes = totalMinutes;
    const plusFives = plusFiveBonus;
    const luckyMinutes = finalMinutes - (regularMinutes + plusFives);

    document.getElementById('wheelScreen').style.display = 'none';
    document.getElementById('gambleScreen').style.display = 'none';
    document.getElementById('gambleResultScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'block';

    // Update summary values
    document.getElementById('summaryRegular').textContent = regularMinutes;
    document.getElementById('summaryPlusFives').textContent = plusFives;

    const summaryLuckyEl = document.getElementById('summaryLucky');
    const summaryLuckyLabelEl = document.getElementById('summaryLuckyLabel');

    if (gambleChoice === 'safe') {
        summaryLuckyLabelEl.textContent = 'Safe Choice:';
        summaryLuckyEl.textContent = '🥳';
        summaryLuckyEl.classList.remove('unlucky');
        summaryLuckyEl.style.color = '#2980b9'; // Optional: Use safe color
    } else {
        summaryLuckyEl.textContent = luckyMinutes;
        // Reset color if set
        summaryLuckyEl.style.color = '';

        if (luckyMinutes < 0) {
            summaryLuckyLabelEl.textContent = 'Unlucky Minutes:';
            summaryLuckyEl.classList.add('unlucky');
        } else {
            summaryLuckyLabelEl.textContent = 'Lucky Minutes:';
            summaryLuckyEl.classList.remove('unlucky');
        }
    }

    document.getElementById('summaryTotal').textContent = finalMinutes;

    // Optional: Only show lucky minutes if user gambled
    const luckyItem = document.getElementById('luckyMinutesItem');
    if (luckyItem) {
        if (forcedMinutes !== null) {
            luckyItem.style.display = 'flex';
        } else {
            luckyItem.style.display = 'none';
        }
    }

}

function resetGame() {
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('gambleScreen').style.display = 'none';
    document.getElementById('gambleResultScreen').style.display = 'none';
    document.getElementById('gambleWinPanel').style.display = 'none';
    document.getElementById('gambleLosePanel').style.display = 'none';
    document.getElementById('gambleSafePanel').style.display = 'none';
    document.getElementById('setupScreen').style.display = 'block';

    // Clear summary values to prevent stale data on next End Screen
    document.getElementById('summaryRegular').textContent = '0';
    document.getElementById('summaryPlusFives').textContent = '0';

    const summaryLuckyEl = document.getElementById('summaryLucky');
    summaryLuckyEl.textContent = '0';
    summaryLuckyEl.style.color = '';
    summaryLuckyEl.classList.remove('unlucky');
    document.getElementById('summaryLuckyLabel').textContent = 'Lucky Minutes:';

    document.getElementById('summaryTotal').textContent = '0';

    // Reset gamble button for next time
    const gambleBtn = document.querySelector('.gamble-action-button');
    if (gambleBtn) {
        gambleBtn.disabled = false;
        gambleBtn.textContent = 'TRY YOUR LUCK!';
    }

    wheelRotation = 0;
    minutesLocked = false;
    lockPermanent = false;
    unlockSpinButton();
}

function loadSavedOptions() {
    const numSpinsEl = document.getElementById('numSpins');
    const maxMinutesEl = document.getElementById('maxMinutes');
    const bgEl = document.getElementById('backgroundSelect');

    const savedNum = localStorage.getItem('numSpins');
    const savedMax = localStorage.getItem('maxMinutes');
    const savedBg = localStorage.getItem('theme');

    if (savedNum) numSpinsEl.value = savedNum;
    if (savedMax) maxMinutesEl.value = savedMax;
    if (savedBg && themes[savedBg]) {
        bgEl.value = savedBg;
    }
    applyTheme(bgEl.value);

    numSpinsEl.addEventListener('change', () => {
        localStorage.setItem('numSpins', numSpinsEl.value);
    });

    maxMinutesEl.addEventListener('change', () => {
        localStorage.setItem('maxMinutes', maxMinutesEl.value);
    });

    bgEl.addEventListener('change', () => {
        localStorage.setItem('theme', bgEl.value);
        applyTheme(bgEl.value);
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    if (document.getElementById('wheelScreen').style.display !== 'none') {
        initializeCanvas();
        drawWheel();
    }
});

// Initialize on load
window.addEventListener('load', () => {
    loadSavedOptions();
    idleLoop();
});