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

#spotui-visualizer {
    position: absolute;
    inset: 0;
    display: none;
    overflow: hidden;
    pointer-events: none;
    z-index: 2;
    background:
        radial-gradient(circle at 50% 65%, rgba(255, 140, 0, 0.12), rgba(0, 0, 0, 0) 42%),
        linear-gradient(180deg, rgba(255, 69, 0, 0.08), rgba(0, 0, 0, 0));
}

#spotui-visualizer::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 140, 0, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 140, 0, 0.03) 1px, transparent 1px);
    background-size: 100% 28px, 28px 100%;
    opacity: 0.28;
}

#spotui-visualizer-fall {
    position: absolute;
    inset: 0 0 90px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    color: #ff8c00;
    white-space: pre;
    text-align: center;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 24px;
    line-height: 1;
    opacity: 0.92;
    letter-spacing: 0;
}

.spotui-viz-line {
    display: flex;
    justify-content: center;
    will-change: transform, opacity, filter;
    text-shadow: 0 0 12px rgba(255, 140, 0, 0.28);
}

.spotui-viz-char {
    display: inline-block;
    will-change: transform, opacity, filter;
}

#spotui-visualizer-bars {
    position: absolute;
    left: 50%;
    bottom: 114px;
    transform: translateX(-50%);
    width: min(92vw, 1280px);
    height: 34vh;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    opacity: 0;
    transition: opacity 220ms ease;
}

.spotui-viz-bar {
    flex: 1 1 0;
    min-width: 4px;
    max-width: 14px;
    border-radius: 999px 999px 0 0;
    background: linear-gradient(180deg, #ffa500 0%, #ff8c00 55%, #ff4500 100%);
    box-shadow:
        0 0 12px rgba(255, 140, 0, 0.36),
        inset 0 0 0 1px rgba(255, 220, 160, 0.1);
    transform-origin: bottom;
    min-height: 8px;
}

#spotui-tui.spotui-has-visualizer #spotui-visualizer {
    display: block;
}

#spotui-logo {
    position: absolute;
    left: 50%;
    top: 41%;
    transform: translate(-50%, -50%);
    color: #ff8c42;
    opacity: 0.28;
    white-space: pre;
    text-align: center;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 28px;
    line-height: 1.0;
    pointer-events: none;
    user-select: none;
    z-index: 0;
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

body.spotui-visualizer-active #spotui-output {
    opacity: 0;
    transform: translateY(0);
}

body.spotui-visualizer-active #spotui-footer {
    opacity: 0;
    transform: translateY(0);
}

body.spotui-visualizer-active #spotui-logo {
    opacity: 0;
}

body.spotui-visualizer-active #spotui-controls {
    opacity: 0;
}

body.spotui-visualizer-active #spotui-visualizer-bars {
    opacity: 1;
}

body.spotui-visualizer-active #spotui-input {
    color: rgba(255, 140, 66, 0.58);
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
    "  ██████  ██▓███   ▒█████  ▄▄▄█████▓ █    ██  ██▓",
    "▒██    ▒ ▓██░  ██▒▒██▒  ██▒▓  ██▒ ▓▒ ██  ▓██▒▓██▒",
    "░ ▓██▄   ▓██░ ██▓▒▒██░  ██▒▒ ▓██░ ▒░▓██  ▒██░▒██▒",
    "  ▒   ██▒▒██▄█▓▒ ▒▒██   ██░░ ▓██▓ ░ ▓▓█  ░██░░██░",
    "▒██████▒▒▒██▒ ░  ░░ ████▓▒░  ▒██▒ ░ ▒▒█████▓ ░██░",
    "▒ ▒▓▒ ▒ ░▒▓▒░ ░  ░░ ▒░▒░▒░   ▒ ░░   ░▒▓▒ ▒ ▒ ░▓  ",
    "░ ░▒  ░ ░░▒ ░       ░ ▒ ▒░     ░    ░░▒░ ░ ░  ▒ ░",
    "░  ░  ░  ░░       ░ ░ ░ ▒    ░       ░░░ ░ ░  ▒ ░",
    "      ░               ░ ░              ░      ░  ",
    "                                                 ",
];



let idleTimer = null;
let animeReady = null;
let visualizerRoot = null;
let visualizerFall = null;
let visualizerBars = null;
let visualizerBarEls = [];
let visualizerBarFrame = null;
let visualizerFallAnim = null;
let visualizerLineAnims = [];
let visualizerBarsTimer = null;
let visualizerActive = false;
let visualizerRequested = false;
let playbackWatcher = null;
let playbackIsPlaying = false;
let tuiMode = "command";
let visualizerAudioContext = null;
let visualizerAudioSource = null;
let visualizerAnalyser = null;
let visualizerAudioData = null;
let visualizerAudioElement = null;

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

