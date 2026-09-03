import { ANIMATION_KEY, CUSTOM_BAR_ENABLED, CUSTOM_BAR_PROGRESS_STYLE, HEX_COLOR_REGEX, INPUT_BG, INPUT_BG_HOVER, INPUT_BORDER, INPUT_BUTTONS, INPUT_TEXT, LYRICS_COLOR_ACTIVE, LYRICS_COLOR_INACTIVE, LYRICS_COLOR_LIGHT_INACTIVE, PANEL_BG, PANEL_BORDER, PANEL_TEXT, PLAYER_BAR_BG, PLAYER_BAR_BORDER, PLAYER_BAR_TEXT, PLAYER_BAR_VISIBLE, PROGRESS_BAR_BG, PROGRESS_BAR_FG, PROGRESS_STYLES, WP_OPACITY_KEY, WP_URL_KEY } from "./constants.js";
import { syncLyricsState } from "./lyrics.js";
import { app } from "./state.js";
import { storageGet, storageRemove, storageSet } from "./storage.js";
import { createButton } from "./utils.js";

export function applyCssVar(key, cssVar) {
    const root = document.documentElement;
    const value = storageGet(key);
    if (value) root.style.setProperty(cssVar, value);
    else root.style.removeProperty(cssVar);
}

// Validate hex color format
export function isValidHexColor(value) {
    return typeof value === "string" && HEX_COLOR_REGEX.test(value);
}

// Parse color flag arguments and save valid hex colors to storage
export function handleColorArgs(args, flagToKey) {
    const argsLower = args.map((a) => a.toLowerCase());
    if (argsLower.includes("off")) {
        Object.keys(flagToKey).forEach((flag) => storageRemove(flagToKey[flag]));
        return;
    }
    Object.keys(flagToKey).forEach((flag) => {
        const idx = argsLower.indexOf(flag);
        if (idx === -1) return;
        const value = args[idx + 1];
        if (isValidHexColor(value)) storageSet(flagToKey[flag], value);
    });
}
// Apply stored lyric color preferences from localStorage
export function applyLyricColors() {
    try {
        applyCssVar(LYRICS_COLOR_ACTIVE, "--lyrics-color-active");
        applyCssVar(LYRICS_COLOR_INACTIVE, "--lyrics-color-inactive");
        applyCssVar(LYRICS_COLOR_LIGHT_INACTIVE, "--lyrics-color-light-inactive");
    } catch (e) {
        console.error("SpoTUI: Failed to apply lyric colors", e);
    }
}

// Apply stored player bar color preferences from localStorage
export function applyPlayerBarColors() {
    try {
        const root = document.documentElement;
        const border = storageGet(PLAYER_BAR_BORDER);
        applyCssVar(PLAYER_BAR_BG, "--player-bar-background");
        if (border) {
            root.style.setProperty("--player-bar-border-color", border);
            root.style.setProperty("--spotui-accent", border);
            const rgb = border.replace("#", "").match(/.{1,2}/g)?.map((part) => parseInt(part, 16)).join(", ");
            if (rgb) root.style.setProperty("--spotui-accent-rgb", rgb);
        } else {
            root.style.removeProperty("--player-bar-border-color");
            root.style.removeProperty("--spotui-accent");
            root.style.removeProperty("--spotui-accent-rgb");
        }
        applyCssVar(PLAYER_BAR_TEXT, "--player-bar-text-color");
    } catch (e) {
        console.error("SpoTUI: Failed to apply player bar colors", e);
    }
}

// Toggle player bar visibility
export function applyPlayerBarVisibility() {
    try {
        const visible = storageGet(PLAYER_BAR_VISIBLE);
        if (visible === "off") {
            document.body.classList.add("spotui-bar-off");
        } else {
            document.body.classList.remove("spotui-bar-off");
        }
    } catch {
        console.error("SpoTUI: Failed to apply player bar visibility");
    }
}

