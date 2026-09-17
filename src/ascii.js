import { ANIMATION_KEY, GLITCH_CHARS, ORANGE_PALETTE_RGB, SPOTUI_ASCII_ART } from "./constants.js";
import { app } from "./state.js";
import { storageGet } from "./storage.js";
import { shuffleArray, sleep } from "./utils.js";

// Generate random character for glitch effects
export function randomGlitchChar() {
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

export function randomGlitchColor(minLightness = 50, lightnessRange = 30) {
    return `hsl(${20 + Math.random() * 35}, 100%, ${minLightness + Math.random() * lightnessRange}%)`;
}
export function getCharColor(row, col, totalRows, totalCols) {
    const normRow = row / Math.max(totalRows - 1, 1);
    const normCol = col / Math.max(totalCols - 1, 1);
    const mix = normRow * 0.55 + normCol * 0.45; // Weighted blend favoring vertical
    const len = ORANGE_PALETTE_RGB.length;
    const idx = Math.floor(mix * (len - 1));
    const frac = mix * (len - 1) - idx; // Fractional position for interpolation
    const i = Math.min(idx, len - 2);
    const [r1, g1, b1] = ORANGE_PALETTE_RGB[i];
    const [r2, g2, b2] = ORANGE_PALETTE_RGB[i + 1] || ORANGE_PALETTE_RGB[i];
    const r = Math.round(r1 + (r2 - r1) * frac);
    const g = Math.round(g1 + (g2 - g1) * frac);
    const b = Math.round(b1 + (b2 - b1) * frac);
    return `rgb(${r},${g},${b})`;
}

const asciiDraw = {
    canvas: null,
    ctx: null,
    cols: 0,
    rows: 0,
    pad: 20,
    fontSize: 0,
    cellW: 0,
    cellH: 0,
    dpr: 1,
    raf: 0,
};

function getAsciiFontSize() {
    const vw = window.innerWidth;
    if (vw <= 450) return Math.min(Math.max(3.5, vw * 0.014), 7);
    if (vw <= 700) return Math.min(Math.max(5, vw * 0.011), 11);
    return Math.min(Math.max(9, vw * 0.014), 22);
}

function asciiFont(size) {
    return `400 ${size}px "JetBrains Mono", "Fira Code", monospace`;
}

function layoutAsciiCanvas() {
    const { canvas, ctx, cols, rows, pad } = asciiDraw;
    if (!canvas || !ctx) return;
    const fontSize = getAsciiFontSize();
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = asciiFont(fontSize);
    ctx.fontKerning = "none";
    ctx.letterSpacing = "0px";
    const cellW = ctx.measureText("0").width;
    const cellH = fontSize;
    const cssW = pad * 2 + cols * cellW;
    const cssH = pad * 2 + rows * cellH;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    asciiDraw.fontSize = fontSize;
    asciiDraw.cellW = cellW;
    asciiDraw.cellH = cellH;
    asciiDraw.dpr = dpr;
}

function paintAsciiCanvas() {
    const { canvas, ctx, cols, rows, pad, fontSize, cellW, cellH } = asciiDraw;
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    if (dpr !== asciiDraw.dpr || fontSize !== getAsciiFontSize()) layoutAsciiCanvas();
    const cssW = pad * 2 + cols * cellW;
    const cssH = pad * 2 + rows * cellH;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.font = asciiFont(asciiDraw.fontSize);
    ctx.fontKerning = "none";
    ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fontVariantCaps = "normal";
    const chars = app.asciiCharData;
    for (let i = 0; i < chars.length; i += 1) {
        const { el, row, col } = chars[i];
        const ch = el.textContent;
        if (!ch || ch === " ") continue;
        const color = el.style.color;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(ch, pad + col * asciiDraw.cellW, pad + row * asciiDraw.cellH);
    }
}

function startAsciiPaintLoop() {
    if (asciiDraw.raf) return;
    const tick = () => {
        paintAsciiCanvas();
        asciiDraw.raf = requestAnimationFrame(tick);
    };
    asciiDraw.raf = requestAnimationFrame(tick);
}

// Reset ASCII logo animation to original state
export function resetGrid() {
    app.asciiCharData.forEach(({ el, original, color }) => {
        el.textContent = original;
        el.style.color = color;
    });
}

export function initAsciiAnimation() {
    if (app.asciiAnimationInitialized) return;
    app.asciiAnimationInitialized = true;

    const logo = document.getElementById("spotui-logo");
    if (!logo) return;

    logo.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.className = "spotui-ascii-canvas";
    canvas.setAttribute("aria-hidden", "true");
    logo.appendChild(canvas);
    asciiDraw.canvas = canvas;
    asciiDraw.ctx = canvas.getContext("2d");

    const rows = SPOTUI_ASCII_ART.length;
    const cols = Math.max(...SPOTUI_ASCII_ART.map((row) => row.length));
    asciiDraw.rows = rows;
    asciiDraw.cols = cols;
    const charData = [];
    const rowSpansCache = [];

    SPOTUI_ASCII_ART.forEach((line, rowIdx) => {
        const padded = line.padEnd(cols, " ");
        const chars = [...padded];
        const rowSpans = [];
        chars.forEach((ch, colIdx) => {
            const color = getCharColor(rowIdx, colIdx, rows, cols);
            const el = {
                textContent: ch,
                style: { color },
                dataset: {
                    row: String(rowIdx),
                    col: String(colIdx),
                    original: ch,
                    origColor: color,
                },
            };
            charData.push({
                row: rowIdx,
                col: colIdx,
                el,
                original: ch,
                color,
            });
            rowSpans.push(el);
        });
        rowSpansCache.push(rowSpans);
    });

    app.asciiCharData = charData;
    layoutAsciiCanvas();
    startAsciiPaintLoop();
    window.addEventListener("resize", layoutAsciiCanvas);
    if (document.fonts?.ready) document.fonts.ready.then(layoutAsciiCanvas);

    function getRowSpans(rowIdx) {
        return rowSpansCache[rowIdx] || [];
    }

    // Decrypt animation
    async function decryptRow(rowIdx) {
        const spans = getRowSpans(rowIdx);
        if (!spans.length) return;
        const origs = spans.map((span) => span.dataset.original || " ");
        const colors = spans.map((span) => span.dataset.origColor || "#ff8c1a");

        spans.forEach((span) => {
            span.textContent = randomGlitchChar();
        });

        const indices = Array.from({ length: spans.length }, (_, i) => i);
        shuffleArray(indices);

        const batchSize = 4;
        for (let start = 0; start < indices.length; start += batchSize) {
            const batch = indices.slice(start, start + batchSize);
            batch.forEach((idx) => {
                spans[idx].textContent = randomGlitchChar();
            });
            await sleep(8);
            batch.forEach((idx) => {
                spans[idx].textContent = origs[idx];
                spans[idx].style.color = colors[idx];
            });
            await sleep(6);
        }
    }

    // Glitch wave
    async function glitchRowWave(rowIdx, duration = 500) {
        const spans = getRowSpans(rowIdx);
        if (!spans.length) return;
        const origs = spans.map((span) => span.dataset.original || " ");
        const colors = spans.map((span) => span.dataset.origColor || "#ff8c1a");
        const steps = 8;
        for (let step = 0; step < steps; step += 1) {
            spans.forEach((span) => {
                span.textContent = randomGlitchChar();
                span.style.color = randomGlitchColor();
            });
            await sleep(Math.floor(duration / steps));
        }
        spans.forEach((span, i) => {
            span.textContent = origs[i] || " ";
            span.style.color = colors[i] || "#ff8c1a";
        });
    }

    // run glitch effect based on distance from center
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

    // Burst
    async function burstGlitch(duration = 800) {
        const steps = 8;
        await runGlitchByDist(duration, async (withDist, maxDist) => {
            for (let step = 0; step < steps; step += 1) {
                const progress = step / steps;
                withDist.forEach(({ el, original, color, dist }) => {
                    const norm = dist / maxDist;
                    const threshold = progress * 1.1;
                    if (norm < threshold + 0.12 && norm > threshold - 0.12) {
                        if (Math.random() < 0.75) {
                            el.textContent = randomGlitchChar();
                            el.style.color = randomGlitchColor();
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

    // Pulse
    async function pulseGlitch(duration = 1200) {
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
                                el.textContent = randomGlitchChar();
                                el.style.color = randomGlitchColor(55, 25);
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

    // Implosion
    async function implosionGlitch(duration = 900) {
        const steps = 10;
        await runGlitchByDist(duration, async (withDist, maxDist) => {
            withDist.forEach(({ el }) => {
                el.textContent = randomGlitchChar();
                el.style.color = randomGlitchColor(45, 35);
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

    // Spiral
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
        const steps = 36;
        const wedgeWidth = 0.5;

        for (let step = 0; step < steps; step += 1) {
            const sweepAngle = (step / steps) * Math.PI * 2 - Math.PI;
            withAngle.forEach(({ el, original, color, angle, dist }) => {
                let diff = Math.abs(angle - sweepAngle);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;
                if (diff < wedgeWidth && dist > 0.1) {
                    el.textContent = randomGlitchChar();
                    el.style.color = randomGlitchColor(55, 25);
                } else {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    // Fuzz wave
    async function fuzzWaveGlitch(duration = 1000) {
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
                        el.textContent = randomGlitchChar();
                        el.style.color = randomGlitchColor();
                    } else if (distanceFromTarget > bandWidth * 1.5) {
                        el.textContent = original;
                        el.style.color = color;
                    }
                });
                await sleep(Math.floor(duration / steps));
            }
        });
    }

    // Static
    async function staticGlitch(duration = 600) {
        const steps = 6;
        for (let step = 0; step < steps; step += 1) {
            charData.forEach(({ el }) => {
                if (Math.random() < 0.8) {
                    el.textContent = randomGlitchChar();
                    el.style.color = randomGlitchColor();
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    // Horizontal band
    // 1 = downward, -1 = upward
    async function horizontalBand(direction = 1, duration = 800) {
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
                    span.textContent = randomGlitchChar();
                    span.style.color = randomGlitchColor();
                });
            }
            await sleep(Math.floor(duration / totalSteps));
        }
        resetGrid();
    }

    // Vertical slice
    // 1 = rightward, -1 = leftward
    async function verticalSlice(direction = 1, duration = 800) {
        const start = direction === 1 ? 0 : cols - 1;
        const totalSteps = cols + 2;
        for (let step = 0; step <= totalSteps; step += 1) {
            resetGrid();
            const bandCenter = start + direction * step;
            const bandLeft = Math.max(0, bandCenter - 1);
            const bandRight = Math.min(cols - 1, bandCenter + 1);
            charData.forEach(({ el, col }) => {
                if (col >= bandLeft && col <= bandRight) {
                    el.textContent = randomGlitchChar();
                    el.style.color = randomGlitchColor();
                }
            });
            await sleep(Math.floor(duration / totalSteps));
        }
        resetGrid();
    }

    // Stage functions
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
        charData.forEach(({ el }) => {
            el.textContent = randomGlitchChar();
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

    async function runLoop() {
        while (true) {
            if (!app.asciiEnabled || storageGet(ANIMATION_KEY) === "off") {
                await sleep(500);
                continue;
            }
            const shuffled = shuffleArray([...stageFunctions]);
            for (const stageFn of shuffled) {
                if (!app.asciiEnabled || storageGet(ANIMATION_KEY) === "off") break;
                await stageFn();
                await sleep(700 + Math.random() * 400);
            }
            resetGrid();
            await sleep(300);
        }
    }

    runLoop().catch(console.error);
}