function loadAnime() {
    if (window.anime) return Promise.resolve(window.anime);
    if (animeReady) return animeReady;

    animeReady = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-spotui-anime="1"]');
        if (existing) {
            existing.addEventListener("load", () => resolve(window.anime), { once: true });
            existing.addEventListener("error", () => reject(new Error("anime.js failed to load")), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = VISUALIZER_ANIME_SRC;
        script.async = true;
        script.dataset.spotuiAnime = "1";
        script.onload = () => resolve(window.anime);
        script.onerror = () => reject(new Error("anime.js failed to load"));
        document.head.appendChild(script);
    });

    return animeReady;
}

function stopVisualizerAnimations() {
    try {
        visualizerFallAnim?.pause?.();
        visualizerLineAnims.forEach((anim) => anim?.pause?.());
    } catch {
    }

    visualizerFallAnim = null;
    visualizerLineAnims = [];
    if (visualizerBarsTimer) {
        clearTimeout(visualizerBarsTimer);
        visualizerBarsTimer = null;
    }
    if (visualizerBarFrame) {
        cancelAnimationFrame(visualizerBarFrame);
        visualizerBarFrame = null;
    }
    if (visualizerAudioContext?.state === "running") {
        visualizerAudioContext.suspend().catch(() => {});
    }
}

function ensureVisualizer() {
    if (visualizerRoot) return;

    visualizerRoot = document.createElement("div");
    visualizerRoot.id = "spotui-visualizer";

    visualizerFall = document.createElement("div");
    visualizerFall.id = "spotui-visualizer-fall";

    visualizerBars = document.createElement("div");
    visualizerBars.id = "spotui-visualizer-bars";

    visualizerBarEls = [];
    for (let i = 0; i < VISUALIZER_BAR_COUNT; i += 1) {
        const bar = document.createElement("div");
        bar.className = "spotui-viz-bar";
        bar.style.height = `${8 + (i % 6)}%`;
        visualizerBars.appendChild(bar);
        visualizerBarEls.push(bar);
    }

    visualizerRoot.appendChild(visualizerFall);
    visualizerRoot.appendChild(visualizerBars);
    document.body.appendChild(visualizerRoot);
}

function buildVisualizerText() {
    visualizerFall.innerHTML = "";
    SPOTUI_ASCII_ART.forEach((line, index) => {
        const el = document.createElement("div");
        el.className = "spotui-viz-line";
        for (const ch of line) {
            const span = document.createElement("span");
            span.className = "spotui-viz-char";
            span.textContent = ch === " " ? "\u00A0" : ch;
            span.dataset.char = ch;
            el.appendChild(span);
        }
        el.dataset.index = String(index);
        visualizerFall.appendChild(el);
    });
    return Array.from(visualizerFall.children);
}

