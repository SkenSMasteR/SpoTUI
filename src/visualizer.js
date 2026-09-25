import { VISUALIZER_STORAGE_KEY } from "./constants.js";
import { app } from "./state.js";
import { storageGet, storageSet } from "./storage.js";

let bars = [];
let raf = 0;

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
    const gap = 2;
    const bw = Math.max(1, (w - gap * n) / n);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--visualizer-color").trim() || "#ff8c42";
    for (let i = 0; i < n; i++) {
        const bh = bars[i] * h;
        if (bh > 0) ctx.fillRect(i * (bw + gap), h - bh, bw, bh);
    }
}

export function setVisualizerBars(next) {
    bars = next || [];
    if (app.visualizerOpen && !raf) raf = requestAnimationFrame(paint);
}

export function handleVisualizerCommand(arg) {
    const mode = String(arg || "").trim().toLowerCase();
    const on = () => {
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
    if (storageGet(VISUALIZER_STORAGE_KEY) === "1") handleVisualizerCommand("on");
}