// Render progress bar using specified style and fill percentage
export function renderProgressBar(progress, styleId, width) {
    const style = PROGRESS_STYLES[styleId] || PROGRESS_STYLES["classic-block"];
    const filled = Math.round(progress * width);
    const empty = width - filled;
    let filledStr = "";
    let emptyStr = "";
    if (style.fg.length === 1) {
        filledStr = style.fg.repeat(filled);
        emptyStr = style.bg ? style.bg.repeat(empty) : "";
    } else {
        const fgChars = [...style.fg];
        for (let i = 0; i < filled; i++) {
            const idx = Math.floor((i / filled) * fgChars.length);
            filledStr += fgChars[idx] || fgChars[fgChars.length - 1];
        }
        emptyStr = style.bg ? style.bg.repeat(empty) : "";
    }
    return filledStr + emptyStr;
}

// Recalculate custom bar progress width on window resize
export function updateCustomBarWidth() {
    if (!document.body.classList.contains("spotui-custom-bar-on")) return;
    const bar = document.getElementById("spotui-custom-bar");
    if (!bar) return;
    const progressEl = bar.querySelector(".spotui-custom-bar-progress");
    if (!progressEl) return;
    const rect = bar.getBoundingClientRect();
    const availableWidth = rect.width - 400;
    const width = Math.max(40, Math.floor(availableWidth / 16));
    const progress = Spicetify.Player.getProgress();
    const duration = Spicetify.Player.getDuration();
    const progressPct = duration > 0 ? progress / duration : 0;
    const styleId = storageGet(CUSTOM_BAR_PROGRESS_STYLE) || "classic-block";
    progressEl.textContent = renderProgressBar(progressPct, styleId, width);
}

// Draw left section of custom bar: heart button, track title, artist
export function drawCustomBarLeft(track, artist, liked) {
    const left = document.createElement("div");
    left.className = "spotui-custom-bar-left";
    const heart = document.createElement("button");
    heart.className = "spotui-custom-bar-heart";
    heart.textContent = liked ? "X" : "♥";
    heart.setAttribute("aria-label", liked ? "Unlike track" : "Like track");
    heart.addEventListener("click", async () => {
        try { await Spicetify.Player.toggleHeart(); } catch {}
    });
    heart.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            try { Spicetify.Player.toggleHeart(); } catch {}
        }
    });
    const title = document.createElement("span");
    title.className = "spotui-custom-bar-title";
    title.textContent = track;
    const artistSpan = document.createElement("span");
    artistSpan.className = "spotui-custom-bar-artist";
    artistSpan.textContent = artist;
    left.appendChild(heart);
    left.appendChild(title);
    left.appendChild(artistSpan);
    return left;
}

// Update custom player bar
export async function updateCustomBar() {
    try {
        const bar = document.getElementById("spotui-custom-bar");
        if (!bar) return;
        const track = Spicetify.Player.data.item;
        if (!track) {
            bar.innerHTML = "<div class='spotui-custom-bar-empty'>Nothing playing</div>";
            return;
        }
        const progress = Spicetify.Player.getProgress();
        const duration = Spicetify.Player.getDuration();
        const volume = Spicetify.Player.getVolume();
        const liked = Spicetify.Player.getHeart ? await Spicetify.Player.getHeart() : false;
        const meta = track.metadata || {};
        const title = track.name || meta.title || "Unknown";
        const artist = track.artist || meta.artist_name || "Unknown";
        const progressPct = duration > 0 ? progress / duration : 0;
        const styleId = storageGet(CUSTOM_BAR_PROGRESS_STYLE) || "classic-block";
        const left = drawCustomBarLeft(title, artist, liked);
        const progressEl = document.createElement("button");
        progressEl.className = "spotui-custom-bar-progress";
        progressEl.setAttribute("aria-label", "Playback progress");
        const availableWidth = bar.getBoundingClientRect().width - 400;
        const width = Math.max(40, Math.floor(availableWidth / 16));
        progressEl.textContent = renderProgressBar(progressPct, styleId, width);
        progressEl.addEventListener("click", (e) => {
            const rect = progressEl.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, offsetX / rect.width));
            const seekMs = pct * duration;
            try { Spicetify.Player.seek(seekMs); } catch {}
        });
        progressEl.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                const step = (e.key === "ArrowLeft" ? -5000 : 5000);
                const targetMs = Math.max(0, Math.min(duration, progress + step));
                try { Spicetify.Player.seek(targetMs); } catch {}
            }
        });
        const timeEl = document.createElement("div");
        timeEl.className = "spotui-custom-bar-time";
        timeEl.textContent = `${Math.floor(progress / 1000 / 60)}:${String(Math.floor(progress / 1000) % 60).padStart(2, "0")} / ${Math.floor(duration / 1000 / 60)}:${String(Math.floor(duration / 1000) % 60).padStart(2, "0")}`;
        const volEl = document.createElement("div");
        volEl.className = "spotui-custom-bar-vol";
        volEl.textContent = `Vol: ${Math.round(volume * 100)}%`;
        const right = document.createElement("div");
        right.className = "spotui-custom-bar-right";
        right.appendChild(volEl);
        const center = document.createElement("div");
        center.className = "spotui-custom-bar-center";
        center.appendChild(progressEl);
        center.appendChild(timeEl);
        bar.innerHTML = "";
        bar.appendChild(left);
        bar.appendChild(center);
        bar.appendChild(right);
    } catch {
        console.error("SpoTUI: Failed to update custom bar");
    }
}

