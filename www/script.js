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
let spinHistory = [];
let countedSpinIndex = -1;

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

// Themes: each one restyles the whole game (wheel drawing, pointer, decorations, confetti).
// "classic" keeps the original look and uses the Background dropdown.
const themes = {
    classic: null,
    candy: {
        font: '"Fredoka"', weight: 700,
        slices: ['#FF6FA8', '#FF9A3D', '#2FC495', '#9B7BFF', '#3FAEF5', '#FFB81F'],
        text: '#FFFFFF', stroke: '#9E2C66', strokeW: 0.026,
        special: '#FFFFFF', specialText: '#E8307A',
        divider: 'rgba(255,255,255,0.95)', dividerW: 0.012,
        rim: ['#FFFFFF', '#FFE3F0'], rimEdge: '#FF9CC4',
        bulbOn: '#FFF6B0', bulbGlow: 'rgba(255, 190, 40, 1)', bulbOff: '#FFB0D0',
        shadow: 'rgba(194, 69, 127, 0.45)', gloss: 0.34,
        confetti: { colors: ['#FF8FB8', '#FFCB3D', '#5FD3AF', '#B196FF', '#62C2FF', '#FFFFFF'], shapes: ['circle', 'heart', 'rect'] },
        extras: 'bubbles',
        pointer: '<svg viewBox="0 0 44 52" aria-hidden="true"><path d="M22 50C10 36 4 28 4 18a18 18 0 0 1 36 0c0 10-6 18-18 32Z" fill="#FF5FA2" stroke="#fff" stroke-width="3"/><path d="M22 27C14 21 12 18 12 15a5.2 5.2 0 0 1 10-2 5.2 5.2 0 0 1 10 2c0 3-2 6-10 12Z" fill="#fff"/></svg>'
    },
    galaxy: {
        font: '"Baloo 2"', weight: 800,
        slices: ['#7B2FF7', '#F72585', '#1FB6E8', '#3A0CA3', '#FF9E00', '#B5179E'],
        text: '#FFFFFF', stroke: 'rgba(22, 8, 60, 0.85)', strokeW: 0.02, glow: 'rgba(255,255,255,0.9)',
        special: '#FFE9A8', specialText: '#3A0CA3',
        divider: '#FFD86B', dividerW: 0.008,
        rim: ['#2A1B66', '#140C3A'], rimEdge: '#FFD86B',
        bulbOn: '#FFF3C4', bulbGlow: 'rgba(255, 200, 60, 1)', bulbOff: '#6B5A2A',
        shadow: 'rgba(255, 216, 107, 0.35)', gloss: 0.16,
        confetti: { colors: ['#FFD86B', '#FFFFFF', '#F72585', '#4CC9F0', '#B06CFF'], shapes: ['star', 'star', 'circle'] },
        extras: 'stars',
        pointer: '<svg viewBox="0 0 44 54" aria-hidden="true"><path d="M13 22h18l-9 30Z" fill="#FFD86B" stroke="#2A1B66" stroke-width="2.5" stroke-linejoin="round"/><path d="M22 2l4.7 11.5L39 14l-9.5 7.8L32.8 34 22 27l-10.8 7 3.3-12.2L5 14l12.3-.5Z" fill="#FFF0B8" stroke="#2A1B66" stroke-width="2.5" stroke-linejoin="round"/></svg>'
    },
    holo: {
        font: '"Righteous"', weight: 400,
        slices: [['#FF6FC4', '#A77BFF'], ['#4FD2F5', '#5EE6B0'], ['#FFC24D', '#FF7FA8'], ['#9A7BFF', '#5AAEFF']],
        text: '#FFFFFF', stroke: '#4A1FA8', strokeW: 0.026,
        special: '#FFFFFF', specialText: '#6B2FD6',
        divider: 'rgba(255,255,255,0.95)', dividerW: 0.014,
        rim: ['#FFFFFF', '#C9C1E6', '#F4EEFF', '#A89FCC', '#FFFFFF', '#C3D6EC'], rimEdge: '#A58FE6',
        bulbOn: '#FFFFFF', bulbGlow: 'rgba(255, 110, 210, 1)', bulbOff: '#B3A6D9',
        shadow: 'rgba(120, 80, 220, 0.4)', gloss: 0.38,
        confetti: { colors: ['#FFFFFF', '#FF9FD8', '#8EE6FF', '#C39BFF', '#FFD98A'], shapes: ['sparkle', 'sparkle', 'circle'] },
        extras: 'sparkles',
        pointer: '<svg viewBox="0 0 44 52" aria-hidden="true"><defs><linearGradient id="gemG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE3F7"/><stop offset=".5" stop-color="#C9B8FF"/><stop offset="1" stop-color="#A6ECFF"/></linearGradient></defs><path d="M6 14 14 4h16l8 10-16 36Z" fill="url(#gemG)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M6 14h32M14 4l4 10 4 36 4-36 4-10" fill="none" stroke="#fff" stroke-width="1.5" opacity=".9"/></svg>'
    },
    cat: {
        font: '"Fredoka"', weight: 700,
        slices: ['#FF9F43', '#2EC4B6', '#FF6B6B', '#FFC93C', '#1E9BD7', '#F47FB0'],
        text: '#FFFFFF', stroke: '#23405A', strokeW: 0.022,
        special: '#FFFFFF', specialText: '#E07A1F',
        divider: '#FFFFFF', dividerW: 0.012,
        rim: ['#FFB060', '#F08A26'], rimEdge: '#FFFFFF', stripes: '#C9660F',
        bulbOn: '#FFFBE0', bulbGlow: 'rgba(255, 240, 150, 1)', bulbOff: '#FFD9AE',
        shadow: 'rgba(8, 70, 64, 0.55)', gloss: 0.24,
        confetti: { colors: ['#FF9F43', '#FFFFFF', '#FFC93C', '#FF6B6B', '#F47FB0'], shapes: ['paw', 'circle', 'rect'] },
        extras: 'none',
        pointer: '<svg viewBox="0 0 48 58" aria-hidden="true"><path d="M17 36h14l-7 20Z" fill="#FF9F43" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M9 5l12 7-10 9Z M39 5l-12 7 10 9Z" fill="#FF9F43" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M12 10l5 3-4 4Z M36 10l-5 3 4 4Z" fill="#FFB3C4"/><circle cx="24" cy="25" r="14.5" fill="#FF9F43" stroke="#fff" stroke-width="3"/><path d="M24 12v5M19.5 13l1.2 4M28.5 13l-1.2 4" stroke="#D9731A" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="25" r="2.2" fill="#2B2B2B"/><circle cx="29" cy="25" r="2.2" fill="#2B2B2B"/><path d="M22.4 29h3.2L24 31Z" fill="#FF6B8A"/><path d="M13 29l-5-1M13 31.5l-5 1M35 29l5-1M35 31.5l5 1" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>'
    }
};