function animateVisualizerBars() {
    if (visualizerBarFrame) cancelAnimationFrame(visualizerBarFrame);
    visualizerBars.style.opacity = "1";

    const seeds = visualizerBarEls.map((_, index) => ({
        phase: Math.random() * Math.PI * 2,
        speed: 0.0012 + (index % 7) * 0.00012,
        swing: 0.38 + (index % 5) * 0.08,
    }));

    const tryAttachAudio = () => {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        const audioEl = document.querySelector("audio");
        if (!AudioCtor || !audioEl) return false;

        try {
            if (visualizerAudioElement !== audioEl) {
                if (visualizerAudioSource) {
                    try {
                        visualizerAudioSource.disconnect();
                    } catch {
                    }
                }
                visualizerAudioContext ||= new AudioCtor();
                visualizerAudioSource = visualizerAudioContext.createMediaElementSource(audioEl);
                visualizerAnalyser = visualizerAudioContext.createAnalyser();
                visualizerAnalyser.fftSize = 128;
                visualizerAnalyser.smoothingTimeConstant = 0.78;
                visualizerAudioData = new Uint8Array(visualizerAnalyser.frequencyBinCount);
                visualizerAudioSource.connect(visualizerAnalyser);
                visualizerAnalyser.connect(visualizerAudioContext.destination);
                visualizerAudioElement = audioEl;
            }

            if (visualizerAudioContext.state === "suspended") {
                visualizerAudioContext.resume().catch(() => {});
            }
            return Boolean(visualizerAnalyser);
        } catch {
            visualizerAnalyser = null;
            visualizerAudioData = null;
            return false;
        }
    };

    const tick = () => {
        if (!visualizerActive || !isPlaybackRunning()) {
            visualizerBarFrame = null;
            return;
        }

        const now = performance.now();
        const progress = Number(Spicetify?.Player?.getProgress?.() ?? 0);
        const volume = Number(Spicetify?.Player?.getVolume?.() ?? 0.72);
        const energyBase = 0.55 + Math.min(0.35, volume * 0.25);
        const hasAudio = tryAttachAudio();

        if (hasAudio && visualizerAnalyser && visualizerAudioData) {
            visualizerAnalyser.getByteFrequencyData(visualizerAudioData);
            const bucketSize = Math.max(1, Math.floor(visualizerAudioData.length / visualizerBarEls.length));
            visualizerBarEls.forEach((bar, index) => {
                let sum = 0;
                let peak = 0;
                const start = index * bucketSize;
                const end = Math.min(visualizerAudioData.length, start + bucketSize);
                for (let i = start; i < end; i += 1) {
                    const value = visualizerAudioData[i] || 0;
                    sum += value;
                    if (value > peak) peak = value;
                }
                const avg = sum / Math.max(1, end - start);
                const height = 10 + (avg * 0.72 + peak * 0.28) * 0.32;
                bar.style.height = `${Math.max(8, Math.min(100, height))}%`;
            });
        } else {
            visualizerBarEls.forEach((bar, index) => {
                const seed = seeds[index];
                const pulse = Math.sin(now * seed.speed + seed.phase) * 0.5 + 0.5;
                const trackWave = Math.sin(progress / 140 + index * 0.42 + seed.phase * 0.7) * 0.5 + 0.5;
                const jitter = (Math.sin(now * 0.0025 + index * 0.18) * 0.5 + 0.5) * 0.18;
                const height = 10 + (pulse * 0.48 + trackWave * 0.34 + jitter) * (56 + (index % 8) * 2) * energyBase * seed.swing;
                bar.style.height = `${Math.max(8, Math.min(100, height))}%`;
            });
        }

        visualizerBarFrame = requestAnimationFrame(tick);
    };

    visualizerBarFrame = requestAnimationFrame(tick);
}

async function enterVisualizerMode() {
    if (visualizerActive || visualizerRequested || popup || document.body.classList.contains("spotui-search-mode") || !isPlaybackRunning()) {
        return;
    }

    visualizerRequested = true;
    ensureVisualizer();
    visualizerActive = true;
    document.body.classList.add("spotui-visualizer-active");
    document.getElementById("spotui-tui")?.classList.add("spotui-has-visualizer");
    visualizerBars.style.opacity = "0";

    const lineEls = buildVisualizerText();
    const charEls = lineEls.flatMap((line) => Array.from(line.children));

    try {
        const anime = await loadAnime();
        if (!visualizerActive) {
            visualizerRequested = false;
            return;
        }

        stopVisualizerAnimations();

        visualizerLineAnims = charEls.map((charEl, index) => {
            const lineIndex = Number(charEl.parentElement?.dataset.index || 0);
            const columnIndex = Array.from(charEl.parentElement?.children || []).indexOf(charEl);
            const dropDistance = 240 + lineIndex * 22 + Math.random() * 160;
            const spread = (columnIndex - 24) * 2.1 + (Math.random() - 0.5) * 34;
            const drift = (Math.random() - 0.5) * 10;
            return anime({
                targets: charEl,
                translateY: [0, dropDistance],
                translateX: [0, spread + drift],
                rotate: [0, (Math.random() - 0.5) * 58],
                scale: [1, 0.9],
                opacity: [0.92, 0],
                duration: 1200 + lineIndex * 140 + (index % 6) * 45,
                delay: lineIndex * 130 + columnIndex * 20,
                easing: "easeInCubic",
            });
        });

        visualizerFallAnim = anime({
            targets: visualizerFall,
            opacity: [0, 1],
            duration: 240,
            easing: "linear",
        });

        visualizerBarsTimer = setTimeout(() => {
            if (!visualizerActive || !isPlaybackRunning()) return;
            visualizerBars.style.opacity = "1";
            animateVisualizerBars();
        }, 2100);
    } catch {
        visualizerBars.style.opacity = "1";
        visualizerBarEls.forEach((bar, index) => {
            bar.style.height = `${24 + (index % 7) * 8}%`;
        });
    } finally {
        visualizerRequested = false;
    }
}

