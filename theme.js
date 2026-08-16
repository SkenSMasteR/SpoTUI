
(function () {
const ANIMATION_KEY = "spotui:ascii-animation";
const THEME_HOST = "https://spotui.root.sx/";

const style = `
#spotui-tui {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 4.75rem;
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
    transition: top 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

body.spotui-lyrics-panel #spotui-logo,
body.spotui-playlist-panel #spotui-logo,
body.spotui-help-panel #spotui-logo,
body.spotui-theme-panel #spotui-logo,
body.spotui-about-panel #spotui-logo,
body.spotui-onboarding-panel #spotui-logo {
    top: 12px;
    transform: translate(-50%, 0) scale(0.6);
    opacity: 0.8;
    z-index: 2;
    background-color: transparent;
}

#spotui-onboarding-panel {
    display: none;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 18px;
    padding: 30px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin: 33vh 5vw 8px;
    height: 60vh;
    border: 1px solid rgba(255, 140, 66, 0.3);
    border-radius: 6px;
    background: transparent;
}

body.spotui-onboarding-panel #spotui-onboarding-panel {
    display: flex;
}

.spotui-onboarding-stage {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 100%;
}

.spotui-onboarding-copy h2 {
    margin: 0 0 8px;
    color: #ff8c42;
    font-size: 28px;
    line-height: 1.1;
}

.spotui-onboarding-kicker {
    color: #b3b3b3;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.spotui-onboarding-copy p,
.spotui-onboarding-primer,
.spotui-onboarding-actions,
.spotui-onboarding-callout {
    color: #ddd;
}

.spotui-onboarding-copy code,
.spotui-onboarding-primer code,
.spotui-onboarding-callout code {
    color: #ff8c42;
    background: rgba(255, 140, 66, 0.12);
    border: 1px solid rgba(255, 140, 66, 0.22);
    border-radius: 4px;
    padding: 0 4px;
    font-family: "JetBrains Mono", monospace;
}

.spotui-onboarding-copy code {
    white-space: nowrap;
}

.spotui-onboarding-copy p code,
.spotui-onboarding-callout code {
    display: inline-block;
    line-height: 1.2;
}

.spotui-onboarding-primer {
    border: 1px solid rgba(255, 140, 66, 0.2);
    border-radius: 6px;
    padding: 16px;
    display: grid;
    gap: 8px;
}

.spotui-onboarding-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.spotui-onboarding-actions.centered {
    justify-content: center;
    margin-top: auto;
}

.spotui-onboarding-callout {
    margin-top: auto;
    align-self: flex-start;
    max-width: 280px;
    border: 1px solid rgba(255, 140, 66, 0.28);
    border-radius: 6px;
    padding: 12px 14px;
    background: rgba(0, 0, 0, 0.28);
}

.spotui-onboarding-callout .arrow {
    color: #ff8c42;
    font-size: 24px;
    line-height: 1;
    margin-bottom: 6px;
}

.spotui-onboarding-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    padding: 0;
}

.spotui-onboarding-theme {
    border: 1px solid rgba(255, 140, 66, 0.35);
    border-radius: 6px;
    background: rgba(0,0,0,0.35);
    color: #ddd;
    padding: 0;
    overflow: hidden;
    text-align: left;
    display: flex;
    flex-direction: column;
    cursor: pointer;
}

.spotui-onboarding-theme img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

.spotui-onboarding-theme span {
    padding: 10px 12px;
    font-family: "JetBrains Mono", monospace;
    color: #ff8c42;
}

body:has(#spotui-wallpaper) body.spotui-lyrics-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-playlist-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-help-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-theme-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-about-panel #spotui-logo {
    background-color: #000;
}

#spotui-top-fade {
    display: block;
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 120px;
    background: linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0));
    pointer-events: none;
    z-index: 2;
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
    .spotui-ascii-grid, .spotui-ascii-char {
        font-size: clamp(5px, 1.1vw, 11px);
    }
}

@media (max-width: 450px) {
    .spotui-ascii-grid, .spotui-ascii-char {
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

body.spotui-command-mode #spotui-output,
body.spotui-playlist-panel #spotui-output,
body.spotui-help-panel #spotui-output,
body.spotui-about-panel #spotui-output,
body.spotui-theme-panel #spotui-output,
body.spotui-lyrics-panel #spotui-output {
    display: none !important;
}

body.spotui-cli-mode #spotui-output {
    display: flex !important;
}

#spotui-output::-webkit-scrollbar,
#spotui-help-panel::-webkit-scrollbar,
#spotui-about-panel::-webkit-scrollbar,
#spotui-theme-panel::-webkit-scrollbar,
#spotui-playlist-list::-webkit-scrollbar,
#spotui-song-list::-webkit-scrollbar,
.spotui-lyrics-lines::-webkit-scrollbar {
    width: 0;
    height: 0;
}

#spotui-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
    margin-top: auto;
    border-top: 1px solid var(--input-border-color, rgba(255, 140, 66, 0.18));
    position: relative;
    z-index: 1;
    transition: opacity 260ms ease, transform 260ms ease;
}

#spotui-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--input-text-color, #ff8c42);
    font-family: inherit;
    font-size: inherit;
    flex: 1 1 auto;
    min-width: 0;
}

.prompt { color: var(--input-text-color, #ff8c42); }
.cl-line, .result { margin-bottom: 8px; user-select: text; }
.result { padding: 5px; }
.selected { background: #ff8c42; color: #000; }

body.spotui-lyrics-panel #spotui-logo {
    display: flex !important;
}

body.logo-off #spotui-logo {
    display: none !important;
}

body.logo-on.spotui-lyrics-panel #spotui-lyrics {
    height: 80vh !important;
    margin-top: 15vh !important;
}

#spotui-lyrics {
    display: none;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
    position: relative;
    z-index: 1;
    margin: 0 0 8px;
    border: none;
    background: transparent;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.spotui-lyrics-panel #spotui-lyrics.spotui-lyrics-active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.6s;
}

.spotui-lyrics-header {
    flex: 0 0 auto;
    padding: 16px 22px 12px;
    border-bottom: 1px solid rgba(255, 140, 66, 0.18);
}

.spotui-lyrics-kicker {
    color: #ff8c42;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.spotui-lyrics-track {
    color: #ddd;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.spotui-lyrics-meta {
    margin-top: 4px;
    color: #b3b3b3;
    font-size: 12px;
    letter-spacing: 0.02em;
}

.spotui-lyrics-viewport {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

.spotui-lyrics-lines {
    height: 100%;
    overflow-y: auto;
    padding: 10vh 28px;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    text-align: center;
}

.spotui-lyrics-fade {
    pointer-events: none;
    position: absolute;
    left: 0; right: 0;
    height: 72px;
    z-index: 2;
}

    top: 0;
    background: linear-gradient(180deg, #000, transparent);
}

.spotui-lyrics-fade-bottom {
    bottom: 0;
    background: linear-gradient(0deg, #000, transparent);
}

.spotui-lyrics-line {
    color: var(--lyrics-color-inactive, #777);
    font-size: 17px;
    line-height: 1.45;
    padding: 10px 8px;
    opacity: 0.45;
    transform: scale(0.96);
    transition:
        color 220ms ease,
        opacity 220ms ease,
        transform 220ms ease,
        text-shadow 220ms ease;
}

.spotui-lyrics-line.near {
    color: var(--lyrics-color-light-inactive, #b3b3b3);
    opacity: 0.72;
    transform: scale(0.98);
}

.spotui-lyrics-line.active {
    color: var(--lyrics-color-active, #ff8c42);
    opacity: 1;
    transform: scale(1.06);
    font-weight: 600;
}

#spotui-playlist-panel {
    display: none;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: row;
    position: relative;
    z-index: 1;
    margin: 33vh 5vw 8px;
    height: 60vh;
    border: none;
    background: transparent;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    gap: 10px;
}

body.spotui-playlist-panel #spotui-playlist-panel {
    display: flex;
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.6s;
}

#spotui-help-panel, #spotui-about-panel, #spotui-theme-panel {
    display: none;
    flex: 1 1 auto;
    flex-direction: column;
    padding: 30px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin: 33vh 5vw 8px;
    height: 60vh;
    border: 1px solid rgba(255, 140, 66, 0.3);
    border-radius: 6px;
    background: transparent;
}

body.spotui-help-panel #spotui-help-panel,
body.spotui-about-panel #spotui-about-panel,
body.spotui-theme-panel #spotui-theme-panel {
    display: flex;
}

.theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 12px;
}

.theme-card {
    border: 1px solid #ff8c42;
    border-radius: 4px;
    padding: 10px;
    background: rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.theme-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.2);
}

.theme-card img {
    width: 100%;
    height: auto;
    border-radius: 4px;
    object-fit: cover;
    aspect-ratio: 16/9;
}

.theme-card h3 {
    margin: 10px 0 10px;
    color: #ff8c42;
    font-weight: 600;
}

.theme-card button {
    background: #ff8c42;
    color: #000;
    border: none;
    padding: 8px 12px;
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 4px;
    margin-top: auto;
    width: 100%;
    transition: background-color 0.2s ease;
}

.theme-card button:hover {
    background-color: #e07b39;
}

.help-item {
    padding: 4px 0;
    display: flex;
    justify-content: space-between;
}

.help-item .command {
    color: #ff8c42;
    flex-basis: 30%;
}

.help-item .description {
    flex-basis: 70%;
    color: #b3b3b3;
}

#spotui-playlist-list, #spotui-song-list {
    width: 50%;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 10px;
    border: 1px solid #ff8c42;
    border-radius: 4px;
}

#spotui-playlist-list legend, #spotui-song-list legend {
    color: #ff8c42;
    padding: 0 5px;
}

.playlist-item, .song-item {
    padding: 4px 6px;
    cursor: pointer;
}

.playlist-item.selected, .song-item.selected {
    background: #ff8c42;
    color: #000;
}

.spotui-lyrics-lines.unsynced .spotui-lyrics-line {
    color: #b3b3b3;
    opacity: 0.9;
    transform: none;
    text-align: center;
}

.spotui-lyrics-empty {
    color: #b3b3b3;
    font-size: 3em;
    line-height: 1.6;
    padding: 18vh 24px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    opacity: 0.5;
}

.spotui-lyrics-empty strong {
    display: block;
    color: #ff8c42;
    font-size: 16px;
    margin-bottom: 8px;
    font-weight: 600;
}

#spotui-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-left: auto;
}

.spotui-control-btn {
    background: var(--input-bg-color, #ff8c42);
    color: var(--input-text-color, #000);
    border: none;
    padding: 6px 12px;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
}

.spotui-control-btn:hover {
    background: var(--input-bg-hover-color, #e07b39);
}

body.spotui-tui-hidden #spotui-tui {
			    display: none !important;
			}

			body:not(.spotui-tui-hidden) .main-topBar-container,
			body:not(.spotui-tui-hidden) header {
			    display: none !important;
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
let asciiEnabled = true;

function resetGrid() {
    asciiCharData.forEach(({ el, original, color }) => {
        el.textContent = original;
        el.style.color = color;
    });
}

function stopAsciiAnimation() {
    asciiEnabled = false;
    resetGrid();
}

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

    async function runGlitchByDist(duration, logic) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        await logic(withDist, maxDist);
        resetGrid();
    }

    async function burstGlitch(duration = 800) {
        const chars = [...GLITCH_CHARS];
        const steps = 8;
        await runGlitchByDist(duration, async (withDist, maxDist) => {
            for (let step = 0; step < steps; step += 1) {
                const progress = step / steps;
                withDist.forEach(({ el, original, color, dist }) => {
                    const norm = dist / maxDist;
                    const threshold = progress * 1.1;
                    if (norm < threshold + 0.12 && norm > threshold - 0.12) {
                        if (Math.random() < 0.75) {
                            el.textContent = chars[Math.floor(Math.random() * chars.length)];
                            el.style.color = `hsl(${20 + Math.random() * 35}, 100%, ${50 + Math.random() * 30}%)`;
                        }
                    } else if (norm < threshold - 0.12) {
                        el.textContent = original;
                        el.style.color = color;
                    }
                });
                await sleep(Math.floor(duration / steps));
            }
        });
    }

    async function pulseGlitch(duration = 1200) {
        const chars = [...GLITCH_CHARS];
        const waves = 3;
        const stepsPerWave = 10;
        await runGlitchByDist(duration, async (withDist, maxDist) => {
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
        });
    }

    async function implosionGlitch(duration = 900) {
        const chars = [...GLITCH_CHARS];
        const steps = 10;
        await runGlitchByDist(duration, async (withDist, maxDist) => {
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
        });
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
        const chars = [...GLITCH_CHARS];
        const steps = 20;
        const bandWidth = 0.25;
        await runGlitchByDist(duration, async (withDist, maxDist) => {
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
        });
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

    async function stageBurst() { await burstGlitch(900); }
    async function stagePulse() { await pulseGlitch(1200); }
    async function stageImplosion() { await implosionGlitch(900); }
    async function stageSpiral() { await spiralGlitch(1000); }
    async function stageFuzzWave() { await fuzzWaveGlitch(1000); }
    async function stageStatic() { await staticGlitch(700); }
    async function stageHSlashDown() { await horizontalBand(1, 800); }
    async function stageHSlashUp() { await horizontalBand(-1, 800); }
    async function stageVSlashRight() { await verticalSlice(1, 800); }
    async function stageVSlashLeft() { await verticalSlice(-1, 800); }

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
            if (!asciiEnabled || localStorage.getItem(ANIMATION_KEY) === "off") {
                await sleep(500);
                continue;
            }
            const shuffled = shuffleArray([...stageFunctions]);
            for (const stageFn of shuffled) {
                if (!asciiEnabled || localStorage.getItem(ANIMATION_KEY) === "off") break;
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

function setWallpaper(url, opacity, save = true) {
    let tui = document.getElementById("spotui-tui");
    if (!tui) return;

    let wp = document.getElementById("spotui-wallpaper");
    if (!wp) {
        wp = document.createElement("div");
        wp.id = "spotui-wallpaper";
        wp.style.position = "absolute";
        wp.style.top = "0";
        wp.style.left = "0";
        wp.style.width = "100%";
        wp.style.height = "100%";
        wp.style.zIndex = "-1";
        wp.style.backgroundSize = "cover";
        wp.style.backgroundPosition = "center";
        tui.prepend(wp);
    }
    wp.style.backgroundImage = `url("${url}")`;
    wp.style.opacity = opacity;
    tui.style.backgroundColor = "transparent";
    const children = tui.querySelectorAll(':not(#spotui-wallpaper)');
    children.forEach(c => {
        if (window.getComputedStyle(c).position === 'static') c.style.position = 'relative';
        c.style.zIndex = '1';
    });
    if (save) {
        try {
            localStorage.setItem(WP_URL_KEY, url);
            localStorage.setItem(WP_OPACITY_KEY, opacity);
        } catch {}
    }
}

function applyLyricColors() {
    try {
        const activeColor = localStorage.getItem(LYRICS_COLOR_ACTIVE);
        const inactiveColor = localStorage.getItem(LYRICS_COLOR_INACTIVE);
        const lightInactiveColor = localStorage.getItem(LYRICS_COLOR_LIGHT_INACTIVE);

        const root = document.documentElement;
        if (activeColor) root.style.setProperty("--lyrics-color-active", activeColor);
        else root.style.removeProperty("--lyrics-color-active");

        if (inactiveColor) root.style.setProperty("--lyrics-color-inactive", inactiveColor);
        else root.style.removeProperty("--lyrics-color-inactive");

        if (lightInactiveColor) root.style.setProperty("--lyrics-color-light-inactive", lightInactiveColor);
        else root.style.removeProperty("--lyrics-color-light-inactive");
    } catch (e) {
        console.error("SpoTUI: Failed to apply lyric colors", e);
    }
}

function applyPlayerBarColors() {
    try {
        const bg = localStorage.getItem(PLAYER_BAR_BG);
        const border = localStorage.getItem(PLAYER_BAR_BORDER);
        const text = localStorage.getItem(PLAYER_BAR_TEXT);

        const root = document.documentElement;
        if (bg) root.style.setProperty("--player-bar-background", bg);
        else root.style.removeProperty("--player-bar-background");

        if (border) root.style.setProperty("--player-bar-border-color", border);
        else root.style.removeProperty("--player-bar-border-color");

        if (text) root.style.setProperty("--player-bar-text-color", text);
        else root.style.removeProperty("--player-bar-text-color");
    } catch (e) {
        console.error("SpoTUI: Failed to apply player bar colors", e);
    }
}

function applyProgressBarColors() {
    try {
        const bg = localStorage.getItem(PROGRESS_BAR_BG);
        const fg = localStorage.getItem(PROGRESS_BAR_FG);

        const root = document.documentElement;
        if (bg) root.style.setProperty("--progress-bar-background", bg);
        else root.style.removeProperty("--progress-bar-background");

        if (fg) root.style.setProperty("--progress-bar-foreground", fg);
        else root.style.removeProperty("--progress-bar-foreground");
    } catch (e) {
        console.error("SpoTUI: Failed to apply progress bar colors", e);
    }
}

function applyInputColors() {
    try {
        const bg = localStorage.getItem(INPUT_BG);
        const bgHover = localStorage.getItem(INPUT_BG_HOVER);
        const text = localStorage.getItem(INPUT_TEXT);
        const border = localStorage.getItem(INPUT_BORDER);

        const root = document.documentElement;
        if (bg) root.style.setProperty("--input-bg-color", bg);
        else root.style.removeProperty("--input-bg-color");

        if (bgHover) root.style.setProperty("--input-bg-hover-color", bgHover);
        else root.style.removeProperty("--input-bg-hover-color");

        if (text) root.style.setProperty("--input-text-color", text);
        else root.style.removeProperty("--input-text-color");

        if (border) root.style.setProperty("--input-border-color", border);
        else root.style.removeProperty("--input-border-color");
    } catch (e) {
        console.error("SpoTUI: Failed to apply input colors", e);
    }
}

function setTuiMode(mode) {
    tuiMode = mode === "cli" ? "cli" : "command";
    document.body.classList.toggle("spotui-cli-mode", tuiMode === "cli");
    document.body.classList.toggle("spotui-command-mode", tuiMode !== "cli");
}

function createControlButtons() {
    const controls = document.createElement("div");
    controls.id = "spotui-controls";

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

    controls.appendChild(hideBtn);
    controls.appendChild(spotifyBtn);
    (document.getElementById("spotui-footer") || document.body).appendChild(controls);

    const backBtn = document.createElement("button");
    backBtn.id = "spotui-back-btn";
    backBtn.className = "spotui-control-btn";
    backBtn.textContent = "Back";
    backBtn.addEventListener("click", () => {
        document.body.classList.remove("spotui-search-mode", "spotui-spotify-enabled", "spotui-tui-hidden");
        spotifyBtn.textContent = "Enable Spotify";
        hideBtn.textContent = "Hide TUI";
        syncLyricsState();
    });
    document.body.appendChild(backBtn);
}

setTimeout(createControlButtons, 500);

function detectLyricsSurface() {
    return Boolean(
        document.querySelector(
            ".main-nowPlayingView-lyricsContent, .main-lyricsCinema-container, .lyrics-lyricsContainer-LyricsContainer"
        )
    );
}

function syncLyricsState() {
    if (document.body) {
        document.body.classList.toggle("spotui-lyrics-open", detectLyricsSurface());
    }
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
            () => { lyricsObserver?.disconnect(); },
            { once: true }
        );
    }
}

function applyThemeByName(themeName, opts = {}) {
    const skipNonTui = Boolean(opts.skipNonTui);
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${THEME_HOST}themes.js?_=${Math.floor(Date.now() / 1000)}`;

        script.onload = () => {
            try {
                resetAllSettings();
                const themes = window.spotuiThemes || [];
                const theme = themes.find((t) => t.name === themeName);

                if (theme && theme.commands) {
                    theme.commands.forEach((cmd, idx) => {
                        const text = String(cmd || "").trim();
                        if (skipNonTui && !text.startsWith("tui")) return;
                        setTimeout(() => execute(cmd, { bypassOnboarding: skipNonTui }), idx * 120);
                    });
                }
                resolve(theme || null);
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(script);
            }
        };

        script.onerror = () => {
            document.body.removeChild(script);
            reject(new Error("Failed to load themes"));
        };

        document.body.appendChild(script);
    });
}

