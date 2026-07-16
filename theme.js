(function () {

const style = `
#spotui-tui {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 90px;
    width: 100vw;
    background: #000;
    color: #ddd;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 15px;
    padding: 40px;
    box-sizing: border-box;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    user-select: text;
    cursor: text;
}

#spotui-logo {
    position: absolute;
    left: 50%;
    top: 41%;
    transform: translate(-50%, -50%);
    color: #ff8c42;
    opacity: 1;
    white-space: pre;
    text-align: center;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 28px;
    line-height: 1.0;
    pointer-events: none;
    user-select: none;
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.spotui-ascii-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-size: clamp(9px, 1.4vw, 22px);
    letter-spacing: 0;
    font-weight: 400;
    font-variant-ligatures: none;
    font-kerning: none;
    -webkit-font-smoothing: antialiased;
    user-select: none;
    white-space: pre;
    padding: 20px;
    contain: layout style paint;
}

.spotui-ascii-row {
    display: flex;
    flex-wrap: nowrap;
    white-space: nowrap;
    contain: layout style paint;
}

.spotui-ascii-char {
    display: inline-block;
    font-size: clamp(9px, 1.4vw, 22px);
    line-height: 1;
    width: 1ch;
    text-align: left;
    position: relative;
    text-shadow: 0 0 6px currentColor;
}

@media (max-width: 700px) {
    .spotui-ascii-grid {
        font-size: clamp(5px, 1.1vw, 11px);
    }

    .spotui-ascii-char {
        font-size: clamp(5px, 1.1vw, 11px);
    }
}

@media (max-width: 450px) {
    .spotui-ascii-grid {
        font-size: clamp(3.5px, 1.4vw, 7px);
    }

    .spotui-ascii-char {
        font-size: clamp(3.5px, 1.4vw, 7px);
    }
}

#spotui-output {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column-reverse;
    white-space: pre-wrap;
    line-height: 1.6;
    user-select: text;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    position: relative;
    z-index: 1;
    transition: opacity 260ms ease, transform 260ms ease;
}

body.spotui-command-mode #spotui-output {
    display: none !important;
}

body.spotui-cli-mode #spotui-output {
    display: flex !important;
}

#spotui-output::-webkit-scrollbar {
    width: 0;
    height: 0;
}

#spotui-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
    margin-top: auto;
    border-top: 1px solid rgba(255, 140, 66, 0.18);
    position: relative;
    z-index: 1;
    transition: opacity 260ms ease, transform 260ms ease;
}

#spotui-input {
    background: transparent;
    border: none;
    outline: none;
    color: #ff8c42;
    font-family: inherit;
    font-size: inherit;
    flex: 1 1 auto;
    min-width: 0;
}

.prompt { color: #ff8c42; }
.cl-line, .result { margin-bottom: 8px; user-select: text; }
.result { padding: 5px; }
.selected { background: #ff8c42; color: #000; }

#spotui-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-left: auto;
}

.spotui-control-btn {
    background: #ff8c42;
    color: #000;
    border: none;
    padding: 6px 12px;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
}

.spotui-control-btn:hover {
    background: #e07b39;
}

body.spotui-tui-hidden #spotui-tui {
    display: none !important;
}

body.spotui-tui-hidden #spotui-popup {
    display: none !important;
}

#spotui-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(480px, calc(100vw - 32px));
    max-height: 60vh;
    background: #0a0a0a;
    border: 2px solid #ff8c42;
    border-radius: 6px;
    color: #ddd;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 14px;
    z-index: 10002;
    padding: 16px;
    overflow-y: auto;
    outline: none;
    box-shadow: 0 0 24px rgba(0,0,0,0.6);
    scrollbar-width: none;
    -ms-overflow-style: none;
}
#spotui-popup::-webkit-scrollbar {
    width: 0;
    height: 0;
}
.popup-title {
    color: #ff8c42;
    margin-bottom: 10px;
    font-size: 12px;
    border-bottom: 1px solid #333;
    padding-bottom: 8px;
}
.popup-row {
    padding: 4px 6px;
}
.popup-row.selected {
    background: #ff8c42;
    color: #000;
}
.popup-input {
    width: 100%;
    background: #111;
    border: 1px solid #ff8c42;
    color: #ff8c42;
    font-family: inherit;
    font-size: inherit;
    padding: 6px;
    outline: none;
    box-sizing: border-box;
}
`;

const SPOTUI_ASCII_ART = [
    "   ▄████████    ▄███████▄  ▄██████▄      ███     ███    █▄   ▄█  ",
    "  ███    ███   ███    ███ ███    ███ ▀█████████▄ ███    ███ ███  ",
    "  ███    █▀    ███    ███ ███    ███    ▀███▀▀██ ███    ███ ███▌ ",
    "  ███          ███    ███ ███    ███     ███   ▀ ███    ███ ███▌ ",
    "▀███████████ ▀█████████▀  ███    ███     ███     ███    ███ ███▌ ",
    "         ███   ███        ███    ███     ███     ███    ███ ███  ",
    "   ▄█    ███   ███        ███    ███     ███     ███    ███ ███  ",
    " ▄████████▀   ▄████▀       ▀██████▀     ▄████▀   ████████▀  █▀   ",
];

const GLITCH_CHARS = "01";
const ORANGE_PALETTE = [
    "#ff6a00",
    "#ff7a0a",
    "#ff8c1a",
    "#ff9e33",
    "#ffb04d",
    "#ffc266",
    "#ffd480",
    "#ffe699",
];

function getCharColor(row, col, totalRows, totalCols) {
    const normRow = row / Math.max(totalRows - 1, 1);
    const normCol = col / Math.max(totalCols - 1, 1);
    const mix = normRow * 0.55 + normCol * 0.45;
    const idx = Math.floor(mix * (ORANGE_PALETTE.length - 1));
    const frac = mix * (ORANGE_PALETTE.length - 1) - idx;
    const i = Math.min(idx, ORANGE_PALETTE.length - 2);
    const c1 = ORANGE_PALETTE[i];
    const c2 = ORANGE_PALETTE[i + 1] || ORANGE_PALETTE[i];
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * frac);
    const g = Math.round(g1 + (g2 - g1) * frac);
    const b = Math.round(b1 + (b2 - b1) * frac);
    return `rgb(${r},${g},${b})`;
}

let asciiAnimationInitialized = false;
let asciiCharData = [];

function initAsciiAnimation() {
    if (asciiAnimationInitialized) return;
    asciiAnimationInitialized = true;

    const logo = document.getElementById("spotui-logo");
    if (!logo) return;

    logo.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "spotui-ascii-grid";
    logo.appendChild(grid);

    const rows = SPOTUI_ASCII_ART.length;
    const cols = Math.max(...SPOTUI_ASCII_ART.map((row) => row.length));
    const charData = [];
    const rowSpansCache = [];

    SPOTUI_ASCII_ART.forEach((line, rowIdx) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "spotui-ascii-row";
        rowDiv.dataset.row = rowIdx;
        const padded = line.padEnd(cols, " ");
        const chars = [...padded];
        const rowSpans = [];
        chars.forEach((ch, colIdx) => {
            const span = document.createElement("span");
            span.className = "spotui-ascii-char";
            span.textContent = ch;
            span.dataset.row = rowIdx;
            span.dataset.col = colIdx;
            span.dataset.original = ch;
            const color = getCharColor(rowIdx, colIdx, rows, cols);
            span.style.color = color;
            span.dataset.origColor = color;
            charData.push({
                row: rowIdx,
                col: colIdx,
                el: span,
                original: ch,
                color,
            });
            rowSpans.push(span);
            rowDiv.appendChild(span);
        });
        rowSpansCache.push(rowSpans);
        grid.appendChild(rowDiv);
    });

    asciiCharData = charData;

    function resetGrid() {
        charData.forEach(({ el, original, color }) => {
            el.textContent = original;
            el.style.color = color;
        });
    }

    function getRowSpans(rowIdx) {
        return rowSpansCache[rowIdx] || [];
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function decryptRow(rowIdx) {
        const spans = getRowSpans(rowIdx);
        if (!spans.length) return;
        const chars = [...GLITCH_CHARS];
        const origs = spans.map((span) => span.dataset.original || " ");
        const colors = spans.map((span) => span.dataset.origColor || "#ff8c1a");

        spans.forEach((span) => {
            span.textContent = chars[Math.floor(Math.random() * chars.length)];
        });

        const indices = Array.from({ length: spans.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        const batchSize = 4;
        for (let start = 0; start < indices.length; start += batchSize) {
            const batch = indices.slice(start, start + batchSize);
            batch.forEach((idx) => {
                spans[idx].textContent = chars[Math.floor(Math.random() * chars.length)];
            });
            await sleep(8);
            batch.forEach((idx) => {
                spans[idx].textContent = origs[idx];
                spans[idx].style.color = colors[idx];
            });
            await sleep(6);
        }
    }

    async function glitchRowWave(rowIdx, duration = 500) {
        const spans = getRowSpans(rowIdx);
        if (!spans.length) return;
        const origs = spans.map((span) => span.dataset.original || " ");
        const colors = spans.map((span) => span.dataset.origColor || "#ff8c1a");
        const chars = [...GLITCH_CHARS];
        const steps = 8;
        for (let step = 0; step < steps; step += 1) {
            spans.forEach((span) => {
                const randIdx = Math.floor(Math.random() * chars.length);
                span.textContent = chars[randIdx];
                const hue = 20 + Math.random() * 35;
                span.style.color = `hsl(${hue}, 100%, ${50 + Math.random() * 30}%)`;
            });
            await sleep(Math.floor(duration / steps));
        }
        spans.forEach((span, i) => {
            span.textContent = origs[i] || " ";
            span.style.color = colors[i] || "#ff8c1a";
        });
    }

    async function burstGlitch(duration = 800) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        const chars = [...GLITCH_CHARS];
        const steps = 8;
        for (let step = 0; step < steps; step += 1) {
            const progress = step / steps;
            withDist.forEach(({ el, original, color, dist }) => {
                const norm = dist / maxDist;
                const threshold = progress * 1.1;
                if (norm < threshold + 0.12 && norm > threshold - 0.12) {
                    if (Math.random() < 0.75) {
                        const randIdx = Math.floor(Math.random() * chars.length);
                        el.textContent = chars[randIdx];
                        el.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${50 + Math.random() * 30}%)`;
                    }
                } else if (norm < threshold - 0.12) {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function pulseGlitch(duration = 1200) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        const chars = [...GLITCH_CHARS];
        const waves = 3;
        const stepsPerWave = 10;

        for (let wave = 0; wave < waves; wave += 1) {
            for (let step = 0; step < stepsPerWave; step += 1) {
                const progress = step / stepsPerWave;
                const threshold = progress * 1.0;
                withDist.forEach(({ el, original, color, dist }) => {
                    const norm = dist / maxDist;
                    if (norm < threshold + 0.1 && norm > threshold - 0.1) {
                        if (Math.random() < 0.7) {
                            const randIdx = Math.floor(Math.random() * chars.length);
                            el.textContent = chars[randIdx];
                            el.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${55 + Math.random() * 25}%)`;
                        }
                    } else if (norm < threshold - 0.1 && wave === waves - 1) {
                        el.textContent = original;
                        el.style.color = color;
                    }
                });
                await sleep(Math.floor(duration / (waves * stepsPerWave)));
            }
            await sleep(40);
        }
        resetGrid();
    }

    async function implosionGlitch(duration = 900) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        const chars = [...GLITCH_CHARS];
        const steps = 10;

        withDist.forEach(({ el }) => {
            const randIdx = Math.floor(Math.random() * chars.length);
            el.textContent = chars[randIdx];
            el.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${45 + Math.random() * 35}%)`;
        });

        for (let step = 0; step < steps; step += 1) {
            const progress = step / steps;
            const threshold = 1.0 - progress * 1.1;
            withDist.forEach(({ el, original, color, dist }) => {
                const norm = dist / maxDist;
                if (norm <= threshold) {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function spiralGlitch(duration = 1000) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withAngle = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            const angle = Math.atan2(dc, dr);
            const dist = Math.sqrt(dr * dr + dc * dc);
            return { ...entry, angle, dist };
        });
        const chars = [...GLITCH_CHARS];
        const steps = 36;
        const wedgeWidth = 0.5;

        for (let step = 0; step < steps; step += 1) {
            const sweepAngle = (step / steps) * Math.PI * 2 - Math.PI;
            withAngle.forEach(({ el, original, color, angle, dist }) => {
                let diff = Math.abs(angle - sweepAngle);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;
                if (diff < wedgeWidth && dist > 0.1) {
                    const randIdx = Math.floor(Math.random() * chars.length);
                    el.textContent = chars[randIdx];
                    el.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${55 + Math.random() * 25}%)`;
                } else {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function fuzzWaveGlitch(duration = 1000) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        const chars = [...GLITCH_CHARS];
        const steps = 20;
        const bandWidth = 0.25;

        for (let step = 0; step < steps; step += 1) {
            const progress = step / steps;
            const targetNorm = progress * 1.0;
            withDist.forEach(({ el, original, color, dist }) => {
                const norm = dist / maxDist;
                const distanceFromTarget = Math.abs(norm - targetNorm);
                if (distanceFromTarget < bandWidth && Math.random() < 0.65) {
                    const randIdx = Math.floor(Math.random() * chars.length);
                    el.textContent = chars[randIdx];
                    el.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${50 + Math.random() * 30}%)`;
                } else if (distanceFromTarget > bandWidth * 1.5) {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function staticGlitch(duration = 600) {
        const chars = [...GLITCH_CHARS];
        const steps = 6;
        for (let step = 0; step < steps; step += 1) {
            charData.forEach(({ el }) => {
                if (Math.random() < 0.8) {
                    el.textContent = chars[Math.floor(Math.random() * chars.length)];
                    el.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${50 + Math.random() * 30}%)`;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function horizontalBand(direction = 1, duration = 800) {
        const chars = [...GLITCH_CHARS];
        const start = direction === 1 ? 0 : rows - 1;
        const totalSteps = rows + 2;
        for (let step = 0; step <= totalSteps; step += 1) {
            resetGrid();
            const bandCenter = start + direction * step;
            const bandTop = Math.max(0, bandCenter - 1);
            const bandBottom = Math.min(rows - 1, bandCenter + 1);
            for (let row = bandTop; row <= bandBottom; row += 1) {
                const spans = getRowSpans(row);
                spans.forEach((span) => {
                    span.textContent = chars[Math.floor(Math.random() * chars.length)];
                    span.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${50 + Math.random() * 30}%)`;
                });
            }
            await sleep(Math.floor(duration / totalSteps));
        }
        resetGrid();
    }

    async function verticalSlice(direction = 1, duration = 800) {
        const chars = [...GLITCH_CHARS];
        const start = direction === 1 ? 0 : cols - 1;
        const totalSteps = cols + 2;
        for (let step = 0; step <= totalSteps; step += 1) {
            resetGrid();
            const bandCenter = start + direction * step;
            const bandLeft = Math.max(0, bandCenter - 1);
            const bandRight = Math.min(cols - 1, bandCenter + 1);
            charData.forEach(({ el, col }) => {
                if (col >= bandLeft && col <= bandRight) {
                    el.textContent = chars[Math.floor(Math.random() * chars.length)];
                    el.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${50 + Math.random() * 30}%)`;
                }
            });
            await sleep(Math.floor(duration / totalSteps));
        }
        resetGrid();
    }

    async function stageWaveDown() {
        for (let row = 0; row < rows; row += 1) {
            await glitchRowWave(row, 300);
            await sleep(20);
        }
    }

    async function stageWaveUp() {
        for (let row = rows - 1; row >= 0; row -= 1) {
            await glitchRowWave(row, 260);
            await sleep(15);
        }
    }

    async function stageDecrypt() {
        const chars = [...GLITCH_CHARS];
        charData.forEach(({ el }) => {
            const randIdx = Math.floor(Math.random() * chars.length);
            el.textContent = chars[randIdx];
        });
        for (let row = 0; row < rows; row += 1) {
            await decryptRow(row);
        }
    }

    async function stageBurst() {
        await burstGlitch(900);
    }

    async function stagePulse() {
        await pulseGlitch(1200);
    }

    async function stageImplosion() {
        await implosionGlitch(900);
    }

    async function stageSpiral() {
        await spiralGlitch(1000);
    }

    async function stageFuzzWave() {
        await fuzzWaveGlitch(1000);
    }

    async function stageStatic() {
        await staticGlitch(700);
    }

    async function stageHSlashDown() {
        await horizontalBand(1, 800);
    }

    async function stageHSlashUp() {
        await horizontalBand(-1, 800);
    }

    async function stageVSlashRight() {
        await verticalSlice(1, 800);
    }

    async function stageVSlashLeft() {
        await verticalSlice(-1, 800);
    }

    const stageFunctions = [
        stageWaveDown,
        stageWaveUp,
        stageDecrypt,
        stageBurst,
        stagePulse,
        stageImplosion,
        stageSpiral,
        stageFuzzWave,
        stageStatic,
        stageHSlashDown,
        stageHSlashUp,
        stageVSlashRight,
        stageVSlashLeft,
    ];

    function shuffleArray(array) {
        for (let index = array.length - 1; index > 0; index -= 1) {
            const j = Math.floor(Math.random() * (index + 1));
            [array[index], array[j]] = [array[j], array[index]];
        }
        return array;
    }

    async function runLoop() {
        while (true) {
            const shuffled = shuffleArray([...stageFunctions]);
            for (const stageFn of shuffled) {
                await stageFn();
                await sleep(700 + Math.random() * 400);
            }
            resetGrid();
            await sleep(300);
        }
    }

    runLoop().catch(console.error);
}

let tuiMode = "command";

let results = [];
let selected = 0;
let lyricsObserver = null;

function injectStyle() {
    const s = document.createElement("style");
    s.textContent = style;
    document.head.appendChild(s);
}

function setTuiMode(mode) {
    tuiMode = mode === "cli" ? "cli" : "command";
    document.body.classList.toggle("spotui-cli-mode", tuiMode === "cli");
    document.body.classList.toggle("spotui-command-mode", tuiMode !== "cli");
}

function createCopyButton() {
    const controls = document.createElement("div");
    controls.id = "spotui-controls";

    const copyBtn = document.createElement("button");
    copyBtn.id = "copy-log-btn";
    copyBtn.className = "spotui-control-btn";
    copyBtn.textContent = "Copy log";
    copyBtn.addEventListener("click", () => {
        const output = document.getElementById("spotui-output");
        if (output) {
            const text = output.innerText;
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = "Copied!";
                setTimeout(() => { copyBtn.textContent = "Copy log"; }, 1500);
            }).catch(() => {
                alert("Copy failed. Please manually select and copy.");
            });
        }
    });

    const hideBtn = document.createElement("button");
    hideBtn.id = "hide-tui-btn";
    hideBtn.className = "spotui-control-btn";
    hideBtn.textContent = "Hide TUI";
    hideBtn.addEventListener("click", () => {
        const hidden = document.body.classList.toggle("spotui-tui-hidden");
        hideBtn.textContent = hidden ? "Show TUI" : "Hide TUI";
    });

    const spotifyBtn = document.createElement("button");
    spotifyBtn.id = "enable-spotify-btn";
    spotifyBtn.className = "spotui-control-btn";
    spotifyBtn.textContent = "Enable Spotify";
    spotifyBtn.addEventListener("click", () => {
        const enabled = document.body.classList.toggle("spotui-spotify-enabled");
        if (enabled) {
            document.body.classList.add("spotui-tui-hidden");
            hideBtn.textContent = "Show TUI";
            spotifyBtn.textContent = "Disable Spotify";
        } else {
            spotifyBtn.textContent = "Enable Spotify";
            document.body.classList.remove("spotui-tui-hidden");
            document.body.classList.remove("spotui-search-mode");
            hideBtn.textContent = "Hide TUI";
        }
    });

    controls.appendChild(copyBtn);
    controls.appendChild(hideBtn);
    controls.appendChild(spotifyBtn);
    const footer = document.getElementById("spotui-footer");
    (footer || document.body).appendChild(controls);

    const backBtn = document.createElement("button");
    backBtn.id = "spotui-back-btn";
    backBtn.className = "spotui-control-btn";
    backBtn.textContent = "Back";
    backBtn.addEventListener("click", () => {
        document.body.classList.remove("spotui-search-mode");
        document.body.classList.remove("spotui-spotify-enabled");
        document.body.classList.remove("spotui-tui-hidden");
        spotifyBtn.textContent = "Enable Spotify";
        hideBtn.textContent = "Hide TUI";
        syncLyricsState();
    });
    document.body.appendChild(backBtn);
}

function detectLyricsSurface() {
    return Boolean(
        document.querySelector(
            ".main-nowPlayingView-lyricsContent, .main-lyricsCinema-container, .lyrics-lyricsContainer-LyricsContainer"
        )
    );
}

function syncLyricsState() {
    if (!document.body) return;
    document.body.classList.toggle("spotui-lyrics-open", detectLyricsSurface());
}

function hookLyricsButton() {
    const button = document.querySelector(".main-nowPlayingBar-lyricsButton");
    if (!button || button.dataset.spotuiTuiLyricsHooked === "1") return;
    button.dataset.spotuiTuiLyricsHooked = "1";
    button.addEventListener(
        "click",
        () => {
            setTimeout(syncLyricsState, 50);
            setTimeout(syncLyricsState, 250);
            setTimeout(syncLyricsState, 1000);
        },
        true
    );
}

function initLyricsBridge() {
    if (!document.body) {
        setTimeout(initLyricsBridge, 250);
        return;
    }

    const refresh = () => {
        hookLyricsButton();
        syncLyricsState();
    };

    refresh();

    if (!lyricsObserver) {
        lyricsObserver = new MutationObserver(refresh);
        lyricsObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"],
        });
        window.addEventListener(
            "beforeunload",
            () => {
                lyricsObserver?.disconnect();
            },
            { once: true }
        );
    }
}

