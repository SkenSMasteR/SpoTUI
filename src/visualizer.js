import { emitPaneClose } from "./actions.js";
import { VISUALIZER_BAR, VISUALIZER_BG } from "./constants.js";
import { closeActivePanel } from "./panels.js";
import { app } from "./state.js";
import { storageGet, storageRemove, storageSet } from "./storage.js";

const BAR_COUNT = 48;
const PITCH_COUNT = 12;
let animationFrame = 0;
let analysis = null;
let analysisUri = "";
let analysisRequest = "";
let analysisToken = 0;
let bars = [];
let barEnvelopes = [];
let segmentIndex = 0;
let beatIndex = -1;
let previousFrameTime = 0;

function handleEscape(event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeVisualizerPanel();
}

function validColor(value) {
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value || "");
}

export function applyVisualizerColors() {
    const root = document.documentElement;
    const bar = storageGet(VISUALIZER_BAR);
    const background = storageGet(VISUALIZER_BG);
    if (bar) root.style.setProperty("--visualizer-bar-color", bar);
    else root.style.removeProperty("--visualizer-bar-color");
    if (background) root.style.setProperty("--visualizer-bg-color", background);
    else root.style.removeProperty("--visualizer-bg-color");
}

export function handleVisualizerCommand(args) {
    if (args.some((arg) => arg.toLowerCase() === "off")) {
        storageRemove(VISUALIZER_BAR);
        storageRemove(VISUALIZER_BG);
    } else {
        const colorFlags = [["-bar", VISUALIZER_BAR], ["-bg", VISUALIZER_BG]];
        colorFlags.forEach(([flag, key]) => {
            const index = args.findIndex((arg) => arg.toLowerCase() === flag);
            const value = args[index + 1];
            if (index !== -1 && validColor(value)) storageSet(key, value);
        });
    }
    applyVisualizerColors();
}

function currentTrackUri() {
    return Spicetify?.Player?.data?.item?.uri || "";
}

function currentPosition() {
    return (Spicetify.Player.getProgress() || 0) / 1000;
}

function levelFromLoudness(value) {
    return Math.max(0.12, Math.min(1, ((value ?? -60) + 60) / 60));
}

function findSegment(position) {
    const segments = analysis?.segments || [];
    if (!segments.length) return null;
    segmentIndex = Math.min(segmentIndex, segments.length - 1);
    while (segmentIndex < segments.length - 1 && position >= segments[segmentIndex].start + segments[segmentIndex].duration) segmentIndex++;
    while (segmentIndex > 0 && position < segments[segmentIndex].start) segmentIndex--;
    return segments[segmentIndex];
}

function interpolatePitch(current, next, index, amount) {
    const left = current?.pitches?.[index] || 0;
    const right = next?.pitches?.[index] ?? left;
    return left + (right - left) * amount;
}

function updateBeatEnvelope(position, time) {
    const beats = analysis?.beats || [];
    const elapsed = previousFrameTime ? Math.min(0.1, time - previousFrameTime) : 0;
    previousFrameTime = time;
    if (!beats.length) return { elapsed, triggered: false };
    let nextBeatIndex = Math.max(0, Math.min(beatIndex, beats.length - 1));
    while (nextBeatIndex < beats.length - 1 && position >= beats[nextBeatIndex + 1].start) nextBeatIndex++;
    while (nextBeatIndex > 0 && position < beats[nextBeatIndex].start) nextBeatIndex--;
    if (nextBeatIndex !== beatIndex) {
        beatIndex = nextBeatIndex;
        return { elapsed, triggered: true };
    }
    return { elapsed, triggered: false };
}