function encodeThemeName(name) {
    try {
        return btoa(unescape(encodeURIComponent(String(name || ""))));
    } catch (e) {
        return "";
    }
}

function getThemeSelectionList(themes, showAll = false) {
    if (showAll) return themes;

    const curated = themes.filter((theme) => {
        const themeId = String(theme?.id || "");
        const encodedName = encodeThemeName(theme?.name);
        return FIRST_BOOT_THEME_IDS.has(themeId) || FIRST_BOOT_THEME_IDS.has(encodedName);
    });

    if (curated.length) return curated;
    return themes.slice(0, 3);
}

function markLaunched() {
    try { localStorage.setItem(LAUNCHED_KEY, "1"); } catch (e) {}
}

function isFirstBoot() {
    try { return localStorage.getItem(LAUNCHED_KEY) !== "1"; } catch (e) { return true; }
}

function closeOnboardingPanel() {
    onboardingPanelOpen = false;
    onboardingStage = "commands";
    onboardingShowAllThemes = false;
    document.body.classList.remove("spotui-onboarding-panel");
    const panel = document.getElementById("spotui-onboarding-panel");
    if (panel) panel.hidden = true;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
    document.removeEventListener("keydown", handleGlobalEsc);
}

function showRestartPopup(message = "Wait 5 seconds and relaunch Spotify", persistSession = false) {
    const existing = document.getElementById("spotui-restart-popup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.id = "spotui-restart-popup";
    popup.textContent = message;
    popup.style.position = "fixed";
    popup.style.left = "50%";
    popup.style.bottom = "120px";
    popup.style.transform = "translateX(-50%)";
    popup.style.zIndex = "10000";
    popup.style.background = "rgba(0,0,0,0.92)";
    popup.style.border = "1px solid #ff8c42";
    popup.style.borderRadius = "6px";
    popup.style.padding = "12px 16px";
    popup.style.color = "#ff8c42";
    popup.style.fontFamily = "\"JetBrains Mono\", monospace";
    popup.style.fontSize = "14px";
    popup.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    document.body.appendChild(popup);
    if (persistSession) {
        try { sessionStorage.setItem("spotui:restart-popup", message); } catch (e) {}
    }
}

function openOnboardingPanel() {
    if (onboardingPanelOpen) return;
    closeActivePanel();
    onboardingPanelOpen = true;
    document.body.classList.add("spotui-onboarding-panel");
    const panel = document.getElementById("spotui-onboarding-panel");
    if (panel) panel.hidden = false;
    const input = document.getElementById("spotui-input");
    if (input) input.blur();
    document.addEventListener("keydown", handleGlobalEsc);
}

function renderOnboardingPanel() {
    const panel = document.getElementById("spotui-onboarding-panel");
    if (!panel) return;

    panel.innerHTML = "<p>Loading first boot...</p>";

    const script = document.createElement("script");
    script.src = `${THEME_HOST}themes.js?_=${Math.floor(Date.now() / 1000)}`;

    script.onload = () => {
        const themes = getThemeSelectionList(window.spotuiThemes || [], onboardingShowAllThemes);
        const themeCards = themes.map((theme) => `
            <button class="spotui-onboarding-theme" data-theme-name="${theme.name}">
                <img src="${theme.screenshot_url}" alt="${theme.name} screenshot">
                <span>${theme.name}</span>
            </button>
        `).join("");

        if (onboardingStage === "commands") {
            panel.innerHTML = `
                <div class="spotui-onboarding-stage">
                    <div class="spotui-onboarding-copy">
                        <div class="spotui-onboarding-kicker">Onboarding · stage 1</div>
                        <h2>Learn commands.</h2>
                        <p>These are some of the most common commands you can use, try them out!</p>
                    </div>
                    <div class="spotui-onboarding-primer">
                        <div class="help-item"><span class="command">p</span><span class="description">Play / pause</span></div>
                        <div class="help-item"><span class="command">v 50</span><span class="description">Set volume to 50%</span></div>
                        <div class="help-item"><span class="command">loop</span><span class="description">Loop current playlist</span></div>
                    </div>
                    <div class="spotui-onboarding-callout">
                        <div class="arrow">↙</div>
                        <div>Enter <code>p</code> to play and pause.</div>
                    </div>
                    <div class="spotui-onboarding-actions centered">
                        <button id="spotui-onboarding-next" class="spotui-control-btn">Next</button>
                    </div>
                </div>
            `;
            document.getElementById("spotui-onboarding-next")?.addEventListener("click", () => {
                onboardingStage = "themes";
                renderOnboardingPanel();
            });
        } else if (onboardingStage === "themes") {
            panel.innerHTML = `
                <div class="spotui-onboarding-stage">
                    <div class="spotui-onboarding-copy">
                        <div class="spotui-onboarding-kicker">Onboarding · stage 2</div>
                        <h2>Pick theme.</h2>
                        <p>These are some of the most popular themes. Choose the one that fits your style!</p>
                        <p>You dont like the top 3? Click "View all" to see more themes.</p>
                        <p>Don't worry, you can change theme any time with <code>theme</code>.</p>
                    </div>
                    <div class="theme-grid spotui-onboarding-grid">${themeCards}</div>
                    <div class="spotui-onboarding-actions centered">
                        <button id="spotui-onboarding-view-all" class="spotui-control-btn">View all</button>
                    </div>
                </div>
            `;
            panel.querySelectorAll(".spotui-onboarding-theme").forEach((button) => {
                button.addEventListener("click", () => {
                    const themeName = button.dataset.themeName;
                    if (!themeName) return;
                    onboardingStage = "theme-picked";
                    renderOnboardingPanel();
                    setTimeout(() => {
                        applyThemeByName(themeName, { skipNonTui: true }).catch(() => {});
                    }, 50);
                });
            });
            const viewAllBtn = document.getElementById("spotui-onboarding-view-all");
            if (viewAllBtn && !onboardingShowAllThemes) {
                viewAllBtn.addEventListener("click", () => {
                    onboardingShowAllThemes = true;
                    renderOnboardingPanel();
                });
            } else if (viewAllBtn) {
                viewAllBtn.remove();
            }
        } else if (onboardingStage === "theme-picked") {
            panel.innerHTML = `
                <div class="spotui-onboarding-stage">
                    <div class="spotui-onboarding-copy">
                        <div class="spotui-onboarding-kicker">Onboarding · stage 3</div>
                        <h2>Theme applied.</h2>
                        <p>You can change theme any time with <code>theme</code>.</p>
                    </div>
                    <div class="spotui-onboarding-actions centered">
                        <button id="spotui-onboarding-continue" class="spotui-control-btn">Continue</button>
                    </div>
                </div>
            `;
            document.getElementById("spotui-onboarding-continue")?.addEventListener("click", () => {
                onboardingStage = "done";
                renderOnboardingPanel();
            });
        } else {
            markLaunched();
            panel.innerHTML = `
                <div class="spotui-onboarding-stage">
                    <div class="spotui-onboarding-copy">
                        <div class="spotui-onboarding-kicker">Onboarding · stage 4</div>
                        <h2>Ready.</h2>
                        <p>Enter <code>list</code> or <code>playlist</code> to open menu for playlists.</p>
                        <br>
                        <p>Note: You must run one of the commands above to finish onboarding!</p>
                        <p>After finishing onboarding, feel free to explore all the commands with <code>help</code>.</p>
                    </div>
                </div>
            `;
        }

        document.body.removeChild(script);
    };

    script.onerror = () => {
        panel.innerHTML = `
            <div class="spotui-onboarding-copy">
                <div class="spotui-onboarding-kicker">Onboarding · stage 5</div>
                <h2>Theme feed failed.</h2>
                <p>Try again in a moment. Launch stays locked until theme pick works.</p>
                <p>This may happen if you have been ratelimited, wait a few seconds and click the retry button below.</p>
            </div>
            <div class="spotui-onboarding-actions centered">
                <button id="spotui-onboarding-retry" class="spotui-control-btn">Retry</button>
            </div>
        `;
        document.getElementById("spotui-onboarding-retry")?.addEventListener("click", () => renderOnboardingPanel());
        document.body.removeChild(script);
    };

    document.body.appendChild(script);
}

async function launchFirstBootIfNeeded() {
    if (!isFirstBoot()) return;
    openOnboardingPanel();
    onboardingStage = "commands";
    onboardingShowAllThemes = false;
    renderOnboardingPanel();
}

function createTerminal() {
    const box = document.createElement("div");
    box.id = "spotui-tui";
    setTuiMode("command");
    box.innerHTML = `
<div id="spotui-logo"></div>
<div id="spotui-top-fade"></div>
<div id="spotui-lyrics" hidden>
<div class="spotui-lyrics-viewport">
<div class="spotui-lyrics-lines"></div>
<div class="spotui-lyrics-fade spotui-lyrics-fade-bottom"></div>
</div>
</div>
<div id="spotui-playlist-panel" hidden>
    <fieldset id="spotui-playlist-list">
        <legend>Playlists</legend>
    </fieldset>
    <fieldset id="spotui-song-list">
        <legend>Songs</legend>
    </fieldset>
</div>
<div id="spotui-help-panel" hidden></div>
<div id="spotui-about-panel" hidden></div>
<div id="spotui-theme-panel" hidden></div>
<div id="spotui-onboarding-panel" hidden></div>
<div id="spotui-footer">
<span class="prompt">></span>
<input id="spotui-input" autofocus placeholder="type help for a list of commands">
</div>
`;
    document.body.appendChild(box);
    initAsciiAnimation();

    const input = document.getElementById("spotui-input");
    input.addEventListener("keydown", async (e) => {
        if (playlistPanelOpen || themePanelOpen || helpPanelOpen || aboutPanelOpen) {
            e.stopImmediatePropagation();
            return;
        }
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

function print(text) {}

async function runPlayerAction(actionName, promiseFn, successMsg) {
    try {
        await promiseFn();
    } catch (err) {}
}

function getAllowedOnboardingCommands() {
    if (!onboardingPanelOpen) return null;
    if (onboardingStage === "done") return new Set(["p", "v", "loop", "list", "playlist"]);
    return new Set(["p", "v", "loop"]);
}

async function execute(cmd, opts = {}) {
    const rawCmd = cmd.trim();
    const cleanedCmd = rawCmd.startsWith("/") || rawCmd.startsWith(".") ? rawCmd.slice(1).trim() : rawCmd;
    const [command, ...args] = cleanedCmd.split(/\s+/);
    const argText = args.join(" ").trim();
    const allowedOnboardingCommands = opts.bypassOnboarding ? null : getAllowedOnboardingCommands();
    if (allowedOnboardingCommands && !allowedOnboardingCommands.has(command)) return;

    function toggleLogo(state) {
        if (state === "on") {
            document.body.classList.remove("logo-off");
            document.body.classList.add("logo-on");
            localStorage.setItem("spotui:logo-visible", "on");
        } else if (state === "off") {
            document.body.classList.remove("logo-on");
            document.body.classList.add("logo-off");
            localStorage.setItem("spotui:logo-visible", "off");
        }
    }

    if (command === "tui") {
        if (args.includes("-l") && args.includes("-a")) {
            const state = args[args.length - 1];
            if (state === "off") {
                asciiEnabled = false;
                resetGrid();
                try { localStorage.setItem(ANIMATION_KEY, "off"); } catch(e) {}
            } else if (state === "on") {
                asciiEnabled = true;
                try { localStorage.removeItem(ANIMATION_KEY); } catch(e) {}
            }
            return;
        }
        if (args[0] === "-l") {
            const state = args[1];
            if (state === "on" || state === "off") {
                toggleLogo(state);
            }
            return;
        }
        if (args.includes("-wp")) {
            const urlIdx = args.indexOf("-wp") + 1;
            const url = args[urlIdx];
            if (url === "off") {
                const wp = document.getElementById("spotui-wallpaper");
                if (wp) wp.remove();
                localStorage.removeItem(WP_URL_KEY);
                localStorage.removeItem(WP_OPACITY_KEY);
                return;
            }
            if (url) {
                let opacity = "1";
                const oIdx = args.indexOf("-o");
                if (oIdx !== -1 && args[oIdx + 1]) opacity = args[oIdx + 1];
                setWallpaper(url, opacity);
            }
            return;
        }
        if (args.includes("-t")) {
            const tIndex = args.indexOf("-t");
            if (args[tIndex+1] === "pull" && args[tIndex+2]) {
                const base64Name = args[tIndex+2];
                try {
                    const themeName = atob(base64Name);
                    applyThemeByName(themeName);
                } catch (e) {}
            }
            return;
        }
        if (args.includes("-ly") && args.includes("-cp")) {
            if (args.includes("off")) {
                localStorage.removeItem(LYRICS_COLOR_ACTIVE);
                localStorage.removeItem(LYRICS_COLOR_INACTIVE);
                localStorage.removeItem(LYRICS_COLOR_LIGHT_INACTIVE);
            } else {
                const activeIndex = args.indexOf("-active");
                const inactiveIndex = args.indexOf("-inactive");
                const nearIndex = args.indexOf("-near");

                if (activeIndex !== -1) localStorage.setItem(LYRICS_COLOR_ACTIVE, args[activeIndex + 1]);
                if (inactiveIndex !== -1) localStorage.setItem(LYRICS_COLOR_INACTIVE, args[inactiveIndex + 1]);
                if (nearIndex !== -1) localStorage.setItem(LYRICS_COLOR_LIGHT_INACTIVE, args[nearIndex + 1]);
            }
            applyLyricColors();
            return;
        }
        if (args.includes("-bar")) {
            if (args.includes("off")) {
                localStorage.removeItem(PLAYER_BAR_BG);
                localStorage.removeItem(PLAYER_BAR_BORDER);
                localStorage.removeItem(PLAYER_BAR_TEXT);
            } else {
                const bgIndex = args.indexOf("-bg");
                const borderIndex = args.indexOf("-border");
                const textIndex = args.indexOf("-text");

                if (bgIndex !== -1) localStorage.setItem(PLAYER_BAR_BG, args[bgIndex + 1]);
                if (borderIndex !== -1) localStorage.setItem(PLAYER_BAR_BORDER, args[borderIndex + 1]);
                if (textIndex !== -1) localStorage.setItem(PLAYER_BAR_TEXT, args[textIndex + 1]);
            }
            applyPlayerBarColors();
            return;
        }
        if (args.includes("-progress")) {
            if (args.includes("off")) {
                localStorage.removeItem(PROGRESS_BAR_BG);
                localStorage.removeItem(PROGRESS_BAR_FG);
            } else {
                const bgIndex = args.indexOf("-bg");
                const fgIndex = args.indexOf("-fg");

                if (bgIndex !== -1) localStorage.setItem(PROGRESS_BAR_BG, args[bgIndex + 1]);
                if (fgIndex !== -1) localStorage.setItem(PROGRESS_BAR_FG, args[fgIndex + 1]);
            }
            applyProgressBarColors();
            return;
        }
        if (args.includes("-inputs")) {
            if (args.includes("off")) {
                localStorage.removeItem(INPUT_BG);
                localStorage.removeItem(INPUT_BG_HOVER);
                localStorage.removeItem(INPUT_TEXT);
                localStorage.removeItem(INPUT_BORDER);
            } else {
                const bgIndex = args.indexOf("-bg");
                const bgHoverIndex = args.indexOf("-bg-hover");
                const textIndex = args.indexOf("-text");
                const borderIndex = args.indexOf("-border");

                if (bgIndex !== -1) localStorage.setItem(INPUT_BG, args[bgIndex + 1]);
                if (bgHoverIndex !== -1) localStorage.setItem(INPUT_BG_HOVER, args[bgHoverIndex + 1]);
                if (textIndex !== -1) localStorage.setItem(INPUT_TEXT, args[textIndex + 1]);
                if (borderIndex !== -1) localStorage.setItem(INPUT_BORDER, args[borderIndex + 1]);
            }
            applyInputColors();
            return;
        }
        if (args[0] === "restore") {
            const fullRestore = args[1] === "-full";
            const launchedValue = localStorage.getItem(LAUNCHED_KEY);
            localStorage.clear();
            if (!fullRestore && launchedValue !== null) {
                localStorage.setItem(LAUNCHED_KEY, launchedValue);
            }
            showRestartPopup("Wait 5 seconds and relaunch Spotify", true);
            setTimeout(() => location.reload(), 100);
            return;
        }
        return;
    }

    if (command === "help") { openHelpPanel(); return; }
    if (command === "about") { openAboutPanel(); return; }
    if (command === "playlist" || command === "list") { openPlaylistPanel(); return; }
    if (command === "theme") { openThemePanel(); return; }

    const playerMap = {
        play: { fn: () => { if (!Spicetify.Player.isPlaying()) Spicetify.Player.togglePlay(); }, name: "Play" },
        pause: { fn: () => { if (Spicetify.Player.isPlaying()) Spicetify.Player.togglePlay(); }, name: "Pause" },
        p: { fn: () => { const p = Spicetify.Player.isPlaying(); Spicetify.Player.togglePlay(); return p; }, name: "Play/PauseToggle" },
        skip: { fn: () => Spicetify.Player.next(), name: "Skip" },
        back: { fn: () => Spicetify.Player.back(), name: "Back" },
        shuffle: { fn: () => { const s = Spicetify.Player.getShuffle(); Spicetify.Player.setShuffle(!s); return s; }, name: "Shuffle" },
        like: { fn: async () => { const h = await Spicetify.Player.getHeart(); await Spicetify.Player.toggleHeart(); return h; }, name: "Like" }
    };

    if (playerMap[command]) {
        const act = playerMap[command];
        try { await act.fn(); } catch {}
        return;
    }

    if (command === "search") {
        document.body.classList.add("spotui-search-mode", "spotui-tui-hidden");
        syncLyricsState();
        return;
    }

    if (command === "seek" || command === "s") {
        try {
            if (!argText) return;
            const parts = argText.split(':').map(Number);
            if (parts.length !== 2 || parts.some(isNaN)) return;
            Spicetify.Player.seek((parts[0] * 60 + parts[1]) * 1000);
        } catch {}
        return;
    }

    if (command === "volume" || command === "v") {
        try {
            if (!argText) return;
            const percent = Number(argText);
            if (!Number.isFinite(percent) || percent < 0 || percent > 100) return;
            Spicetify.Player.setVolume(percent / 100);
        } catch {}
        return;
    }

    if (command === "loop") { handleRepeatCommand("loop", argText); return; }
    if (command === "superloop") { handleRepeatCommand("superloop", argText); return; }
    if (command === "lyrics") { handleLyricsCommand(argText); return; }
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

let playlistPanelOpen = false;
let playlists = [];
let playlistSongs = [];
let selectedPlaylist = 0;
let selectedSong = 0;
let activePane = 'playlist';
let helpPanelOpen = false;
let aboutPanelOpen = false;
let themePanelOpen = false;
let onboardingPanelOpen = false;
let onboardingStage = "commands";
let onboardingShowAllThemes = false;

const COMMAND_LIST = [
    { cmd: "tui -l &lt;on/off&gt;", desc: "Toggle ASCII logo visibility" },
    { cmd: "tui -l -a &lt;on/off&gt;", desc: "Toggle ASCII animation" },
    { cmd: "tui -wp &lt;url&gt; [-o &lt;opacity&gt;]", desc: "Set wallpaper (opacity 0-1)" },
    { cmd: "tui -wp off", desc: "Remove wallpaper" },
    { cmd: "tui -t pull &lt;theme_id&gt;", desc: "Apply a theme by its ID (you can find the id on our website)" },
    { cmd: "tui -ly -cp -active &lt;#hex&gt; -inactive &lt;#hex&gt; -near &lt;#hex&gt;", desc: "Set lyrics colors" },
    { cmd: "tui -ly -cp off", desc: "Reset lyrics colors" },
    { cmd: "tui -bar -bg &lt;#hex&gt; -border &lt;#hex&gt; -text &lt;#hex&gt;", desc: "Set player bar colors" },
    { cmd: "tui -bar off", desc: "Reset player bar colors" },
    { cmd: "tui -progress -bg &lt;#hex&gt; -fg &lt;#hex&gt;", desc: "Set progress bar colors" },
    { cmd: "tui -progress off", desc: "Reset progress bar colors" },
    { cmd: "tui -inputs -bg &lt;#hex&gt; -bg-hover &lt;#hex&gt; -text &lt;#hex&gt; -border &lt;#hex&gt;", desc: "Set input colors" },
    { cmd: "tui -inputs off", desc: "Reset input colors" },
    { cmd: "playlist / list", desc: "Open playlist viewer" },
    { cmd: "play / pause / p", desc: "Toggle playback" },
    { cmd: "skip", desc: "Next track" },
    { cmd: "back", desc: "Previous track" },
    { cmd: "s / seek <mm:ss>", desc: "Jump to a specific time" },
    { cmd: "v / volume <%>", desc: "Set volume" },
    { cmd: "shuffle", desc: "Toggle shuffle" },
    { cmd: "loop / superloop", desc: "Toggle repeat mode" },
    { cmd: "like", desc: "Like/unlike current song" },
    { cmd: "lyrics", desc: "Toggle lyrics panel" },
    { cmd: "search", desc: "Open Spotify search" },
    { cmd: "about", desc: "Show about panel" },
    { cmd: "theme", desc: "Browse and apply themes" },
    { cmd: "help", desc: "Show this panel" },
];

function handleGlobalEsc(e) {
    if (e.key !== "Escape") return;
    if (onboardingPanelOpen) {
        e.preventDefault();
        return;
    }
    e.preventDefault();
    closeActivePanel();
}

function closeActivePanel() {
    if (helpPanelOpen) setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", false);
    if (aboutPanelOpen) setPanelState("spotui-about-panel", "spotui-about-panel", "aboutPanelOpen", false);
    if (lyricsPanelOpen) closeLyricsPanel();
    if (playlistPanelOpen) closePlaylistPanel();
    if (themePanelOpen) closeThemePanel();
    if (onboardingPanelOpen) closeOnboardingPanel();
}

function setPanelState(panelId, className, openVarName, targetState) {
    const panels = {
        'helpPanelOpen': () => helpPanelOpen = targetState,
        'aboutPanelOpen': () => aboutPanelOpen = targetState,
        'themePanelOpen': () => themePanelOpen = targetState,
        'onboardingPanelOpen': () => onboardingPanelOpen = targetState,
    };
    if (panels[openVarName]) panels[openVarName]();
    document.body.classList.toggle(className, targetState);
    const panel = document.getElementById(panelId);
    if (panel) panel.hidden = !targetState;
    const input = document.getElementById("spotui-input");
    if (input) {
        if (targetState) input.blur();
        else input.focus();
    }
    if (targetState) document.addEventListener("keydown", handleGlobalEsc);
    else document.removeEventListener("keydown", handleGlobalEsc);
}

function openHelpPanel() {
    if (helpPanelOpen) { setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", false); return; }
    closeActivePanel();

    setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", true);
    const panel = document.getElementById("spotui-help-panel");
    if (panel) {
        panel.innerHTML = COMMAND_LIST.map(
            item => `<div class="help-item"><span class="command">${item.cmd}</span><span class="description">${item.desc}</span></div>`
        ).join('');
    }
}

function openAboutPanel() {
    if (aboutPanelOpen) { setPanelState("spotui-about-panel", "spotui-about-panel", "aboutPanelOpen", false); return; }
    closeActivePanel();

    setPanelState("spotui-about-panel", "spotui-about-panel", "aboutPanelOpen", true);
    const panel = document.getElementById("spotui-about-panel");
    if (panel) {
        panel.innerHTML = `
<div class="help-item"><span class="command">Developer</span><span class="description">SkenS</span></div>
<div class="help-item"><span class="command">Repository</span><span class="description"><a href="https://github.com/SkenSMasteR/SpoTUI">https://github.com/SkenSMasteR/SpoTUI</a></span></div>
<div class="help-item"><span class="command">Docs</span><span class="description"><a href="https://skensmaster.github.io/SpoTUI-Docs/">https://skensmaster.github.io/SpoTUI-Docs/</a></span></div>
<div class="help-item"><span class="command">Contact</span><span class="description"><a href="mailto:receive@gmx.us">receive@gmx.us</a></span></div>
        `;
    }
}

function closePlaylistPanel() {
    playlistPanelOpen = false;
    document.body.classList.remove("spotui-playlist-panel");
    const panel = document.getElementById("spotui-playlist-panel");
    if (panel) panel.hidden = true;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
    document.removeEventListener("keydown", handlePlaylistPanelKeydown);
}

async function openPlaylistPanel() {
    if (playlistPanelOpen) { closePlaylistPanel(); return; }
    closeActivePanel();

    try {
        playlists = await getPlaylists();
    } catch (err) {
        print("Playlist error: " + err.message);
        return;
    }

    playlistPanelOpen = true;
    document.body.classList.add("spotui-playlist-panel");
    const panel = document.getElementById("spotui-playlist-panel");
    if (panel) panel.hidden = false;

    const input = document.getElementById("spotui-input");
    if (input) input.blur();

    selectedPlaylist = 0;
    selectedSong = 0;
    activePane = 'playlist';

    await renderPlaylistPanel();
    document.addEventListener("keydown", handlePlaylistPanelKeydown);
}


function closeThemePanel() {
    setPanelState("spotui-theme-panel", "spotui-theme-panel", "themePanelOpen", false);
}

async function openThemePanel() {
    if (themePanelOpen) { closeThemePanel(); return; }
    closeActivePanel();

    setPanelState("spotui-theme-panel", "spotui-theme-panel", "themePanelOpen", true);
    const panel = document.getElementById("spotui-theme-panel");
    if (!panel) return;

    panel.innerHTML = "<p>Loading themes...</p>";

    const script = document.createElement('script');
    script.src = `${THEME_HOST}themes.js?_=${Math.floor(Date.now() / 1000)}`;

    script.onload = () => {
        const themes = window.spotuiThemes || [];
        panel.innerHTML = `
            <div style="margin-bottom: 20px; display: flex;">
                <input id="spotui-theme-search" placeholder="Search themes..." style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #ff8c42; border-radius: 4px; color: #ddd; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 14px;">
            </div>
            <div class="theme-grid"></div>
        `;
        const grid = panel.querySelector('.theme-grid');
        const searchInput = document.getElementById('spotui-theme-search');

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = grid.querySelectorAll('.theme-card');
            cards.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase();
                if (title) {
                    card.style.display = title.includes(searchTerm) ? '' : 'none';
                }
            });
        });

        const createCard = document.createElement('div');
        createCard.className = 'theme-card';
        createCard.innerHTML = `
            <h3>Add yours</h3>
            <img src="https://imgs.search.brave.com/2VYp5kTKXFu84NcOgmYXQM8zyBByOalm9xwmIOX4Lp8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZs/YXRpY29uLmNvbS8x/MjgvOTU5Ni85NTk2/MTU2LnBuZw" alt="Add Theme">
            <button>Add</button>
        `;
        createCard.querySelector('button').addEventListener('click', () => {
            window.open('https://spotui.root.sx/', '_blank');
        });
        grid.appendChild(createCard);


        themes.forEach(theme => {
            const card = document.createElement('div');
            card.className = 'theme-card';
            card.innerHTML = `
                <h3>${theme.name}</h3>
                <img src="${theme.screenshot_url}" alt="${theme.name} screenshot">
                <button data-commands='${JSON.stringify(theme.commands)}'>Apply</button>
            `;
            grid.appendChild(card);
        });

        grid.addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.commands) {
                resetAllSettings();
                const commands = JSON.parse(e.target.dataset.commands);
                commands.forEach(cmd => execute(cmd));
                closeThemePanel();
            }
        });

        document.body.removeChild(script);
    };

    script.onerror = () => {
        panel.innerHTML = `
            <div style="margin-bottom: 20px; display: flex;">
                 <input id="spotui-theme-search" placeholder="Search themes..." style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #ff8c42; border-radius: 4px; color: #ddd; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 14px;" disabled>
            </div>
            <p>¯\\_(ツ)_/¯</p><p>Error loading themes. The server may be down or you are rate-limited. Please wait and try again.</p>
        `;
        const grid = document.createElement('div');
        grid.className = 'theme-grid';

        const createCard = document.createElement('div');
        createCard.className = 'theme-card';
        createCard.innerHTML = `
            <h3>Add yours</h3>
            <img src="https://imgs.search.brave.com/qsWzCiBrdeOE9PQmFvp0eS0rfLyVkcm97DyHxEXGNBk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLm1h/Z25pZmljLmNvbS8y/NTYvMTAwODQvMTAw/ODQzOTAucG5nP3Nl/bXQ9YWlzX3doaXRl/X2xhYmVs" alt="Add Theme">
            <button>Add</button>
        `;
        createCard.querySelector('button').addEventListener('click', () => {
            window.open('https://spotui.root.sx/', '_blank');
        });
        grid.appendChild(createCard);
        panel.appendChild(grid);
        document.body.removeChild(script);
    };

    document.body.appendChild(script);
}