function createTerminal() {
    const box = document.createElement("div");
    box.id = "spotui-tui";
    setTuiMode("command");
    box.innerHTML = `
<div id="spotui-logo"></div>
<div id="spotui-output">SpoTUI v1.0

Type /help

</div>
<div id="spotui-footer">
<span class="prompt">></span>
<input id="spotui-input" autofocus placeholder="type help for a list of commands">
</div>
`;
    document.body.appendChild(box);
    initAsciiAnimation();

    const input = document.getElementById("spotui-input");
    input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const cmd = input.value.trim();
            input.value = "";
            print("> " + cmd);
            await execute(cmd);
        }
        if (e.key === "ArrowDown" && results.length) {
            selected = Math.min(selected + 1, results.length - 1);
            renderResults();
        }
        if (e.key === "ArrowUp" && results.length) {
            selected = Math.max(selected - 1, 0);
            renderResults();
        }
    });

}

function print(text) {
    if (tuiMode !== "cli") return;
    const output = document.getElementById("spotui-output");
    const line = document.createElement("div");
    line.className = "cl-line";
    line.textContent = text;
    output.prepend(line);
    output.scrollTop = 0;
}

async function execute(cmd) {
    const rawCmd = cmd.trim();
    const cleanedCmd = rawCmd.startsWith("/") || rawCmd.startsWith(".") ? rawCmd.slice(1).trim() : rawCmd;
    const [command, ...args] = cleanedCmd.split(/\s+/);
    const argText = args.join(" ").trim();

    if (command === "tui") {
        if (args[0] === "-m") {
            const mode = args[1];
            if (!mode || (mode !== "cli" && mode !== "command")) {
                print("Usage: tui -m [command|cli]");
                return;
            }
            setTuiMode(mode);
            print(`TUI mode: ${mode}`);
            return;
        }
        print("Usage: tui -m [command|cli]");
        return;
    }

    if (command === "help") {
        popupMode = "help";
        renderPopup();
        return;
    }
    if (command === "clear") {
        document.getElementById("spotui-output").textContent = "";
        return;
    }

    if (command === "playlist") {
        await openPlaylistPopup();
        return;
    }

    if (command === "list") {
        await openPlaylistTracksPopup();
        return;
    }

    if (command === "queue") {
        await openQueuePopup();
        return;
    }

    if (command === "play") {
        try {
            const wasPlaying = Spicetify.Player.isPlaying();
            if (!wasPlaying) {
                Spicetify.Player.togglePlay();
            }
            print("Playing");
        } catch (err) {
            print("Play error: " + err.message);
        }
        return;
    }

    if (command === "pause") {
        try {
            const wasPlaying = Spicetify.Player.isPlaying();
            if (wasPlaying) {
                Spicetify.Player.togglePlay();
            }
            print("Paused");
        } catch (err) {
            print("Pause error: " + err.message);
        }
        return;
    }

    if (command === "p") {
        try {
            const wasPlaying = Spicetify.Player.isPlaying();
            Spicetify.Player.togglePlay();
            print(wasPlaying ? "Paused" : "Playing");
        } catch (err) {
            print("Play/pause error: " + err.message);
        }
        return;
    }

    if (command === "search") {
        document.body.classList.add("spotui-search-mode");
        document.body.classList.add("spotui-tui-hidden");
        syncLyricsState();
        return;
    }

    if (command === "skip") {
        try {
            Spicetify.Player.next();
            print("Skipped to next track");
        } catch (err) {
            print("Skip error: " + err.message);
        }
        return;
    }
    if (command === "back") {
        try {
            Spicetify.Player.back();
            print("Went back to previous track");
        } catch (err) {
            print("Back error: " + err.message);
        }
        return;
    }

    if (command === "volume" || command === "v") {
        try {
            if (!argText) {
                print("Usage: volume <0-100>");
                return;
            }
            const percent = Number(argText);
            if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
                print("Volume must be between 0 and 100.");
                return;
            }
            Spicetify.Player.setVolume(percent / 100);
            print(`Volume is ${Math.round(percent)}%`);
        } catch (err) {
            print("Volume error: " + err.message);
        }
        return;
    }

    if (command === "shuffle") {
        try {
            const current = Spicetify.Player.getShuffle();
            Spicetify.Player.setShuffle(!current);
            print("Shuffle: " + (!current ? "ON" : "OFF"));
        } catch (err) {
            print("Shuffle error: " + err.message);
        }
        return;
    }

    if (command === "loop") {
        handleRepeatCommand("loop", argText);
        return;
    }

    if (command === "superloop") {
        handleRepeatCommand("superloop", argText);
        return;
    }

    print("Unknown command. Type /help");
}