let currentTheme = 'classic';
let wheelSize = 0;
let winnerIndex = -1;
let flashStart = 0;
let pointerKick = 0;
let lastPointerIndex = -1;
let idleTimer = null;
let confettiPieces = [];
let confettiRunning = false;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyBackground(key) {
    const body = document.body;
    const bg = backgrounds[key];
    if (!bg) return;
    body.style.background = bg.background;
    body.style.backgroundSize = bg.backgroundSize || '';
    body.style.animation = bg.animation || '';
}

function applyTheme(key) {
    if (!(key in themes)) key = 'classic';
    currentTheme = key;
    const theme = themes[key];
    const body = document.body;
    body.dataset.theme = key;

    // Themes bring their own background; only Classic uses the Background dropdown
    document.getElementById('backgroundGroup').hidden = key !== 'classic';
    if (key === 'classic') {
        applyBackground(document.getElementById('backgroundSelect').value);
    } else {
        body.style.background = '';
        body.style.backgroundSize = '';
        body.style.animation = '';
    }

    document.getElementById('wheelPointer').innerHTML = theme ? theme.pointer : '';
    buildThemeDecorations(theme ? theme.extras : 'none');

    clearInterval(idleTimer);
    idleTimer = null;
    if (theme && !reduceMotion) {
        // Twinkle the rim bulbs while the wheel is idle
        idleTimer = setInterval(() => {
            if (!isSpinning && isWheelVisible()) drawWheel();
        }, 650);
    }

    if (isWheelVisible()) drawWheel();

    // Canvas text only uses a web font once it has loaded
    if (theme && document.fonts) {
        document.fonts.load(`${theme.weight} 24px ${theme.font}`).then(() => {
            if (isWheelVisible()) drawWheel();
        }).catch(() => {});
    }
}