async function renderPlaylistPanel() {
    const playlistList = document.getElementById("spotui-playlist-list");
    const songList = document.getElementById("spotui-song-list");
    if (!playlistList || !songList) return;

    playlistList.innerHTML = "";
    playlists.forEach((p, idx) => {
        const item = document.createElement("div");
        item.className = "playlist-item" + (idx === selectedPlaylist ? " selected" : "");
        item.textContent = p.name;
        playlistList.appendChild(item);
    });

    const selectedPlaylistUri = playlists[selectedPlaylist]?.uri;
    if (selectedPlaylistUri) {
        try {
            const res = await Spicetify.Platform.PlaylistAPI.getContents(selectedPlaylistUri);
            playlistSongs = (res.items || [])
                .filter(item => item && item.uri && item.isPlayable !== false)
                .map((item, index) => normalizeTrackItem(item, index));
        } catch (err) {
            playlistSongs = [{ name: "Error loading songs", artist: "" }];
        }
    } else {
        playlistSongs = [];
    }

    songList.innerHTML = "";
    playlistSongs.forEach((s, idx) => {
        const item = document.createElement("div");
        item.className = "song-item" + (idx === selectedSong && activePane === 'song' ? " selected" : "");
        item.textContent = `${s.name} - ${s.artist}`;
        songList.appendChild(item);
    });

    scrollSelectedIntoView();
}