function renderResults() {
    const output = document.getElementById("spotui-output");
    output.textContent = "";
    results.forEach((item, idx) => {
        const line = document.createElement("div");
        line.className = "result" + (idx === selected ? " selected" : "");
        line.textContent = `${idx + 1}. ${item.name}${item.artist ? " - " + item.artist : ""}`;
        output.appendChild(line);
    });
}

let popup = null;
let popupMode = "list";
let playlists = [];
let popupSelected = 0;
let popupTracks = [];
let popupTrackSelected = 0;
let popupTrackTitle = "";
let popupTrackContext = null;
let lastPlaylistContextUri = null;
let lastQueueSnapshot = null;

function getTrackTitle(track, index = 0) {
    const meta = track?.metadata || track?.contextTrack?.metadata || {};
    return track?.name || track?.title || meta.title || meta.name || `Track ${index + 1}`;
}

function getTrackArtist(track) {
    const meta = track?.metadata || track?.contextTrack?.metadata || {};
    if (track?.artist) return track.artist;
    if (Array.isArray(track?.artists) && track.artists.length) {
        return track.artists.map((artist) => artist?.name).filter(Boolean).join(", ");
    }
    if (meta.artist_name) return meta.artist_name;
    if (meta["artist_name:1"]) return meta["artist_name:1"];
    return "";
}

