import { app } from "./state.js";

const STANDBY_HTML_URL = "https://raw.githubusercontent.com/SkenSMasteR/spotui-standby/refs/heads/main/index.html";
const OVERLAY_ID = "spotui-standby-overlay";
const CATCHER_ID = "spotui-standby-catcher";

let standbyToken = 0;
let swallowKeys = false;

function swallowEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
}

function attachKeyListeners() {
    window.addEventListener("keydown", onStandbyKey, true);
    window.addEventListener("keyup", onStandbyKey, true);
    window.addEventListener("keypress", onStandbyKey, true);
    document.addEventListener("keydown", onStandbyKey, true);
    document.addEventListener("keyup", onStandbyKey, true);
    document.addEventListener("keypress", onStandbyKey, true);
}

function detachKeyListeners() {
    window.removeEventListener("keydown", onStandbyKey, true);
    window.removeEventListener("keyup", onStandbyKey, true);
    window.removeEventListener("keypress", onStandbyKey, true);
    document.removeEventListener("keydown", onStandbyKey, true);
    document.removeEventListener("keyup", onStandbyKey, true);
    document.removeEventListener("keypress", onStandbyKey, true);
}

function onStandbyKey(e) {
    if (!app.standbyOpen && !swallowKeys) return;
    swallowEvent(e);
    if (app.standbyOpen && e.type === "keydown") {
        swallowKeys = true;
        exitStandby();
        return;
    }
    if (e.type === "keyup") {
        swallowKeys = false;
        if (!app.standbyOpen) {
            detachKeyListeners();
            const input = document.getElementById("spotui-input");
            if (input) input.focus();
        }
    }
}

function onStandbyClick(e) {
    if (!app.standbyOpen) return;
    e.preventDefault();
    e.stopPropagation();
    exitStandby();
}

function onStandbyBlur() {
    if (!app.standbyOpen) return;
    requestAnimationFrame(focusCatcher);
}

function focusCatcher() {
    const catcher = document.getElementById(CATCHER_ID);
    if (catcher) catcher.focus();
}

function removeOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
}

function restoreSpotui() {
    document.body.classList.remove("spotui-standby", "spotui-search-mode", "spotui-spotify-enabled", "spotui-tui-hidden");
    const spotifyBtn = document.getElementById("enable-spotify-btn");
    if (spotifyBtn) spotifyBtn.textContent = "Enable Spotify";
    if (swallowKeys) return;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
}

export function exitStandby() {
    if (!app.standbyOpen) return;
    standbyToken += 1;
    app.standbyOpen = false;
    if (!swallowKeys) detachKeyListeners();
    window.removeEventListener("blur", onStandbyBlur, true);
    document.removeEventListener("focusin", onStandbyBlur, true);
    removeOverlay();
    restoreSpotui();
}

export async function enterStandby() {
    if (app.standbyOpen) return;
    app.standbyOpen = true;
    const token = ++standbyToken;

    document.body.classList.add("spotui-standby");
    const input = document.getElementById("spotui-input");
    if (input) input.blur();

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;

    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("tabindex", "-1");

    const catcher = document.createElement("input");
    catcher.id = CATCHER_ID;
    catcher.type = "text";
    catcher.autocomplete = "off";
    catcher.spellcheck = false;
    catcher.setAttribute("aria-label", "Standby");

    overlay.appendChild(frame);
    overlay.appendChild(catcher);
    document.body.appendChild(overlay);

    attachKeyListeners();
    window.addEventListener("blur", onStandbyBlur, true);
    document.addEventListener("focusin", onStandbyBlur, true);
    catcher.addEventListener("blur", onStandbyBlur);
    catcher.addEventListener("click", onStandbyClick);
    overlay.addEventListener("click", onStandbyClick);
    focusCatcher();

    try {
        const res = await fetch(STANDBY_HTML_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("standby fetch failed");
        const html = await res.text();
        if (token !== standbyToken || !app.standbyOpen) return;
        frame.srcdoc = html;
        focusCatcher();
    } catch (e) {
        if (token !== standbyToken) return;
        console.error("SpoTUI: failed to load standby overlay", e);
        exitStandby();
    }
}