function scrollSelectedIntoView() {
    const selectedItem = document.querySelector(activePane === 'playlist' ? '.playlist-item.selected' : '.song-item.selected');
    if (selectedItem) selectedItem.scrollIntoView({ block: 'nearest' });
}

async function handlePlaylistPanelKeydown(e) {
    if (e.key === "Escape") {
        e.preventDefault();
        closePlaylistPanel();
        return;
    }

    const isPlaylist = activePane === 'playlist';
    if (e.key === "ArrowUp") {
        e.preventDefault();
        if (isPlaylist && playlists.length) selectedPlaylist = (selectedPlaylist - 1 + playlists.length) % playlists.length;
        if (!isPlaylist && playlistSongs.length) selectedSong = (selectedSong - 1 + playlistSongs.length) % playlistSongs.length;
        await renderPlaylistPanel();
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (isPlaylist && playlists.length) selectedPlaylist = (selectedPlaylist + 1) % playlists.length;
        if (!isPlaylist && playlistSongs.length) selectedSong = (selectedSong + 1) % playlistSongs.length;
        await renderPlaylistPanel();
    } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        activePane = 'playlist';
        await renderPlaylistPanel();
    } else if (e.key === "ArrowRight") {
        e.preventDefault();
        activePane = 'song';
        await renderPlaylistPanel();
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (isPlaylist) {
            const p = playlists[selectedPlaylist];
            if (p) {
                Spicetify.Player.playUri(p.uri);
                print("Playing playlist: " + p.name);
                closePlaylistPanel();
            }
        } else {
            const song = playlistSongs[selectedSong];
            const context = playlists[selectedPlaylist];
            if (song && context) {
                Spicetify.Player.playUri(context.uri, {}, { skipTo: { uri: song.uri } });
                print(`Playing: ${song.name} from ${context.name}`);
                closePlaylistPanel();
            }
        }
    }
}

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

        if (arg === "on") nextMode = targetMode;
        else if (arg === "off") nextMode = 0;
        else if (arg === "") nextMode = current === targetMode ? 0 : targetMode;
        else return;

        Spicetify.Player.setRepeat(nextMode);
    } catch (err) {}
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