function normalizeTrackItem(track, index = 0) {
    const uri = track?.uri || track?.contextTrack?.uri || "";
    return {
        uri,
        name: getTrackTitle(track, index),
        artist: getTrackArtist(track),
    };
}

function dedupeTracks(tracks) {
    const seen = new Set();
    const out = [];
    for (const track of tracks) {
        if (!track?.uri || seen.has(track.uri)) continue;
        seen.add(track.uri);
        out.push(track);
    }
    return out;
}

function findTrackIndexByUri(tracks, uri) {
    if (!uri) return -1;
    return tracks.findIndex((track) => track?.uri === uri);
}

function getCurrentPlaylistContextUri() {
    const current = Spicetify.Player.data?.context?.uri;
    if (current && Spicetify.URI.isPlaylistV1OrV2(current)) return current;
    return lastPlaylistContextUri;
}

function getPlaylistId(uri) {
    try {
        return Spicetify.URI.fromString(uri)?.id ?? uri.split(":").pop();
    } catch {
        return uri.split(":").pop();
    }
}

function handleRepeatCommand(kind, arg) {
    try {
        const current = Spicetify.Player.getRepeat();
        const targetMode = kind === "loop" ? 1 : 2;
        let nextMode = targetMode;

        if (arg === "on") {
            nextMode = targetMode;
        } else if (arg === "off") {
            nextMode = 0;
        } else if (arg === "") {
            nextMode = current === targetMode ? 0 : targetMode;
        } else {
            print(`Usage: /${kind} [on|off]`);
            return;
        }

        Spicetify.Player.setRepeat(nextMode);
        print(`${kind === "loop" ? "Loop" : "Superloop"}: ${nextMode === 0 ? "OFF" : "ON"}`);
    } catch (err) {
        print(`${kind === "loop" ? "Loop" : "Superloop"} error: ${err.message}`);
    }
}

