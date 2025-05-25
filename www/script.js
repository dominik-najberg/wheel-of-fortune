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

// Colors matching the reference image
const colors = [
    '#E74C3C', '#2ECC71', '#3498DB', '#9B59B6',
    '#F39C12', '#E74C3C', '#2ECC71', '#3498DB',
    '#9B59B6', '#F39C12', '#E74C3C', '#2ECC71',
    '#3498DB', '#9B59B6', '#F39C12', '#E74C3C'
];

// Available background styles
const backgrounds = {
    default: {
        background: 'linear-gradient(135deg, #1a3a52 0%, #0d1f2d 100%)'
    },
    rainbow: {
        background: 'linear-gradient(135deg, #FF0000 0%, #FF7F00 14%, #FFFF00 28%, #00FF00 42%, #0000FF 57%, #4B0082 71%, #9400D3 100%)'
    },
    sunset: {
        background: 'linear-gradient(to bottom, #FF2F8A 0%, #FFA500 40%, #FFD700 60%, #0099FF 100%)'
    },
    cotton: {
        background: 'linear-gradient(135deg, #FF95D6 0%, #7FDBFF 50%, #FFC371 100%)'
    },
    forest: {
        background: 'linear-gradient(135deg, #00A86B 0%, #2ECC71 50%, #006400 100%)'
    },
    underwater: {
        background: 'linear-gradient(to bottom, #00CED1 0%, #1E90FF 50%, #0077BE 100%)'
    },
    animated: {
        background: 'linear-gradient(-45deg, #FFD700, #FF1493, #5BC0EB, #00BFA6)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 10s ease infinite'
    },
    bubblegum: {
        background: 'radial-gradient(ellipse at top left, #FF8AD6 0%, #FF55A3 50%, #8BD3FF 100%)'
    }
};

function applyBackground(key) {
    const body = document.body;
    const bg = backgrounds[key];
    if (!bg) return;
    body.style.background = bg.background;
    body.style.backgroundSize = bg.backgroundSize || '';
    body.style.animation = bg.animation || '';
}

function startGame() {
    // Get settings
    totalSpins = parseInt(document.getElementById('numSpins').value);
    maxMinutes = parseInt(document.getElementById('maxMinutes').value);
    localStorage.setItem('numSpins', totalSpins);
    localStorage.setItem('maxMinutes', maxMinutes);
    const bgValue = document.getElementById('backgroundSelect').value;
    localStorage.setItem('background', bgValue);
    currentSpin = 0;
    totalMinutes = 0;
    plusFiveBonus = 0;
    minutesLocked = false;
    lockPermanent = false;
    unlockSpinButton();

    // Generate wheel segments
    generateSegments();

    // Switch screens
    document.getElementById('setupScreen').style.display = 'none';
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

    // Set canvas size to match container
    const size= Math.min(400, container.offsetWidth);
    canvas.width = size;
    canvas.height = size;
}

function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dark background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
    ctx.fillStyle = '#1a3a52';
    ctx.fill();

    // Draw segments
    const anglePerSegment = (Math.PI * 2) / segments.length;

    segments.forEach((segment, index) => {
        const startAngle = index * anglePerSegment + wheelRotation;
        const endAngle = (index + 1) * anglePerSegment + wheelRotation;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        // Draw segment border
        ctx.strokeStyle = '#1a3a52';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSegment / 2);

        // Text styling - responsive font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF8DC';
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;

        // Responsive font size based on canvas size
        const fontSize = Math.max(20, Math.min(32, canvas.width / 12));
        ctx.font = `bold ${fontSize}px Arial`;

        // Position text at 75% of radius
        const textRadius = radius * 0.75;
        const text = segment.value.toString();

        // Draw text outline first
        ctx.strokeText(text, textRadius, 0);
        // Then fill
        ctx.fillText(text, textRadius, 0);

        ctx.restore();
    });

    // Draw outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#0a1929';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw decorative dots around the edge
    const dotCount = 24;
    for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2 + wheelRotation;
        const dotX = centerX + Math.cos(angle) * (radius + 12);
        const dotY = centerY + Math.sin(angle) * (radius + 12);

        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
    }
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
            setTimeout(showEndScreen, 1000);
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
    if (!isSpinning) {
        showEndScreen();
    }
}

function showEndScreen() {
    const finalMinutes = totalMinutes + plusFiveBonus;
    document.getElementById('wheelScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'block';
    document.getElementById('winMessage').textContent =
        `You won ${finalMinutes} minutes!`;
}

function resetGame() {
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('setupScreen').style.display = 'block';
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
    const savedBg = localStorage.getItem('background');

    if (savedNum) numSpinsEl.value = savedNum;
    if (savedMax) maxMinutesEl.value = savedMax;
    if (savedBg) {
        bgEl.value = savedBg;
        applyBackground(savedBg);
    }

    numSpinsEl.addEventListener('change', () => {
        localStorage.setItem('numSpins', numSpinsEl.value);
    });

    maxMinutesEl.addEventListener('change', () => {
        localStorage.setItem('maxMinutes', maxMinutesEl.value);
    });

    bgEl.addEventListener('change', () => {
        localStorage.setItem('background', bgEl.value);
        applyBackground(bgEl.value);
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
});