const LYRICS_STORAGE_KEY = "spotui:lyrics-open";
const WP_URL_KEY = "spotui:wp-url";
const WP_OPACITY_KEY = "spotui:wp-opacity";
const LYRICS_COLOR_ACTIVE = "spotui:lyrics-color-active";
const LYRICS_COLOR_INACTIVE = "spotui:lyrics-color-inactive";
const LYRICS_COLOR_LIGHT_INACTIVE = "spotui:lyrics-color-light-inactive";
const PLAYER_BAR_BG = "spotui:player-bar-bg";
const PLAYER_BAR_BORDER = "spotui:player-bar-border";
const PLAYER_BAR_TEXT = "spotui:player-bar-text";
const PROGRESS_BAR_BG = "spotui:progress-bar-bg";
const PROGRESS_BAR_FG = "spotui:progress-bar-fg";
const INPUT_BG = "spotui:input-bg";
const INPUT_BG_HOVER = "spotui:input-bg-hover";
const INPUT_TEXT = "spotui:input-text";
const INPUT_BORDER = "spotui:input-border";
const LAUNCHED_KEY = "spotui:launched";
const FIRST_BOOT_THEME_IDS = new Set([
    "U3BvVFVJIC0gRGVmYXVsdA==",
    "QXR0YWNrIG9uIFRpdGFuIFBsdXM=",
    "SURL",
]);