async function getPlaylists() {
    const rootlist = await Spicetify.Platform.RootlistAPI.getContents();
    const list = [];
    function flatten(items) {
        for (const item of items) {
            if (item.type === "playlist") {
                list.push({ name: item.name, uri: item.uri });
            } else if (item.type === "folder" && item.items) {
                flatten(item.items);
            }
        }
    }
    flatten(rootlist.items);
    return list;
}

async function openPlaylistPopup() {
    try {
        playlists = await getPlaylists();
    } catch (err) {
        print("Playlist error: " + err.message);
        return;
    }
    popupSelected = 0;
    popupMode = "list";
    renderPopup();
}

async function openPlaylistTracksPopup() {
    try {
        const contextUri = getCurrentPlaylistContextUri();
        if (!contextUri || !Spicetify.URI.isPlaylistV1OrV2(contextUri)) {
            print("List error: not currently playing a playlist.");
            return;
        }
        const res = await Spicetify.Platform.PlaylistAPI.getContents(contextUri, {
            limit: 9999999,
        });
        popupTracks = (res.items || [])
            .filter((item) => item && item.uri && item.isPlayable !== false)
            .map((item, index) => normalizeTrackItem(item, index));
        popupTracks = dedupeTracks(popupTracks);
        popupTrackTitle = "Playlist tracks";
        popupTrackContext = Spicetify.Player.data?.context || { uri: contextUri };
        lastPlaylistContextUri = contextUri;
        const currentTrackUri = Spicetify.Player.data?.item?.uri;
        popupTrackSelected = Math.max(findTrackIndexByUri(popupTracks, currentTrackUri), 0);
        popupMode = "tracks";
        renderPopup();
    } catch (err) {
        print("List error: " + err.message);
        console.error("Playlist tracks popup error:", err);
    }
}

