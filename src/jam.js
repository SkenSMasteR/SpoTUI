import { applyPlayerBarVisibility } from "./appearance.js";
import { JAM_POLL_MS, JAM_SEEK_DRIFT_MS, JAM_SERVER_URL, JAM_STATE_KEY } from "./constants.js";
import { app } from "./state.js";
import { storageGet, storageRemove, storageSet } from "./storage.js";

// Get current theme accent color from CSS variables
export function getSpotuiAccentColor() {
    try {
        const accent = getComputedStyle(document.documentElement).getPropertyValue("--spotui-accent").trim();
        return accent || "#ff8c42";
    } catch (e) {
        return "#ff8c42";
    }
}

// Show temporary toast notification for jam-related messages
export function jamSay(text) {
    const accent = getSpotuiAccentColor();
    const existing = document.getElementById("spotui-jam-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "spotui-jam-toast";
    toast.textContent = text;
    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "120px";
    toast.style.transform = "translateX(-50%)";
    toast.style.zIndex = "10000";
    toast.style.background = "rgba(0,0,0,0.92)";
    toast.style.border = `1px solid ${accent}`;
    toast.style.borderRadius = "6px";
    toast.style.padding = "12px 16px";
    toast.style.color = accent;
    toast.style.fontFamily = "\"JetBrains Mono\", monospace";
    toast.style.fontSize = "14px";
    toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 4000);
}

// Display jam session status tags (role and PIN)
export function showJamTags(pin, role) {
    hideJamTags();
    const wrap = document.createElement("div");
    wrap.id = "spotui-jam-tags";
    const relayTag = document.createElement("div");
    relayTag.className = "spotui-jam-tag";
    relayTag.textContent = role === "host"
        ? "This client is connected to the server."
        : "This client is controlled by an autonomous relay server.";
    const pinTag = document.createElement("div");
    pinTag.className = "spotui-jam-tag";
    pinTag.textContent = `Room pin: ${pin}`;
    wrap.appendChild(relayTag);
    wrap.appendChild(pinTag);
    document.body.appendChild(wrap);
}

// Remove jam status tags from display
export function hideJamTags() {
    const el = document.getElementById("spotui-jam-tags");
    if (el) el.remove();
}

// Save current jam state to localStorage for session persistence
export function jamStorageSave() {
    if (!app.jamRole) { storageRemove(JAM_STATE_KEY); return; }
    storageSet(JAM_STATE_KEY, JSON.stringify({
        role: app.jamRole, pin: app.jamPin, token: app.jamToken, barPrevHidden: app.jamBarPrevHidden,
    }));
}

// Make fetch request to jam server
export async function jamFetch(path, opts) {
    const res = await fetch(JAM_SERVER_URL + path, opts);
    return res.json().catch(() => ({}));
}

// Stop jam polling interval
export function jamStopPolling() {
    if (app.jamIntervalId) { clearInterval(app.jamIntervalId); app.jamIntervalId = null; }
}

// Hide player bar when joining jam as guest
export function jamForceHideBar() {
    app.jamBarPrevHidden = document.body.classList.contains("spotui-bar-off");
    document.body.classList.add("spotui-bar-off");
}

export function jamRestoreBar() {
    if (app.jamBarPrevHidden === true) {
        document.body.classList.add("spotui-bar-off");
    } else if (app.jamBarPrevHidden === false) {
        document.body.classList.remove("spotui-bar-off");
    } else {
        applyPlayerBarVisibility();
    }
    app.jamBarPrevHidden = null;
}

// Broadcast current playback state to jam server (host only)
export function jamHostTick() {
    try {
        const item = Spicetify.Player?.data?.item;
        const uri = item?.uri || null;
        const position_ms = Spicetify.Player.getProgress() || 0;
        const is_playing = Spicetify.Player.isPlaying();
        jamFetch(`/jam/${app.jamPin}/state`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: app.jamToken, uri, position_ms, is_playing }),
        }).catch(() => {});
    } catch (e) {}
}

// Create a new jam session as host
// Displays the PIN for others to join
export async function jamCreate() {
    if (app.jamRole) { jamSay("You are already in a jam, run 'jam leave' first."); return; }
    try {
        const res = await jamFetch("/jam/create", { method: "POST" });
        if (!res.pin) { jamSay("Failed to create jam."); return; }
        app.jamRole = "host";
        app.jamPin = res.pin;
        app.jamToken = res.token;
        jamStorageSave();
        jamStopPolling();
        app.jamIntervalId = setInterval(jamHostTick, JAM_POLL_MS);
        jamHostTick();
        showJamTags(app.jamPin, "host");
        jamSay(`Jam created — PIN ${app.jamPin}. Others join with: jam join ${app.jamPin}`);
    } catch (e) {
        jamSay("Failed to create jam: " + e.message);
    }
}