let lyricsPanelOpen = false;
let lyricsLoadToken = 0;
let lyricsActiveIndex = -1;
let lyricsCache = { uri: "", lines: [], synced: false, provider: "", instrumental: false, error: "" };
let lyricsBound = false;
let lyricsSyncInterval = null;

function getLyricsEls() {
    const root = document.getElementById("spotui-lyrics");
    if (!root) return null;
    return {
        root,
        track: root.querySelector(".spotui-lyrics-track"),
        meta: root.querySelector(".spotui-lyrics-meta"),
        lines: root.querySelector(".spotui-lyrics-lines"),
    };
}

function getCurrentTrackLyricsInfo() {
    const item = Spicetify.Player?.data?.item;
    if (!item?.uri || !String(item.uri).includes(":track:")) return null;

    const track = normalizeTrackItem(item);
    const album = item.album?.name || item.metadata?.album_title || item.metadata?.album || "";
    const durationMs = Spicetify.Player.getDuration() || Number(item.duration?.milliseconds) || 0;

    return {
        uri: item.uri,
        title: track.name,
        artist: track.artist || "Unknown",
        album: album || track.name,
        durationMs,
        durationSec: Math.round(durationMs / 1000),
    };
}

function parseLrc(lrcText) {
    if (!lrcText) return [];
    const lines = [];
    for (const raw of String(lrcText).split(/\r?\n/)) {
        const stamps = [...raw.matchAll(/\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]/g)];
        if (!stamps.length) continue;
        const text = raw.replace(/\[\d{1,2}:\d{2}(?:\.\d+)?\]/g, "").trim();
        if (!text) continue;
        for (const stamp of stamps) {
            lines.push({ startTime: (Number(stamp[1]) * 60 + Number(stamp[2])) * 1000, text });
        }
    }
    lines.sort((a, b) => a.startTime - b.startTime);
    return lines;
}

