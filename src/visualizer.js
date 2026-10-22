import { showRestartPopup } from "./banner.js";
import { DISCORD_INVITE_URL, VISUALIZER_GAP, VISUALIZER_STORAGE_KEY } from "./constants.js";
import { getSpotuiAccentColor } from "./jam.js";
import { app } from "./state.js";
import { storageGet, storageSet } from "./storage.js";
import { createButton } from "./utils.js";

let bars = [];
let raf = 0;

function getGap() {
    const stored = storageGet(VISUALIZER_GAP);
    if (stored === null) return 2;
    const value = Number(stored);
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 2;
}

function paint() {
    raf = 0;
    const c = document.getElementById("spotui-visualizer");
    if (!c || !app.visualizerOpen) return;
    const ctx = c.getContext("2d");
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    ctx.clearRect(0, 0, w, h);
    const n = bars.length;
    if (!n || !w || !h) return;
    const gap = n > 1 ? Math.min(getGap(), Math.max(0, Math.floor((w - n) / (n - 1)))) : 0;
    const bw = Math.max(1, (w - gap * (n - 1)) / n);
    const step = bw + gap;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--visualizer-color").trim() || "#ff8c42";
    for (let i = 0; i < n; i++) {
        const bh = bars[i] * h;
        if (bh <= 0) continue;
        const left = Math.round(i * step);
        const right = Math.round(i * step + bw);
        ctx.fillRect(left, h - bh, Math.max(1, right - left), bh);
    }
}

export function setVisualizerBars(next) {
    bars = next || [];
    refreshVisualizer();
}

export function refreshVisualizer() {
    if (app.visualizerOpen && !raf) raf = requestAnimationFrame(paint);
}

export function handleVisualizerCommand(arg, silent) {
    const mode = String(arg || "").trim().toLowerCase();
    const on = () => {
        if (!app.sposyncConnected) {
            if (silent) return;
            const popup = showRestartPopup("");
            const accent = getSpotuiAccentColor();
            popup.style.border = `1px solid ${accent}`;
            popup.style.color = accent;
            popup.style.maxWidth = "420px";
            popup.style.lineHeight = "1.45";
            popup.style.display = "flex";
            popup.style.flexDirection = "column";
            popup.style.gap = "12px";
            popup.innerHTML = `<div>Unable to enable visualizer because you do not have SpoSync.<br><br>SpoSync lets SpoTUI fetch live audio data and gives you the full TUI experience.<br><br>Download it from:<br>GitHub: <a href="https://github.com/SkenSMasteR/SpoTUI" target="_blank" rel="noopener" style="color:inherit">https://github.com/SkenSMasteR/SpoTUI</a><br>Discord: <a href="${DISCORD_INVITE_URL}" target="_blank" rel="noopener" style="color:inherit">${DISCORD_INVITE_URL}</a></div>`;
            popup.appendChild(createButton("", "spotui-control-btn", "OK", () => popup.remove()));
            return;
        }
        app.visualizerOpen = true;
        storageSet(VISUALIZER_STORAGE_KEY, "1");
        document.body.classList.add("spotui-visualizer-on");
        setVisualizerBars(bars);
    };
    const off = () => {
        app.visualizerOpen = false;
        storageSet(VISUALIZER_STORAGE_KEY, "0");
        document.body.classList.remove("spotui-visualizer-on");
    };
    if (mode === "on" || mode === "open") { if (!app.visualizerOpen) on(); return; }
    if (mode === "off" || mode === "close") { off(); return; }
    if (mode && mode !== "toggle") return;
    if (app.visualizerOpen) off();
    else on();
}

export function restoreVisualizer() {
    if (storageGet(VISUALIZER_STORAGE_KEY) === "1") handleVisualizerCommand("on", true);
}