// Apply custom player bar state
export function applyCustomBarState() {
    if (window.spotuiCustomBarInterval) {
        clearInterval(window.spotuiCustomBarInterval);
        delete window.spotuiCustomBarInterval;
    }

    const enabled = storageGet(CUSTOM_BAR_ENABLED);
    const visible = storageGet(PLAYER_BAR_VISIBLE);
    if (enabled === "on" && visible === "off") {
        document.body.classList.add("spotui-custom-bar-on");
        let bar = document.getElementById("spotui-custom-bar");
        if (!bar) {
            bar = document.createElement("div");
            bar.id = "spotui-custom-bar";
            bar.className = "spotui-custom-bar";
            document.body.appendChild(bar);
        }
        updateCustomBar();
        const interval = setInterval(updateCustomBar, 300);
        window.spotuiCustomBarInterval = interval;
        window.addEventListener("resize", updateCustomBarWidth);
    } else {
        document.body.classList.remove("spotui-custom-bar-on");
        if (window.spotuiCustomBarInterval) {
            clearInterval(window.spotuiCustomBarInterval);
            delete window.spotuiCustomBarInterval;
        }
        window.removeEventListener("resize", updateCustomBarWidth);
    }
}

// Apply stored progress bar colors
export function applyProgressBarColors() {
    try {
        applyCssVar(PROGRESS_BAR_BG, "--progress-bar-background");
        applyCssVar(PROGRESS_BAR_FG, "--progress-bar-foreground");
    } catch (e) {
        console.error("SpoTUI: Failed to apply progress bar colors", e);
    }
}

// Apply stored input field colors
export function applyInputColors() {
    try {
        applyCssVar(INPUT_BG, "--input-bg-color");
        applyCssVar(INPUT_BG_HOVER, "--input-bg-hover-color");
        applyCssVar(INPUT_TEXT, "--input-text-color");
        applyCssVar(INPUT_BORDER, "--input-border-color");
    } catch (e) {
        console.error("SpoTUI: Failed to apply input colors", e);
    }
}