function plainLyricsToLines(plainText) {
    return String(plainText || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(text => ({ startTime: -1, text }));
}

async function fetchSpotifyColorLyrics(uri) {
    if (!uri || !Spicetify.CosmosAsync?.get) return null;
    const id = uri.split(":").pop();
    if (!id) return null;
    try {
        const body = await Spicetify.CosmosAsync.get(
            `https://spclient.wg.spotify.com/color-lyrics/v2/track/${id}?format=json&vocalRemoval=false&market=from_token`
        );
        const lyrics = body?.lyrics;
        if (!lyrics?.lines?.length) return null;
        const synced = lyrics.syncType === "LINE_SYNCED";
        const lines = lyrics.lines
            .map(line => ({ startTime: synced ? Number(line.startTimeMs) || 0 : -1, text: String(line.words || "").trim() }))
            .filter(line => line.text && line.text !== "♪");
        if (!lines.length) return null;
        return { lines, synced, provider: "Spotify", instrumental: false };
    } catch { return null; }
}

async function fetchLrclibLyrics(info) {
    const headers = { "Lrclib-Client": "SpoTUI (https://github.com/SkenS/SpoTUI)" };
    const exactParams = new URLSearchParams({
        track_name: info.title,
        artist_name: info.artist.split(",")[0].trim(),
        album_name: info.album || info.title,
        duration: String(info.durationSec || 0),
    });
    try {
        const exactRes = await fetch(`https://lrclib.net/api/get?${exactParams}`, { headers });
        if (exactRes.ok) {
            const data = await exactRes.json();
            const result = normalizeLrclibPayload(data);
            if (result) return result;
        }
    } catch { }
    try {
        const searchParams = new URLSearchParams({
            track_name: info.title,
            artist_name: info.artist.split(",")[0].trim(),
        });
        const searchRes = await fetch(`https://lrclib.net/api/search?${searchParams}`, { headers });
        if (!searchRes.ok) return null;
        const results = await searchRes.json();
        if (!Array.isArray(results) || !results.length) return null;
        const target = info.durationSec || 0;
        results.sort((a, b) => {
            const da = Math.abs((a.duration || 0) - target);
            const db = Math.abs((b.duration || 0) - target);
            const syncBonus = x => x.syncedLyrics ? -0.5 : 0;
            return (da + syncBonus(a)) - (db + syncBonus(b));
        });
        return normalizeLrclibPayload(results[0]);
    } catch { return null; }
}

function normalizeLrclibPayload(data) {
    if (!data) return null;
    if (data.instrumental) return { lines: [], synced: false, provider: "lrclib", instrumental: true };
    const syncedLines = parseLrc(data.syncedLyrics);
    if (syncedLines.length) return { lines: syncedLines, synced: true, provider: "lrclib", instrumental: false };
    const plainLines = plainLyricsToLines(data.plainLyrics);
    if (plainLines.length) return { lines: plainLines, synced: false, provider: "lrclib", instrumental: false };
    return null;
}

async function resolveTrackLyrics(info) {
    const spotify = await fetchSpotifyColorLyrics(info.uri);
    if (spotify) return spotify;
    const lrclib = await fetchLrclibLyrics(info);
    if (lrclib) return lrclib;
    return { lines: [], synced: false, provider: "", instrumental: false, error: "No lyrics found" };
}

function renderLyricsEmpty(message, detail = "") {
    const els = getLyricsEls();
    if (!els?.lines) return;
    lyricsActiveIndex = -1;
    els.lines.classList.remove("unsynced");
    els.lines.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "spotui-lyrics-empty";
    empty.textContent = "¯\\_(ツ)_/¯";
    els.lines.appendChild(empty);
}

function renderLyricsLines(lines, synced = true) {
    const els = getLyricsEls();
    if (!els?.lines) return;
    els.lines.innerHTML = "";
    els.lines.classList.toggle("unsynced", !synced);
    lyricsActiveIndex = -1;
    if (!lines.length) { renderLyricsEmpty("¯\\_(ツ)_/¯"); return; }
    lines.forEach((line, idx) => {
        const row = document.createElement("div");
        row.className = "spotui-lyrics-line";
        row.dataset.index = String(idx);
        row.textContent = line.text;
        els.lines.appendChild(row);
    });
}

function findActiveLyricIndex(lines, progressMs) {
    if (!lines?.length || lines[0].startTime < 0) return -1;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startTime <= progressMs) idx = i;
        else break;
    }
    return idx;
}