function isWheelVisible() {
    return document.getElementById('wheelScreen').style.display === 'block';
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function buildThemeDecorations(kind) {
    const box = document.getElementById('themeFx');
    box.innerHTML = '';

    const add = (className, size, styles) => {
        const el = document.createElement('span');
        el.className = className;
        Object.assign(el.style, { width: size + 'px', height: size + 'px' }, styles);
        box.appendChild(el);
        return el;
    };

    if (kind === 'bubbles') {
        for (let i = 0; i < 14; i++) {
            const bubble = add('bubble', randomBetween(20, 80), {
                left: randomBetween(-5, 95) + '%',
                animationDuration: randomBetween(12, 22) + 's',
                animationDelay: -randomBetween(0, 22) + 's'
            });
            bubble.style.setProperty('--drift', randomBetween(-40, 40) + 'px');
        }
    } else if (kind === 'stars') {
        for (let i = 0; i < 90; i++) {
            const big = i < 10;
            add(big ? 'star big' : 'star', big ? randomBetween(10, 16) : randomBetween(1.5, 3.5), {
                left: randomBetween(1, 99) + '%',
                top: randomBetween(1, 99) + '%',
                animationDuration: randomBetween(1.2, 3.5) + 's',
                animationDelay: -randomBetween(0, 3) + 's'
            });
        }
        add('moon', 48, {});
    } else if (kind === 'sparkles') {
        for (let i = 0; i < 26; i++) {
            add('sparkle', randomBetween(8, 22), {
                left: randomBetween(2, 96) + '%',
                top: randomBetween(2, 96) + '%',
                animationDuration: randomBetween(1.4, 3) + 's',
                animationDelay: -randomBetween(0, 3) + 's'
            });
        }
    }
}

function startGame() {
    // Get settings
    totalSpins = parseInt(document.getElementById('numSpins').value);
    maxMinutes = parseInt(document.getElementById('maxMinutes').value);
    localStorage.setItem('numSpins', totalSpins);
    localStorage.setItem('maxMinutes', maxMinutes);
    const bgValue = document.getElementById('backgroundSelect').value;
    localStorage.setItem('background', bgValue);
    localStorage.setItem('theme', currentTheme);
    currentSpin = 0;
    totalMinutes = 0;
    plusFiveBonus = 0;
    minutesLocked = false;
    lockPermanent = false;
    gambleChoice = 'none';
    spinHistory = [];
    countedSpinIndex = -1;
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

    // Set canvas size to match container, at the screen's pixel density so it stays sharp
    const dpr = window.devicePixelRatio || 1;
    wheelSize = Math.min(400, container.offsetWidth);
    canvas.width = Math.round(wheelSize * dpr);
    canvas.height = Math.round(wheelSize * dpr);
}

function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const dpr = canvas.width / wheelSize;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, wheelSize, wheelSize);

    const theme = themes[currentTheme];
    if (theme) {
        drawThemedWheel(ctx, theme);
    } else {
        drawClassicWheel(ctx);
    }
}