function getQueueTracks() {
    const queue = Spicetify.Queue || {};
    const tracks = [];

    if (queue.track && queue.track.uri) {
        tracks.push(queue.track);
    } else if (Spicetify.Player.data?.item?.uri) {
        tracks.push(Spicetify.Player.data.item);
    }

    for (const item of queue.nextTracks || []) {
        const track = item?.contextTrack || item?.track || item;
        if (!track?.uri || track.uri === "spotify:delimiter") continue;
        tracks.push(track);
    }

    const currentTrackContextUri =
        Spicetify.Player.data?.context_uri ||
        Spicetify.Player.data?.context?.uri ||
        queue.track?.contextTrack?.metadata?.context_uri ||
        queue.track?.metadata?.context_uri ||
        null;

    popupTrackContext = currentTrackContextUri ? { uri: currentTrackContextUri } : Spicetify.Player.data?.context || null;

    return dedupeTracks(tracks.map((track, index) => normalizeTrackItem(track, index)));
}

function openQueuePopup() {
    const currentQueueTracks = getQueueTracks();
    if (!lastQueueSnapshot || lastQueueSnapshot.length === 0) {
        lastQueueSnapshot = currentQueueTracks;
    }
    popupTracks = lastQueueSnapshot.length ? lastQueueSnapshot : currentQueueTracks;
    popupTrackTitle = "Queue";
    const currentTrackUri = Spicetify.Player.data?.item?.uri;
    popupTrackSelected = Math.max(findTrackIndexByUri(popupTracks, currentTrackUri), 0);
    popupMode = "tracks";
    renderPopup();
}