function syncLyricsHighlight(force = false) {
    if (!lyricsPanelOpen || !lyricsCache.synced || !lyricsCache.lines.length) return;
    const els = getLyricsEls();
    if (!els?.lines) return;
    const progress = Spicetify.Player.getProgress() || 0;
    const next = findActiveLyricIndex(lyricsCache.lines, progress);
    if (!force && next === lyricsActiveIndex) return;
    const rows = els.lines.querySelectorAll(".spotui-lyrics-line");
    rows.forEach((row, idx) => {
        const distance = next < 0 ? 99 : Math.abs(idx - next);
        row.classList.toggle("active", idx === next);
        row.classList.toggle("near", distance === 1);
    });
    lyricsActiveIndex = next;
    if (next >= 0) rows[next]?.scrollIntoView({ block: "center", behavior: force ? "auto" : "smooth" });
}

function setLyricsHeader(info, statusText) {
    const els = getLyricsEls();
    if (!els) return;
    if (els.track) els.track.textContent = info ? `${info.title}${info.artist ? ` — ${info.artist}` : ""}` : "Nothing playing";
    if (els.meta) els.meta.textContent = statusText || "";
}

async function loadLyricsForCurrentTrack() {
    const token = ++lyricsLoadToken;
    const info = getCurrentTrackLyricsInfo();
    const els = getLyricsEls();
    if (!els) return;

    if (!info) {
        lyricsCache = { uri: "", lines: [], synced: false, provider: "", instrumental: false, error: "" };
        setLyricsHeader(null, "");
        renderLyricsEmpty("¯\\_(ツ)_/¯");
        return;
    }

    if (lyricsCache.uri === info.uri && (lyricsCache.lines.length || lyricsCache.instrumental || lyricsCache.error)) {
        setLyricsHeader(info, lyricsCache.instrumental ? "instrumental" : `${lyricsCache.synced ? "synced" : "unsynced"} · ${lyricsCache.provider || "cache"}`);
        if (lyricsCache.instrumental) renderLyricsEmpty("Instrumental", "No vocals to show for this track.");
        else if (lyricsCache.error) renderLyricsEmpty("No lyrics", lyricsCache.error);
        else { renderLyricsLines(lyricsCache.lines, lyricsCache.synced); syncLyricsHighlight(true); }
        return;
    }

    setLyricsHeader(info, "fetching…");
    renderLyricsEmpty("¯\\_(ツ)_/¯");

    const result = await resolveTrackLyrics(info);
    if (token !== lyricsLoadToken || !lyricsPanelOpen) return;

    lyricsCache = {
        uri: info.uri,
        lines: result.lines || [],
        synced: Boolean(result.synced),
        provider: result.provider || "",
        instrumental: Boolean(result.instrumental),
        error: result.error || "",
    };

    if (lyricsCache.instrumental) { setLyricsHeader(info, "instrumental"); renderLyricsEmpty("¯\\_(ツ)_/¯"); return; }
    if (!lyricsCache.lines.length) { setLyricsHeader(info, "not found"); renderLyricsEmpty("¯\\_(ツ)_/¯"); return; }
    setLyricsHeader(info, `${lyricsCache.synced ? "synced" : "unsynced"} · ${lyricsCache.provider}`);
    renderLyricsLines(lyricsCache.lines, lyricsCache.synced);
    syncLyricsHighlight(true);
}

function storeLyricsOpen(open) {
    try { localStorage.setItem(LYRICS_STORAGE_KEY, open ? "1" : "0"); } catch { }
}

function openLyricsPanel() {
    closeActivePanel();
    lyricsPanelOpen = true;
    storeLyricsOpen(true);
    document.body.classList.add("spotui-lyrics-panel");
    document.addEventListener("keydown", handleGlobalEsc);
    const root = document.getElementById("spotui-lyrics");
    if (root) {
        root.hidden = false;
        setTimeout(() => root.classList.add("spotui-lyrics-active"), 10);
    }
    bindLyricsEvents();
    loadLyricsForCurrentTrack();
    if (!lyricsSyncInterval) {
        lyricsSyncInterval = setInterval(() => syncLyricsHighlight(), 200);
    }
}

function closeLyricsPanel() {
    if (!lyricsPanelOpen) return;
    lyricsPanelOpen = false;
    lyricsLoadToken += 1;
    storeLyricsOpen(false);
    document.removeEventListener("keydown", handleGlobalEsc);
    const root = document.getElementById("spotui-lyrics");
    if (root) {
        root.classList.remove("spotui-lyrics-active");
        setTimeout(() => {
            if (!lyricsPanelOpen) {
                root.hidden = true;
                document.body.classList.remove("spotui-lyrics-panel");
            }
        }, 500);
    } else {
        document.body.classList.remove("spotui-lyrics-panel");
    }
    if (lyricsSyncInterval) { clearInterval(lyricsSyncInterval); lyricsSyncInterval = null; }
}

function bindLyricsEvents() {
    if (lyricsBound || !Spicetify.Player?.addEventListener) return;
    lyricsBound = true;
    Spicetify.Player.addEventListener("songchange", () => {
        if (!lyricsPanelOpen) return;
        lyricsCache = { uri: "", lines: [], synced: false, provider: "", instrumental: false, error: "" };
        loadLyricsForCurrentTrack();
    });
}

function handleLyricsCommand(arg) {
    const mode = String(arg || "").trim().toLowerCase();
    if (mode === "on" || mode === "open") { openLyricsPanel(); return; }
    if (mode === "off" || mode === "close") { closeLyricsPanel(); return; }
    if (mode && mode !== "toggle") return;
    if (lyricsPanelOpen) { closeLyricsPanel(); }
    else { openLyricsPanel(); }
}

function resetAllSettings() {
    const wp = document.getElementById("spotui-wallpaper");
    if (wp) wp.remove();
    localStorage.removeItem(WP_URL_KEY);
    localStorage.removeItem(WP_OPACITY_KEY);

    asciiEnabled = true;
    try { localStorage.removeItem(ANIMATION_KEY); } catch(e) {}

    try { localStorage.removeItem("spotui:logo-visible"); } catch(e) {}
    document.body.classList.remove("logo-off");

    localStorage.removeItem(LYRICS_COLOR_ACTIVE);
    localStorage.removeItem(LYRICS_COLOR_INACTIVE);
    localStorage.removeItem(LYRICS_COLOR_LIGHT_INACTIVE);
    applyLyricColors();

    localStorage.removeItem(PLAYER_BAR_BG);
    localStorage.removeItem(PLAYER_BAR_BORDER);
    localStorage.removeItem(PLAYER_BAR_TEXT);
    applyPlayerBarColors();

    localStorage.removeItem(PROGRESS_BAR_BG);
    localStorage.removeItem(PROGRESS_BAR_FG);
    applyProgressBarColors();

    localStorage.removeItem(INPUT_BG);
    localStorage.removeItem(INPUT_BG_HOVER);
    localStorage.removeItem(INPUT_TEXT);
    localStorage.removeItem(INPUT_BORDER);
    applyInputColors();
}

injectStyle();
setTimeout(initLyricsBridge, 1000);

if (localStorage.getItem("spotui:logo-visible") === "off") {
    document.body.classList.add("logo-off");
} else {
    document.body.classList.add("logo-on");
}

if (Spicetify?.Platform) createTerminal();
else setTimeout(createTerminal, 1500);

try {
    const restartMessage = sessionStorage.getItem("spotui:restart-popup");
    if (restartMessage) {
        showRestartPopup(restartMessage, false);
    }
} catch (e) {}

setTimeout(() => { launchFirstBootIfNeeded().catch(() => {}); }, 2000);

try {
    if (localStorage.getItem(LYRICS_STORAGE_KEY) === "1") {
        setTimeout(() => openLyricsPanel(), 2000);
    }
    if (localStorage.getItem(WP_URL_KEY)) {
        setTimeout(() => setWallpaper(localStorage.getItem(WP_URL_KEY), localStorage.getItem(WP_OPACITY_KEY) || "1", false), 1500);
    }
    applyLyricColors();
    applyPlayerBarColors();
    applyProgressBarColors();
    applyInputColors();
} catch { }

})();