function drawClassicWheel(ctx) {
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const radius = Math.min(centerX, centerY) - 20;

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
        const fontSize = Math.max(20, Math.min(32, wheelSize / 12));
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

// Blend a #RRGGBB color toward another; amount 0..1
function mixColor(hex, other, amount) {
    const parse = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const a = parse(hex);
    const b = parse(other);
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * amount)).join(',')})`;
}

function drawThemedWheel(ctx, theme) {
    const TAU = Math.PI * 2;
    const size = wheelSize;
    const c = size / 2;
    const R = c - size * 0.045;
    const rimW = size * 0.075;
    const r = R - rimW;
    const n = segments.length;
    const a = TAU / n;
    const now = performance.now();

    // Rim with drop shadow
    ctx.save();
    ctx.shadowColor = theme.shadow;
    ctx.shadowBlur = size * 0.05;
    ctx.shadowOffsetY = size * 0.015;
    const rimGradient = ctx.createLinearGradient(c - R, c - R, c + R, c + R);
    theme.rim.forEach((col, i) => rimGradient.addColorStop(i / (theme.rim.length - 1), col));
    ctx.beginPath();
    ctx.arc(c, c, R, 0, TAU);
    ctx.fillStyle = rimGradient;
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = size * 0.006;
    ctx.strokeStyle = theme.rimEdge;
    ctx.beginPath();
    ctx.arc(c, c, R - ctx.lineWidth / 2, 0, TAU);
    ctx.stroke();

    // Tabby stripes on the rim (Cat Café)
    if (theme.stripes) {
        ctx.save();
        ctx.strokeStyle = theme.stripes;
        ctx.lineCap = 'round';
        ctx.lineWidth = size * 0.012;
        for (let i = 0; i < n; i++) {
            const angle = wheelRotation + i * a;
            ctx.beginPath();
            ctx.moveTo(c + Math.cos(angle) * (r + rimW * 0.22), c + Math.sin(angle) * (r + rimW * 0.22));
            ctx.lineTo(c + Math.cos(angle) * (R - rimW * 0.22), c + Math.sin(angle) * (R - rimW * 0.22));
            ctx.stroke();
        }
        ctx.restore();
    }

    // Slices; the winning one blinks for a moment after the wheel stops
    const flashing = winnerIndex >= 0 && now - flashStart < 1500;
    const flashOn = flashing && Math.floor((now - flashStart) / 190) % 2 === 0;
    segments.forEach((segment, i) => {
        const start = wheelRotation + i * a;
        const end = start + a;
        const color = theme.slices[i % theme.slices.length];
        let fill;
        if (segment.type !== 'minutes') {
            // Bonus slices are white so they stand out
            fill = ctx.createRadialGradient(c, c, r * 0.2, c, c, r);
            fill.addColorStop(0, '#FFFFFF');
            fill.addColorStop(1, theme.special === '#FFFFFF' ? '#F1ECF7' : theme.special);
        } else if (Array.isArray(color)) {
            fill = ctx.createLinearGradient(
                c + Math.cos(start) * r, c + Math.sin(start) * r,
                c + Math.cos(end) * r, c + Math.sin(end) * r
            );
            fill.addColorStop(0, color[0]);
            fill.addColorStop(1, color[1]);
        } else {
            fill = ctx.createRadialGradient(c, c, r * 0.15, c, c, r);
            fill.addColorStop(0, mixColor(color, '#FFFFFF', 0.4));
            fill.addColorStop(0.55, mixColor(color, '#FFFFFF', 0.08));
            fill.addColorStop(1, color);
        }
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, r, start, end);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (flashOn && i === winnerIndex) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fill();
        }
    });

    // Dividers
    ctx.save();
    ctx.strokeStyle = theme.divider;
    ctx.lineWidth = size * theme.dividerW;
    for (let i = 0; i < n; i++) {
        const angle = wheelRotation + i * a;
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(angle) * r * 0.3, c + Math.sin(angle) * r * 0.3);
        ctx.lineTo(c + Math.cos(angle) * r, c + Math.sin(angle) * r);
        ctx.stroke();
    }
    ctx.restore();

    // Labels
    const fontSize = size * 0.078;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    segments.forEach((segment, i) => {
        const isSpecial = segment.type !== 'minutes';
        const text = segment.value.toString();
        const x = r * 0.73;
        ctx.save();
        ctx.translate(c, c);
        ctx.rotate(wheelRotation + i * a + a / 2);
        ctx.font = `${theme.weight} ${isSpecial ? fontSize * 1.08 : fontSize}px ${theme.font}, "Nunito", Arial, sans-serif`;
        if (isSpecial) {
            ctx.fillStyle = theme.specialText;
            ctx.fillText(text, x, 1);
        } else {
            ctx.lineWidth = size * theme.strokeW;
            ctx.strokeStyle = theme.stroke;
            ctx.strokeText(text, x, 1);
            if (theme.glow) {
                ctx.shadowColor = theme.glow;
                ctx.shadowBlur = size * 0.02;
            }
            ctx.fillStyle = theme.text;
            ctx.fillText(text, x, 1);
        }
        ctx.restore();
    });

    // Edge shading and a glossy highlight
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, r, 0, TAU);
    ctx.clip();
    const edge = ctx.createRadialGradient(c, c, r * 0.8, c, c, r);
    edge.addColorStop(0, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, size, size);
    const gloss = ctx.createLinearGradient(0, c - r, 0, c + r * 0.05);
    gloss.addColorStop(0, `rgba(255,255,255,${theme.gloss})`);
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.ellipse(c, c - r * 0.42, r * 1.02, r * 0.66, 0, 0, TAU);
    ctx.fillStyle = gloss;
    ctx.fill();
    ctx.restore();

    // Inner rim line
    ctx.lineWidth = size * 0.008;
    ctx.strokeStyle = theme.rimEdge;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, TAU);
    ctx.stroke();

    // Light bulbs: slow twinkle when idle, a fast chase while spinning
    const bulbs = 16;
    const bulbR = size * 0.017;
    const step = isSpinning ? Math.floor(now / 70) : (reduceMotion ? 0 : Math.floor(now / 650));
    for (let i = 0; i < bulbs; i++) {
        const angle = wheelRotation + (i + 0.5) * (TAU / bulbs);
        const bx = c + Math.cos(angle) * (r + rimW / 2);
        const by = c + Math.sin(angle) * (r + rimW / 2);
        const on = isSpinning
            ? (i + step) % 4 === 0 || (i + step + 1) % 4 === 0
            : (i + step) % 2 === 0;
        if (on) {
            const glow = ctx.createRadialGradient(bx, by, 0, bx, by, bulbR * 2.6);
            glow.addColorStop(0, theme.bulbGlow);
            glow.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(bx, by, bulbR * 2.6, 0, TAU);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(bx, by, bulbR, 0, TAU);
        ctx.fillStyle = on ? theme.bulbOn : theme.bulbOff;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx - bulbR * 0.3, by - bulbR * 0.35, bulbR * 0.35, 0, TAU);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();
    }
}

function flashWinner(index) {
    winnerIndex = index;
    flashStart = performance.now();

    function tick() {
        drawWheel();
        if (performance.now() - flashStart < 1600 && !isSpinning) {
            requestAnimationFrame(tick);
        } else {
            winnerIndex = -1;
            drawWheel();
        }
    }
    requestAnimationFrame(tick);
}

// ---------- Confetti ----------
// A burst from the middle of the screen, or (fromTop) a shower falling from above
function burstConfetti(count, fromTop = false) {
    if (reduceMotion) return;
    const theme = themes[currentTheme];

    const canvas = document.getElementById('confettiCanvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);

    const style = theme ? theme.confetti : { colors: colors.slice(0, 5), shapes: ['circle', 'rect'] };
    for (let i = 0; i < count; i++) {
        const angle = randomBetween(-Math.PI * 0.95, -Math.PI * 0.05);
        const speed = randomBetween(4, 12);
        confettiPieces.push({
            x: fromTop ? randomBetween(0, window.innerWidth) : window.innerWidth / 2 + randomBetween(-30, 30),
            y: fromTop ? randomBetween(-window.innerHeight * 0.6, -10) : window.innerHeight * 0.5,
            vx: fromTop ? randomBetween(-1, 1) : Math.cos(angle) * speed,
            vy: fromTop ? randomBetween(1, 3) : Math.sin(angle) * speed - 3,
            rotation: randomBetween(0, Math.PI * 2),
            spin: randomBetween(-0.2, 0.2),
            size: randomBetween(7, 13),
            color: style.colors[i % style.colors.length],
            shape: style.shapes[i % style.shapes.length],
            life: 1
        });
    }

    if (!confettiRunning) {
        confettiRunning = true;
        requestAnimationFrame(drawConfetti);
    }
}

function drawConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    const dpr = canvas.width / window.innerWidth;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    confettiPieces = confettiPieces.filter(p => p.life > 0);
    for (const p of confettiPieces) {
        p.vy += 0.2;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        p.life -= 0.007;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        drawConfettiShape(ctx, p);
        ctx.restore();
    }

    if (confettiPieces.length) {
        requestAnimationFrame(drawConfetti);
    } else {
        confettiRunning = false;
    }
}

function drawConfettiShape(ctx, p) {
    const z = p.size;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    switch (p.shape) {
        case 'circle':
            ctx.arc(0, 0, z / 2, 0, Math.PI * 2);
            break;
        case 'rect':
            ctx.rect(-z / 2, -z / 4, z, z / 2);
            break;
        case 'heart':
            ctx.moveTo(0, z * 0.35);
            ctx.bezierCurveTo(-z, -z * 0.2, -z * 0.35, -z * 0.8, 0, -z * 0.3);
            ctx.bezierCurveTo(z * 0.35, -z * 0.8, z, -z * 0.2, 0, z * 0.35);
            break;
        case 'star':
            starPath(ctx, 5, z * 0.75, z * 0.32);
            break;
        case 'sparkle':
            starPath(ctx, 4, z * 0.8, z * 0.2);
            break;
        case 'paw':
            ctx.ellipse(0, z * 0.2, z * 0.38, z * 0.3, 0, 0, Math.PI * 2);
            [[-0.42, -0.2], [-0.15, -0.45], [0.15, -0.45], [0.42, -0.2]].forEach(([dx, dy]) => {
                ctx.moveTo(dx * z + z * 0.14, dy * z);
                ctx.arc(dx * z, dy * z, z * 0.14, 0, Math.PI * 2);
            });
            break;
    }
    ctx.fill();
}

function starPath(ctx, spikes, outer, inner) {
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 ? inner : outer;
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
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
        document.getElementById('powerRingFill').style.strokeDashoffset = 100 - holdProgress;

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
    document.getElementById('powerRingFill').style.strokeDashoffset = 100;

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
        if (themes[currentTheme]) tickPointer();

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

// Flick the pointer each time a slice divider passes under it
function tickPointer() {
    const index = getPointerSegmentIndex();
    if (index !== lastPointerIndex) {
        lastPointerIndex = index;
        pointerKick = 1;
    } else {
        pointerKick *= 0.8;
    }
    const pointer = document.getElementById('wheelPointer');
    pointer.style.transform = pointerKick > 0.02 ? `translateX(-50%) rotate(${-pointerKick * 22}deg)` : '';
}

function getPointerSegmentIndex() {
    // Calculate which segment the top pointer is pointing to
    const normalizedRotation = wheelRotation % (Math.PI * 2);
    const anglePerSegment = (Math.PI * 2) / segments.length;

    // The pointer is at the top (12 o'clock position)
    let pointerAngle = (3 * Math.PI / 2) - normalizedRotation;
    while (pointerAngle < 0) pointerAngle += Math.PI * 2;
    pointerAngle = pointerAngle % (Math.PI * 2);

    return Math.floor(pointerAngle / anglePerSegment);
}

function checkResult() {
    const winningIndex = getPointerSegmentIndex();
    const result = segments[winningIndex];

    if (themes[currentTheme]) {
        document.getElementById('wheelPointer').style.transform = '';
        flashWinner(winningIndex);
        burstConfetti(result.type === 'minutes' ? 40 : 100);
    }

    // Remember every spin for the end screen; "applied" is false when a locked score ignored it
    spinHistory.push({ value: result.value, type: result.type, applied: result.type === 'tryAgain' || !minutesLocked });
    if (result.type === 'minutes' && !minutesLocked) {
        countedSpinIndex = spinHistory.length - 1;
    }

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

function getGambleWinExtra(total) {
    return Math.round((total * 0.5) / 5) * 5;
}

function showGambleScreen() {
    const totalCurrent = totalMinutes + plusFiveBonus;
    const winTotal = totalCurrent + getGambleWinExtra(totalCurrent);
    document.getElementById('wheelScreen').style.display = 'none';
    document.getElementById('gambleScreen').style.display = 'block';

    document.getElementById('gambleBank').textContent = totalCurrent;
    document.getElementById('gambleWinTotal').textContent = winTotal;
    document.getElementById('coinWinLabel').textContent = winTotal;
    document.getElementById('keepTotalMinutes').textContent = totalCurrent;
}

function handleGamble() {
    gambleChoice = 'gamble';
    const gambleBtn = document.querySelector('.gamble-action-button');
    gambleBtn.disabled = true;

    const win = Math.random() > 0.5;
    const totalCurrent = totalMinutes + plusFiveBonus;
    const extraTime = getGambleWinExtra(totalCurrent);
    finalGambleMinutes = win ? totalCurrent + extraTime : 10;

    // Flip the coin: five full turns, plus half a turn to land on tails
    const stage = document.getElementById('coinStage');
    const toss = document.getElementById('coinToss');
    const coin = document.getElementById('coin');
    const label = document.getElementById('coinLabel');
    stage.hidden = false;
    label.textContent = '';
    coin.style.transition = 'none';
    coin.style.transform = 'rotateY(0deg)';
    toss.style.animation = 'none';
    void toss.offsetWidth;
    toss.style.animation = '';
    coin.style.transition = reduceMotion ? 'none' : 'transform 1.6s cubic-bezier(0.25, 0.7, 0.25, 1)';
    coin.style.transform = `rotateY(${360 * 5 + (win ? 0 : 180)}deg)`;

    const landDelay = reduceMotion ? 100 : 1650;
    setTimeout(() => {
        label.textContent = win ? `★ +${extraTime} min! ★` : '✕ 10 min this time';
        if (win) burstConfetti(80);
    }, landDelay);

    setTimeout(() => {
        stage.hidden = true;
        document.getElementById('gambleScreen').style.display = 'none';
        document.getElementById('gambleResultScreen').style.display = 'block';

        if (win) {
            document.getElementById('gambleWinAmount').textContent = `+${extraTime} min from the coin`;
            document.getElementById('gambleWinPanel').style.display = 'block';
            document.getElementById('gambleLosePanel').style.display = 'none';
            document.getElementById('winRays').hidden = false;
            countUp(document.getElementById('gambleWinCount'), totalCurrent, finalGambleMinutes, 500);
            burstConfetti(160, true);
        } else {
            document.getElementById('loseOldMinutes').textContent = totalCurrent;
            document.getElementById('gambleWinPanel').style.display = 'none';
            document.getElementById('gambleLosePanel').style.display = 'block';
        }
    }, landDelay + 1300);
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
    document.getElementById('winRays').hidden = true;
    showEndScreen(finalGambleMinutes);
}

// Animate a number from one value to another
function countUp(el, from, to, delay = 300, duration = 1100) {
    el.textContent = from;
    if (reduceMotion) {
        el.textContent = to;
        return;
    }
    setTimeout(() => {
        const start = performance.now();
        function step(now) {
            const progress = Math.min(1, (now - start) / duration);
            el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, delay);
}

function renderSpinHistory() {
    const list = document.getElementById('spinHistory');
    list.innerHTML = '';
    document.getElementById('spinHistoryBlock').hidden = spinHistory.length === 0;

    spinHistory.forEach((spin, index) => {
        const chip = document.createElement('span');
        chip.className = 'spin-chip';
        chip.textContent = spin.value;
        if (spin.type !== 'minutes') chip.classList.add('bonus');
        if (!spin.applied) chip.classList.add('skipped');
        if (index === countedSpinIndex) {
            chip.classList.add('counts');
            chip.title = 'This spin counts';
        }
        list.appendChild(chip);
    });
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

    countUp(document.getElementById('summaryTotal'), 0, finalMinutes, 300);
    renderSpinHistory();

    // Legend
    document.getElementById('summaryRegular').textContent = regularMinutes;
    document.getElementById('summaryPlusFives').textContent = `+${plusFives}`;

    const summaryLuckyEl = document.getElementById('summaryLucky');
    const summaryLuckyLabelEl = document.getElementById('summaryLuckyLabel');
    const luckyDot = document.getElementById('summaryLuckyDot');
    summaryLuckyEl.classList.remove('unlucky');
    luckyDot.classList.remove('lost', 'safe');

    if (gambleChoice === 'safe') {
        summaryLuckyLabelEl.textContent = 'Safe choice';
        summaryLuckyEl.textContent = '✓';
        luckyDot.classList.add('safe');
    } else if (luckyMinutes < 0) {
        summaryLuckyLabelEl.textContent = 'Unlucky coin';
        summaryLuckyEl.textContent = `−${-luckyMinutes}`;
        summaryLuckyEl.classList.add('unlucky');
        luckyDot.classList.add('lost');
    } else {
        summaryLuckyLabelEl.textContent = 'Lucky coin';
        summaryLuckyEl.textContent = `+${luckyMinutes}`;
    }

    // Bar: wheel, bonus and coin shares; minutes lost to the coin are striped on top
    const base = regularMinutes + plusFives + Math.max(luckyMinutes, 0);
    const percent = value => (base > 0 ? (value / base) * 100 : 0) + '%';
    const widths = {
        barWheel: percent(regularMinutes),
        barBonus: percent(plusFives),
        barCoin: percent(Math.max(luckyMinutes, 0)),
        barLost: percent(Math.max(-luckyMinutes, 0))
    };
    Object.keys(widths).forEach(id => {
        document.getElementById(id).style.width = '0';
    });
    setTimeout(() => {
        Object.entries(widths).forEach(([id, width]) => {
            document.getElementById(id).style.width = width;
        });
    }, reduceMotion ? 0 : 500);

    burstConfetti(120, true);
}

function resetGame() {
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('gambleScreen').style.display = 'none';
    document.getElementById('gambleResultScreen').style.display = 'none';
    document.getElementById('gambleWinPanel').style.display = 'none';
    document.getElementById('gambleLosePanel').style.display = 'none';
    document.getElementById('gambleSafePanel').style.display = 'none';
    document.getElementById('winRays').hidden = true;
    document.getElementById('coinStage').hidden = true;
    document.getElementById('setupScreen').style.display = 'block';

    // Clear summary values to prevent stale data on next End Screen
    document.getElementById('summaryRegular').textContent = '0';
    document.getElementById('summaryPlusFives').textContent = '0';
    document.getElementById('summaryLucky').textContent = '0';
    document.getElementById('summaryTotal').textContent = '0';
    document.getElementById('spinHistory').innerHTML = '';

    // Reset gamble button for next time
    const gambleBtn = document.querySelector('.gamble-action-button');
    if (gambleBtn) {
        gambleBtn.disabled = false;
    }

    wheelRotation = 0;
    minutesLocked = false;
    lockPermanent = false;
    unlockSpinButton();
}

// Start a new round straight away with the same settings
function playAgain() {
    resetGame();
    startGame();
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

    const themeEl = document.getElementById('themeSelect');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme in themes) themeEl.value = savedTheme;
    applyTheme(themeEl.value);

    themeEl.addEventListener('change', () => {
        localStorage.setItem('theme', themeEl.value);
        applyTheme(themeEl.value);
    });

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

// Setup screen previews for each theme card: card background, name color and mini wheel rim
const themePreviews = {
    classic: { background: 'linear-gradient(135deg, #1a3a52 0%, #0d1f2d 100%)', text: '#FFFFFF', rim: '#0a1929' },
    candy: { background: 'linear-gradient(165deg, #FFD3E6 0%, #FFE6D2 50%, #D3F5EA 100%)', text: '#9E2C66', rim: '#FFFFFF' },
    galaxy: { background: 'radial-gradient(circle at 25% 12%, #5A34B5 0%, #231660 45%, #0B0A28 100%)', text: '#FFE9A8', rim: '#FFD86B' },
    holo: { background: 'linear-gradient(125deg, #FBD0F1, #D3E0FF, #C9F6EC, #FFF0C4)', text: '#5A34B5', rim: '#FFFFFF' },
    cat: { background: 'linear-gradient(180deg, #3ED3C3 0%, #17A294 100%)', text: '#FFFFFF', rim: '#FF9F43' }
};

function miniWheelGradient(key) {
    const theme = themes[key];
    const sliceColors = theme ? theme.slices.map(c => Array.isArray(c) ? c[0] : c) : colors.slice(0, 5);
    const slices = 8;
    const step = 360 / slices;
    const stops = [];
    for (let i = 0; i < slices; i++) {
        stops.push(`${sliceColors[i % sliceColors.length]} ${i * step}deg ${(i + 1) * step}deg`);
    }
    return `conic-gradient(${stops.join(', ')})`;
}

// Turn each hidden <select> on the setup screen into tappable buttons
function buildPickers() {
    document.querySelectorAll('[data-picker]').forEach(picker => {
        const select = document.getElementById(picker.dataset.for);
        const kind = picker.dataset.picker;

        [...select.options].forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.value = option.value;

            if (kind === 'themes') {
                const preview = themePreviews[option.value];
                button.className = 'theme-card';
                button.style.background = preview.background;
                button.style.color = preview.text;
                button.innerHTML =
                    `<span class="mini-wheel" style="background: ${miniWheelGradient(option.value)}; border-color: ${preview.rim};"></span>` +
                    `<span class="theme-name">${option.textContent}</span>`;
            } else if (kind === 'swatches') {
                button.className = 'swatch';
                button.style.background = backgrounds[option.value].background;
                button.title = option.textContent;
                button.setAttribute('aria-label', option.textContent);
            } else {
                button.className = 'pick-chip';
                button.textContent = option.textContent;
            }

            button.addEventListener('click', () => {
                select.value = option.value;
                select.dispatchEvent(new Event('change'));
                syncPicker(picker);
            });
            picker.appendChild(button);
        });

        syncPicker(picker);
    });
}

function syncPicker(picker) {
    const select = document.getElementById(picker.dataset.for);
    picker.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.value === select.value));
    });
    if (select.id === 'backgroundSelect') {
        document.getElementById('backgroundName').textContent = select.selectedOptions[0].textContent;
    }
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
    buildPickers();
});