function closePopup() {
    if (popup) {
        popup.remove();
        popup = null;
    }
    popupMode = "list";
    popupTracks = [];
    popupTrackSelected = 0;
    popupTrackTitle = "";
    popupTrackContext = null;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
}

function renderPopup() {
    if (popup) popup.remove();
    popup = document.createElement("div");
    popup.id = "spotui-popup";
    popup.tabIndex = 0;

    if (popupMode === "list") {
        popup.innerHTML = `<div class="popup-title">Playlists &mdash; &uarr;/&darr; move &middot; Enter play &middot; n new &middot; Esc close</div><div id="popup-list"></div>`;
        document.body.appendChild(popup);
        const listEl = popup.querySelector("#popup-list");
        if (!playlists.length) {
            const row = document.createElement("div");
            row.className = "popup-row";
            row.textContent = "No playlists found.";
            listEl.appendChild(row);
        } else {
            playlists.forEach((p, idx) => {
                const row = document.createElement("div");
                row.className = "popup-row" + (idx === popupSelected ? " selected" : "");
                row.textContent = `${idx + 1}. ${p.name}`;
                listEl.appendChild(row);
            });
        }
        popup.addEventListener("keydown", handleListKeydown);
        popup.focus();
    } else if (popupMode === "new") {
        popup.innerHTML = `<div class="popup-title">New playlist name &mdash; Enter confirm &middot; Esc cancel</div><input id="popup-input" class="popup-input">`;
        document.body.appendChild(popup);
        const inputEl = popup.querySelector("#popup-input");
        inputEl.focus();
        inputEl.addEventListener("keydown", handleNewKeydown);
    } else if (popupMode === "tracks") {
        popup.innerHTML = `<div class="popup-title">${popupTrackTitle} &mdash; &uarr;/&darr; move &middot; Enter play &middot; Esc close</div><div id="popup-list"></div>`;
        document.body.appendChild(popup);
        const listEl = popup.querySelector("#popup-list");
        if (!popupTracks.length) {
            const row = document.createElement("div");
            row.className = "popup-row";
            row.textContent = "No tracks found.";
            listEl.appendChild(row);
        } else {
            popupTracks.forEach((track, idx) => {
                const row = document.createElement("div");
                row.className = "popup-row" + (idx === popupTrackSelected ? " selected" : "");
                row.textContent = `${idx + 1}. ${track.name}${track.artist ? " - " + track.artist : ""}`;
                listEl.appendChild(row);
            });
        }
        popup.addEventListener("keydown", handleTrackListKeydown);
        popup.focus();
        scrollSelectedPopupRowIntoView();
    } else if (popupMode === "help") {
        popup.innerHTML = `<div class="popup-title">Help &mdash; Esc close</div><div id="popup-list"></div>`;
        document.body.appendChild(popup);
        const listEl = popup.querySelector("#popup-list");
        [
            "tui -m [command|cli]",
            "playlist",
            "list",
            "queue",
            "play",
            "pause",
            "p",
            "skip",
            "back",
            "v <percent>",
            "volume <percent>",
            "shuffle",
            "loop [on|off]",
            "superloop [on|off]",
            "search",
            "clear",
        ].forEach((item) => {
            const row = document.createElement("div");
            row.className = "popup-row";
            row.textContent = item;
            listEl.appendChild(row);
        });
        popup.addEventListener("keydown", handleHelpKeydown);
        popup.focus();
    }
}