// Fetch and sync playback state (guest only)
export async function jamGuestTick() {
    try {
        const data = await jamFetch(`/jam/${app.jamPin}/state?token=${encodeURIComponent(app.jamToken)}`);
        if (data.ended || data.error === "invalid_token") {
            jamSay("Jam ended.");
            await jamLeave();
            return;
        }
        const s = data.state;
        if (!s) return;

        const elapsedSinceUpdate = s.is_playing ? Math.max(0, (data.server_time - s.updated_at) * 1000) : 0;
        const expectedPos = s.position_ms + elapsedSinceUpdate;

        if (s.uri && s.uri !== app.jamLastAppliedUri) {
            app.jamLastAppliedUri = s.uri;
            await Spicetify.Player.playUri(s.uri);
            setTimeout(() => { try { Spicetify.Player.seek(expectedPos); } catch (e) {} }, 250);
        } else if (s.uri) {
            const currentPos = Spicetify.Player.getProgress() || 0;
            if (Math.abs(currentPos - expectedPos) > JAM_SEEK_DRIFT_MS) {
                try { Spicetify.Player.seek(expectedPos); } catch (e) {}
            }
        }

        const nowPlaying = Spicetify.Player.isPlaying();
        if (s.is_playing && !nowPlaying) Spicetify.Player.togglePlay();
        if (!s.is_playing && nowPlaying) Spicetify.Player.togglePlay();
    } catch (e) {}
}

// Join an existing jam session as guest using PIN
export async function jamJoin(pin) {
    if (app.jamRole) { jamSay("Already in a jam — run 'jam leave' first."); return; }
    if (!pin) { jamSay("Usage: jam join <pin>"); return; }
    try {
        const res = await jamFetch(`/jam/${pin}/join`, { method: "POST" });
        if (res.error) { jamSay("Could not join jam: " + res.error); return; }
        app.jamRole = "guest";
        app.jamPin = pin;
        app.jamToken = res.token;
        app.jamLastAppliedUri = null;
        jamForceHideBar();
        jamStorageSave();
        jamStopPolling();
        app.jamIntervalId = setInterval(jamGuestTick, JAM_POLL_MS);
        jamGuestTick();
        showJamTags(pin, "guest");
        jamSay(`Joined jam ${pin}. Only volume, lyrics, and 'jam leave' are available.`);
    } catch (e) {
        jamSay("Failed to join jam: " + e.message);
    }
}

// Leave current jam session (host or guest)
export async function jamLeave() {
    if (!app.jamRole) { jamSay("Not in a jam."); return; }
    const wasGuest = app.jamRole === "guest";
    try {
        await jamFetch(`/jam/${app.jamPin}/leave`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: app.jamToken }),
        });
    } catch (e) {}
    jamStopPolling();
    if (wasGuest) jamRestoreBar();
    hideJamTags();
    app.jamRole = null; app.jamPin = null; app.jamToken = null; app.jamLastAppliedUri = null;
    jamStorageSave();
    jamSay("Left jam.");
}

// Return set of commands available to jam guests
export function getAllowedJamGuestCommands() {
    if (app.jamRole !== "guest") return null;
    return new Set(["v", "volume", "lyrics", "jam"]);
}

// Resume jam session from localStorage after page reload
export function resumeJamFromStorage() {
    try {
        const raw = storageGet(JAM_STATE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved || !saved.role || !saved.pin || !saved.token) return;
        app.jamRole = saved.role;
        app.jamPin = saved.pin;
        app.jamToken = saved.token;
        app.jamBarPrevHidden = typeof saved.barPrevHiddesn === "boolean" ? saved.barPrevHidden : null;
        showJamTags(app.jamPin, app.jamRole);
        if (app.jamRole === "guest") {
            document.body.classList.add("spotui-bar-off");
            app.jamIntervalId = setInterval(jamGuestTick, JAM_POLL_MS);
            jamGuestTick();
        } else if (app.jamRole === "host") {
            app.jamIntervalId = setInterval(jamHostTick, JAM_POLL_MS);
            jamHostTick();
        }
    } catch (e) {}
}