function exitVisualizerMode() {
    if (!visualizerActive && !visualizerRequested) return;
    visualizerActive = false;
    visualizerRequested = false;
    document.body.classList.remove("spotui-visualizer-active");
    document.getElementById("spotui-tui")?.classList.remove("spotui-has-visualizer");
    stopVisualizerAnimations();
    if (visualizerBars) visualizerBars.style.opacity = "0";
    if (visualizerRoot) visualizerRoot.replaceChildren(visualizerFall, visualizerBars);
}

function clearIdleTimer() {
    if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
    }
}

function isPlaybackRunning() {
    return Boolean(Spicetify?.Player?.isPlaying?.());
}

function scheduleIdleTimer() {
    clearIdleTimer();
}

function noteActivity() {
    clearIdleTimer();
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
            noteActivity();
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
        noteActivity();
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
<div id="spotui-logo">  ██████  ██▓███   ▒█████  ▄▄▄█████▓ █    ██  ██▓
▒██    ▒ ▓██░  ██▒▒██▒  ██▒▓  ██▒ ▓▒ ██  ▓██▒▓██▒
░ ▓██▄   ▓██░ ██▓▒▒██░  ██▒▒ ▓██░ ▒░▓██  ▒██░▒██▒
  ▒   ██▒▒██▄█▓▒ ▒▒██   ██░░ ▓██▓ ░ ▓▓█  ░██░░██░
▒██████▒▒▒██▒ ░  ░░ ████▓▒░  ▒██▒ ░ ▒▒█████▓ ░██░
▒ ▒▓▒ ▒ ░▒▓▒░ ░  ░░ ▒░▒░▒░   ▒ ░░   ░▒▓▒ ▒ ▒ ░▓  
░ ░▒  ░ ░░▒ ░       ░ ▒ ▒░     ░    ░░▒░ ░ ░  ▒ ░
░  ░  ░  ░░       ░ ░ ░ ▒    ░       ░░░ ░ ░  ▒ ░
      ░               ░ ░              ░      ░  
                                                 </div>
<div id="spotui-output">SpoTUI v1.0

Type /help

</div>
<div id="spotui-footer">
<span class="prompt">></span>
<input id="spotui-input" autofocus placeholder="type help for a list of commands">
</div>
`;
    document.body.appendChild(box);

    const input = document.getElementById("spotui-input");
    input.addEventListener("input", noteActivity);
    input.addEventListener("keydown", async (e) => {
        noteActivity();
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

    document.addEventListener("pointerdown", noteActivity, true);
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
        noteActivity();
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
        clearIdleTimer();
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
let popupTarget = null;
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
    clearIdleTimer();
    try {
        playlists = await getPlaylists();
    } catch (err) {
        print("Playlist error: " + err.message);
        scheduleIdleTimer();
        return;
    }
    popupSelected = 0;
    popupMode = "list";
    renderPopup();
}

async function openPlaylistTracksPopup() {
    clearIdleTimer();
    try {
        const contextUri = getCurrentPlaylistContextUri();
        if (!contextUri || !Spicetify.URI.isPlaylistV1OrV2(contextUri)) {
            print("List error: not currently playing a playlist.");
            scheduleIdleTimer();
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
        scheduleIdleTimer();
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
    clearIdleTimer();
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
    scheduleIdleTimer();
}

function renderPopup() {
    if (popup) popup.remove();
    popup = document.createElement("div");
    popup.id = "spotui-popup";
    popup.tabIndex = 0;

    if (popupMode === "list") {
        popup.innerHTML = `<div class="popup-title">Playlists &mdash; &uarr;/&darr; move &middot; Enter play &middot; n new &middot; r rename &middot; Esc close</div><div id="popup-list"></div>`;
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
    } else if (popupMode === "rename") {
        const target = playlists[popupTarget];
        popup.innerHTML = `<div class="popup-title">Rename "${target.name}" &mdash; Enter confirm &middot; Esc cancel</div><input id="popup-input" class="popup-input" value="${target.name}">`;
        document.body.appendChild(popup);
        const inputEl = popup.querySelector("#popup-input");
        inputEl.focus();
        inputEl.select();
        inputEl.addEventListener("keydown", handleRenameKeydown);
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
    } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (playlists.length) {
            popupTarget = popupSelected;
            popupMode = "rename";
            renderPopup();
        }
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

async function handleRenameKeydown(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const name = e.target.value.trim();
        const target = playlists[popupTarget];
        if (!name || !target) return;
        try {
            const playlistId = getPlaylistId(target.uri);
            await Spicetify.CosmosAsync.put(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                name,
            });
            print("Renamed to: " + name);
        } catch (err) {
            print("Rename failed: " + err.message + " (check console)");
            console.error("Rename playlist error:", err);
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