function draw() {
    if (!app.visualizerPanelOpen) return;
    const canvas = document.getElementById("spotui-visualizer-canvas");
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

    const uri = currentTrackUri();
    if (uri && uri !== analysisUri && uri !== analysisRequest) void loadAnalysis(uri);

    context.clearRect(0, 0, width, height);
    const position = currentPosition();
    const current = findSegment(position);
    const next = analysis?.segments?.[segmentIndex + 1];
    const amount = current && next ? Math.max(0, Math.min(1, (position - current.start) / current.duration)) : 0;
    const loudness = current && next
        ? levelFromLoudness(current.loudness_max + (next.loudness_max - current.loudness_max) * amount)
        : levelFromLoudness(current?.loudness_max);
    const gap = Math.max(pixelRatio * 2, width / 320);
    const barWidth = Math.max(1, (width - gap * (BAR_COUNT - 1)) / BAR_COUNT);
    const time = performance.now() / 1000;
    const playing = Spicetify.Player.isPlaying();
    const beat = playing ? updateBeatEnvelope(position, time) : { elapsed: 0, triggered: false };
    const color = getComputedStyle(document.documentElement).getPropertyValue("--visualizer-bar-color").trim() || "#ff8c42";
    context.fillStyle = color;
    if (bars.length !== BAR_COUNT) bars = Array(BAR_COUNT).fill(0);
    if (barEnvelopes.length !== BAR_COUNT) barEnvelopes = Array(BAR_COUNT).fill(0);

    for (let index = 0; index < BAR_COUNT; index++) {
        const pitchPosition = (index / (BAR_COUNT - 1)) * (PITCH_COUNT - 1);
        const pitchIndex = Math.floor(pitchPosition);
        const pitchAmount = pitchPosition - pitchIndex;
        const left = interpolatePitch(current, next, pitchIndex, amount);
        const right = interpolatePitch(current, next, Math.min(PITCH_COUNT - 1, pitchIndex + 1), amount);
        const pitch = left + (right - left) * pitchAmount;
        let target = 0;
        let rate = 0.24;
        if (playing) {
            if (beat.triggered) barEnvelopes[index] = Math.max(barEnvelopes[index], 0.35 + pitch * (0.7 + (index % 4) * 0.08));
            barEnvelopes[index] *= Math.exp(-beat.elapsed * (2.4 + (index % 9) * 0.28));
            const beatShape = 0.12 + barEnvelopes[index] * 0.95;
            target = Math.max(0.025, (0.08 + pitch * 0.92) * loudness * beatShape);
            rate = beat.triggered ? 0.72 : 0.14;
        } else {
            barEnvelopes[index] = 0;
        }
        bars[index] += (target - bars[index]) * rate;
        const barHeight = bars[index] * height * 0.9;
        if (barHeight > pixelRatio) context.fillRect(index * (barWidth + gap), height - barHeight, barWidth, barHeight);
    }

    animationFrame = requestAnimationFrame(draw);
}

async function loadAnalysis(uri) {
    if (typeof Spicetify?.getAudioData !== "function") return;
    const token = ++analysisToken;
    analysisRequest = uri;
    const status = document.getElementById("spotui-visualizer-status");
    if (status) status.textContent = "Loading Spotify audio analysis";
    try {
        const result = await Spicetify.getAudioData(uri);
        if (!app.visualizerPanelOpen || token !== analysisToken) return;
        analysis = result;
        analysisUri = uri;
        analysisRequest = "";
        segmentIndex = 0;
        beatIndex = -1;
        previousFrameTime = 0;
        bars = [];
        barEnvelopes = [];
        document.body.classList.add("spotui-visualizer-ready");
    } catch {
        if (token === analysisToken && app.visualizerPanelOpen && status) status.textContent = "Spotify audio analysis unavailable";
        analysisRequest = "";
    }
}

function stop() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    analysisToken++;
    analysis = null;
    analysisUri = "";
    analysisRequest = "";
    segmentIndex = 0;
    beatIndex = -1;
    previousFrameTime = 0;
    bars = [];
    barEnvelopes = [];
}

export function closeVisualizerPanel() {
    if (!app.visualizerPanelOpen) return;
    app.visualizerPanelOpen = false;
    stop();
    document.body.classList.remove("spotui-visualizer-panel", "spotui-visualizer-ready");
    document.removeEventListener("keydown", handleEscape);
    const panel = document.getElementById("spotui-visualizer");
    if (panel) panel.hidden = true;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
    emitPaneClose("visualizer");
}

export async function openVisualizerPanel() {
    if (app.visualizerPanelOpen) {
        closeVisualizerPanel();
        return;
    }
    closeActivePanel();
    app.visualizerPanelOpen = true;
    document.body.classList.add("spotui-visualizer-panel");
    document.getElementById("spotui-visualizer").hidden = false;
    document.addEventListener("keydown", handleEscape);
    await loadAnalysis(currentTrackUri());
    animationFrame = requestAnimationFrame(draw);
}