// Darken hex color by multiplying RGB values
export function darkenHexColor(hex, factor) {
    const clean = hex.replace("#", "");
    const expand = clean.length === 3 || clean.length === 4
        ? clean.split("").map((c) => c + c).join("")
        : clean;
    const r = parseInt(expand.slice(0, 2), 16);
    const g = parseInt(expand.slice(2, 4), 16);
    const b = parseInt(expand.slice(4, 6), 16);
    const alpha = expand.length === 8 ? expand.slice(6, 8) : "";
    const nr = Math.max(0, Math.round(r * factor));
    const ng = Math.max(0, Math.round(g * factor));
    const nb = Math.max(0, Math.round(b * factor));
    return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, "0")).join("")}${alpha}`;
}

// Apply stored panel colors
export function applyPanelColors() {
    try {
        applyCssVar(PANEL_BG, "--panel-bg-color");
        applyCssVar(PANEL_BORDER, "--panel-border-color");
        applyCssVar(PANEL_TEXT, "--panel-text-color");
        const root = document.documentElement;
        const text = storageGet(PANEL_TEXT);
        if (text && isValidHexColor(text)) {
            root.style.setProperty("--panel-text-hover-color", darkenHexColor(text, 0.7));
        } else {
            root.style.removeProperty("--panel-text-hover-color");
        }
    } catch (e) {
        console.error("SpoTUI: Failed to apply panel colors", e);
    }
}

// Apply input control buttons
export function applyInputButtonsVisibility() {
    try {
        const state = storageGet(INPUT_BUTTONS) || "on";
        const controls = document.getElementById("spotui-controls");
        if (controls) {
            controls.style.display = state === "off" ? "none" : "flex";
        }
    } catch (e) {
        console.error("SpoTUI: Failed to apply input buttons visibility", e);
    }
}
// Create control buttons - Hide TUI, Enable Spotify, Back
export function createControlButtons() {
    const controls = document.createElement("div");
    controls.id = "spotui-controls";
    const state = storageGet(INPUT_BUTTONS) || "on";
    controls.style.display = state === "off" ? "none" : "flex";

    const hideBtn = createButton("hide-tui-btn", "spotui-control-btn", "Hide TUI", () => {
        const hidden = document.body.classList.toggle("spotui-tui-hidden");
        hideBtn.textContent = hidden ? "Show TUI" : "Hide TUI";
    });

    const spotifyBtn = createButton("enable-spotify-btn", "spotui-control-btn", "Enable Spotify", () => {
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

    const backBtn = createButton("spotui-back-btn", "spotui-control-btn", "Back", () => {
        document.body.classList.remove("spotui-search-mode", "spotui-spotify-enabled", "spotui-tui-hidden");
        spotifyBtn.textContent = "Enable Spotify";
        hideBtn.textContent = "Hide TUI";
        syncLyricsState();
    });
    document.body.appendChild(backBtn);
}
// Toggle ASCII logo visibility
export function toggleLogo(state) {
    if (state === "on") {
        document.body.classList.remove("logo-off");
        document.body.classList.add("logo-on");
        storageSet("spotui:logo-visible", "on");
    } else if (state === "off") {
        document.body.classList.remove("logo-on");
        document.body.classList.add("logo-off");
        storageSet("spotui:logo-visible", "off");
    }
}
// Reset all theme customizations to defaults
// Preserves launched state, update banner preference, and keybinds unless fullRestore
export function resetAllSettings() {
    const wp = document.getElementById("spotui-wallpaper");
    if (wp) wp.remove();
    storageRemove(WP_URL_KEY);
    storageRemove(WP_OPACITY_KEY);

    app.asciiEnabled = true;
    storageRemove(ANIMATION_KEY);

    storageRemove("spotui:logo-visible");
    document.body.classList.remove("logo-off");

    storageRemove(LYRICS_COLOR_ACTIVE);
    storageRemove(LYRICS_COLOR_INACTIVE);
    storageRemove(LYRICS_COLOR_LIGHT_INACTIVE);
    applyLyricColors();

    storageRemove(PLAYER_BAR_BG);
    storageRemove(PLAYER_BAR_BORDER);
    storageRemove(PLAYER_BAR_TEXT);
    storageRemove(PLAYER_BAR_VISIBLE);
    storageRemove(CUSTOM_BAR_ENABLED);
    storageRemove(CUSTOM_BAR_PROGRESS_STYLE);
    applyPlayerBarColors();
    applyPlayerBarVisibility();
    applyCustomBarState();

    storageRemove(PROGRESS_BAR_BG);
    storageRemove(PROGRESS_BAR_FG);
    applyProgressBarColors();

    storageRemove(INPUT_BG);
    storageRemove(INPUT_BG_HOVER);
    storageRemove(INPUT_TEXT);
    storageRemove(INPUT_BORDER);
    storageRemove(INPUT_BUTTONS);
    applyInputColors();
    applyInputButtonsVisibility();

    storageRemove(PANEL_BG);
    storageRemove(PANEL_BORDER);
    storageRemove(PANEL_TEXT);
    applyPanelColors();
}