function scrollSelectedPopupRowIntoView() {
    requestAnimationFrame(() => {
        const selectedRow = popup?.querySelector(".popup-row.selected");
        if (selectedRow?.scrollIntoView) {
            selectedRow.scrollIntoView({ block: "nearest" });
        }
    });
}

function handleListKeydown(e) {
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (playlists.length) popupSelected = (popupSelected + 1) % playlists.length;
        renderPopup();
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (playlists.length) popupSelected = (popupSelected - 1 + playlists.length) % playlists.length;
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        const p = playlists[popupSelected];
        if (p) {
            lastPlaylistContextUri = p.uri;
            Spicetify.Player.playUri(p.uri);
            print("Playing playlist: " + p.name);
        }
        closePopup();
    } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        popupMode = "new";
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
    }
    scrollSelectedPopupRowIntoView();
}

function handleTrackListKeydown(e) {
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (popupTracks.length) popupTrackSelected = (popupTrackSelected + 1) % popupTracks.length;
        renderPopup();
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (popupTracks.length) popupTrackSelected = (popupTrackSelected - 1 + popupTracks.length) % popupTracks.length;
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        const track = popupTracks[popupTrackSelected];
        if (track?.uri) {
            Spicetify.Player.playUri(track.uri, popupTrackContext || undefined);
            print("Playing: " + track.name);
        }
        if (popupTrackTitle === "Queue") {
            lastQueueSnapshot = popupTracks.slice();
        }
        closePopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
    }
    scrollSelectedPopupRowIntoView();
}

function handleHelpKeydown(e) {
    if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        closePopup();
    }
}

async function handleNewKeydown(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const name = e.target.value.trim();
        if (!name) return;
        try {
            await Spicetify.Platform.RootlistAPI.createPlaylist(name, {});
            print("Created playlist: " + name);
        } catch (err) {
            print("Create failed: " + err.message + " (check console)");
            console.error("Create playlist error:", err);
        }
        playlists = await getPlaylists();
        popupSelected = 0;
        popupMode = "list";
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        popupMode = "list";
        renderPopup();
    }
}

injectStyle();
setTimeout(createCopyButton, 500);
setTimeout(initLyricsBridge, 1000);

if (Spicetify?.Platform) {
    createTerminal();
} else {
    setTimeout(createTerminal, 1500);
}

})();
