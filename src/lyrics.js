import { execute } from "./commands.js";
import { LRC_STAMP_REGEX, LRC_STAMP_STRIP_REGEX, LYRICS_STORAGE_KEY } from "./constants.js";
import { closeActivePanel, handleGlobalEsc } from "./panels.js";
import { normalizeTrackItem } from "./playlists.js";
import { app } from "./state.js";
import { storageGet, storageSet } from "./storage.js";
import { sleep } from "./utils.js";

// Check if Spotifys lyrics panel is visible in DOM
export function detectLyricsSurface() {
    return Boolean(
        document.querySelector(
            ".main-nowPlayingView-lyricsContent, .main-lyricsCinema-container, .lyrics-lyricsContainer-LyricsContainer"
        )
    );
}

export function syncLyricsState() {
    if (document.body) {
        document.body.classList.toggle("spotui-lyrics-open", detectLyricsSurface());
    }
}

// Hook into Spotifys native lyrics button to track panel state changes
export function hookLyricsButton() {
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

// Track Spotifys lyrics panel visibility
export function initLyricsBridge() {
    if (!document.body) {
        setTimeout(initLyricsBridge, 250);
        return;
    }
    const refresh = () => {
        hookLyricsButton();
        syncLyricsState();
    };
    refresh();
    if (!app.lyricsObserver) {
        app.lyricsObserver = new MutationObserver(refresh);
        app.lyricsObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"],
        });
        window.addEventListener(
            "beforeunload",
            () => { app.lyricsObserver?.disconnect(); },
            { once: true }
        );
    }
}
// Get lyrics panel DOM elements
export function getLyricsEls() {
    const root = document.getElementById("spotui-lyrics");
    if (!root) return null;
    return {
        root,
        track: root.querySelector(".spotui-lyrics-track"),
        meta: root.querySelector(".spotui-lyrics-meta"),
        lines: root.querySelector(".spotui-lyrics-lines"),
    };
}

// Extract current playing track metadata for lyrics fetching
export function getCurrentTrackLyricsInfo() {
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

// Parse LRC format lyrics to line objects with timestamps
// LRC format: [mm:ss.ms]lyric text
// Return an array of {startTime: milliseconds, text: string}
export function parseLrc(lrcText) {
    if (!lrcText) return [];
    const lines = [];
    for (const raw of String(lrcText).split(/\r?\n/)) {
        const stamps = [...raw.matchAll(LRC_STAMP_REGEX)];
        if (!stamps.length) continue;
        const text = raw.replace(LRC_STAMP_STRIP_REGEX, "").trim();
        if (!text) continue;
        for (const stamp of stamps) {
            lines.push({ startTime: (Number(stamp[1]) * 60 + Number(stamp[2])) * 1000, text });
        }
    }
    lines.sort((a, b) => a.startTime - b.startTime);
    return lines;
}

// Convert plain text lyrics to line objects (unsynced)
// startTime -1 indicates no timing data
export function plainLyricsToLines(plainText) {
    return String(plainText || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(text => ({ startTime: -1, text }));
}

// Fetch lyrics from Spotify's color-lyrics API
// Returns {lines, synced, provider, instrumental} or null
export async function fetchSpotifyColorLyrics(uri) {
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

// Fetch lyrics from lrclib.net (fallback source)
// Tries exact match first, then searches by closest duration
export async function fetchLrclibLyrics(info) {
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

// Normalize lrclib API response to common format
export function normalizeLrclibPayload(data) {
    if (!data) return null;
    if (data.instrumental) return { lines: [], synced: false, provider: "lrclib", instrumental: true };
    const syncedLines = parseLrc(data.syncedLyrics);
    if (syncedLines.length) return { lines: syncedLines, synced: true, provider: "lrclib", instrumental: false };
    const plainLines = plainLyricsToLines(data.plainLyrics);
    if (plainLines.length) return { lines: plainLines, synced: false, provider: "lrclib", instrumental: false };
    return null;
}

// Fetch lyrics from all available sources
// Tries Spotify first, then lrclib as fallback
export async function resolveTrackLyrics(info) {
    const spotify = await fetchSpotifyColorLyrics(info.uri);
    if (spotify) return spotify;
    const lrclib = await fetchLrclibLyrics(info);
    if (lrclib) return lrclib;
    return { lines: [], synced: false, provider: "", instrumental: false, error: "No lyrics found" };
}

// Display empty state message in lyrics panel
export function renderLyricsEmpty(message, detail = "") {
    const els = getLyricsEls();
    if (!els?.lines) return;
    app.lyricsActiveIndex = -1;
    app.cachedLyricsRows = [];
    app.cachedLyricsLoaders = [];
    els.lines.classList.remove("unsynced");
    els.lines.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "spotui-lyrics-empty";
    empty.textContent = "¯\\_(ツ)_/¯";
    els.lines.appendChild(empty);
}

// Animate lyrics panel sliding out (exit transition)
export function slideLyricsOut() {
    return new Promise((resolve) => {
        const els = getLyricsEls();
        if (!els?.lines) { resolve(); return; }
        const lines = els.lines;
        lines.classList.remove("spotui-lyrics-enter", "spotui-lyrics-enter-active");
        lines.classList.add("spotui-lyrics-exit-active");
        let done = false;
        const finish = (e) => {
            if (e && e.target !== lines) return;
            if (done) return;
            done = true;
            lines.removeEventListener("transitionend", finish);
            resolve();
        };
        lines.addEventListener("transitionend", finish);
        setTimeout(finish, 400);
    });
}

// Reset transform classes after slide transition
export function resetLyricsTransform() {
    const els = getLyricsEls();
    if (!els?.lines) return;
    const lines = els.lines;
    lines.style.transition = "none";
    lines.classList.remove("spotui-lyrics-exit-active");
    void lines.offsetWidth;
    lines.style.transition = "";
}

// Animate lyrics panel sliding in (enter transition)
export function slideLyricsIn() {
    const els = getLyricsEls();
    if (!els?.lines) return;
    const lines = els.lines;
    lines.classList.remove("spotui-lyrics-exit-active");
    lines.classList.add("spotui-lyrics-enter");
    void lines.offsetWidth;
    lines.classList.add("spotui-lyrics-enter-active");
    setTimeout(() => {
        lines.classList.remove("spotui-lyrics-enter", "spotui-lyrics-enter-active");
    }, 400);
}

// Display a loader while fetching lyrics
export function renderLyricsLoading() {
    const els = getLyricsEls();
    if (!els?.lines) return;
    app.lyricsActiveIndex = -1;
    app.cachedLyricsRows = [];
    app.cachedLyricsLoaders = [];
    els.lines.classList.remove("unsynced");
    els.lines.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "spotui-lyrics-loading";
    const spinner = document.createElement("span");
    spinner.className = "spotui-lyrics-fetch-loader";
    wrap.appendChild(spinner);
    els.lines.appendChild(wrap);
}

// Render lyric lines with optional gap loaders for synced lyrics
export function renderLyricsLines(lines, synced = true) {
    const els = getLyricsEls();
    if (!els?.lines) return;
    els.lines.innerHTML = "";
    els.lines.classList.toggle("unsynced", !synced);
    app.lyricsActiveIndex = -1;
    app.cachedLyricsRows = [];
    app.cachedLyricsLoaders = [];
    if (!lines.length) { renderLyricsEmpty("¯\\_(ツ)_/¯"); return; }

    const GAP_THRESHOLD = 8000;
    const LYRIC_DURATION_ESTIMATE = 2000;

    if (synced && lines.length > 0 && lines[0].startTime > 3000) {
        const startLoader = document.createElement("div");
        startLoader.className = "spotui-lyrics-loader";
        startLoader.dataset.gapStart = "0";
        startLoader.dataset.gapEnd = String(lines[0].startTime);
        els.lines.appendChild(startLoader);
        app.cachedLyricsLoaders.push(startLoader);
    }

    lines.forEach((line, idx) => {
        const row = document.createElement("div");
        row.className = "spotui-lyrics-line";
        row.dataset.index = String(idx);
        row.textContent = line.text;
        els.lines.appendChild(row);
        app.cachedLyricsRows.push(row);

        if (synced && idx < lines.length - 1) {
            const currentLineStart = line.startTime;
            const nextLineStart = lines[idx + 1].startTime;
            const gap = nextLineStart - currentLineStart;

            if (gap >= GAP_THRESHOLD) {
                const currentLineEnd = currentLineStart + LYRIC_DURATION_ESTIMATE;
                const loader = document.createElement("div");
                loader.className = "spotui-lyrics-loader";
                loader.dataset.gapStart = String(currentLineEnd);
                loader.dataset.gapEnd = String(nextLineStart);
                els.lines.appendChild(loader);
                app.cachedLyricsLoaders.push(loader);
            }
        }
    });

    if (synced && lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        const lastLineEnd = lastLine.startTime + LYRIC_DURATION_ESTIMATE;
        const endLoader = document.createElement("div");
        endLoader.className = "spotui-lyrics-loader";
        endLoader.dataset.gapStart = String(lastLineEnd);
        endLoader.dataset.gapEnd = "999999999";
        els.lines.appendChild(endLoader);
        app.cachedLyricsLoaders.push(endLoader);
    }
}

export function findActiveLyricIndex(lines, progressMs) {
    if (!lines?.length || lines[0].startTime < 0) return -1;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startTime <= progressMs) idx = i;
        else break;
    }
    return idx;
}

// Update lyric highlight and scroll position based on playback progress
export function syncLyricsHighlight(force = false) {
    if (!app.lyricsPanelOpen || !app.lyricsCache.synced || !app.lyricsCache.lines.length) return;
    const els = getLyricsEls();
    if (!els?.lines) return;
    const progress = Spicetify.Player.getProgress() || 0;
    const next = findActiveLyricIndex(app.lyricsCache.lines, progress);

    let activeLoaderIndex = -1;
    const loaders = app.cachedLyricsLoaders;
    const animationEnabled = document.body.classList.contains("spotui-lyrics-animation-on");

    loaders.forEach((loader, loaderIdx) => {
        const gapStart = Number(loader.dataset.gapStart);
        const gapEnd = Number(loader.dataset.gapEnd);
        const isInGap = progress > gapStart && progress < gapEnd;
        if (isInGap && animationEnabled) {
            loader.style.display = "block";
            loader.classList.add("active");
            activeLoaderIndex = loaderIdx;
        } else {
            loader.style.display = "none";
            loader.classList.remove("active");
        }
    });

    const useLoader = activeLoaderIndex !== -1 && animationEnabled;
    const loaderStateChanged = useLoader && activeLoaderIndex !== app.lyricsActiveLoaderIndex;
    if (!force && next === app.lyricsActiveIndex && !useLoader && !loaderStateChanged) return;

    const rows = app.cachedLyricsRows;
    const allElements = Array.from(els.lines.children);

    if (useLoader) {
        const activeLoader = loaders[activeLoaderIndex];
        const loaderPosition = allElements.indexOf(activeLoader);

        rows.forEach((row) => {
            const rowPosition = allElements.indexOf(row);
            const distance = Math.abs(rowPosition - loaderPosition);
            row.classList.remove("active");
            row.classList.toggle("near", distance === 1);
        });
    } else {
        rows.forEach((row, idx) => {
            const distance = next < 0 ? 99 : Math.abs(idx - next);
            row.classList.toggle("active", idx === next);
            row.classList.toggle("near", distance === 1);
        });
    }

    app.lyricsActiveIndex = useLoader ? -1 : next;
    app.lyricsActiveLoaderIndex = useLoader ? activeLoaderIndex : -1;

    if (!useLoader && next >= 0) {
        rows[next]?.scrollIntoView({ block: "center", behavior: force ? "auto" : "smooth" });
    } else if (useLoader && (loaderStateChanged || force)) {
        loaders[activeLoaderIndex]?.scrollIntoView({ block: "center", behavior: force ? "auto" : "smooth" });
    }
}

// Update lyrics panel header with track title and status
export function setLyricsHeader(info, statusText) {
    const els = getLyricsEls();
    if (!els) return;
    if (els.track) els.track.textContent = info ? `${info.title}${info.artist ? ` — ${info.artist}` : ""}` : "Nothing playing";
    if (els.meta) els.meta.textContent = statusText || "";
}

// Load lyrics for currently playing track with optional slide transition
export async function loadLyricsForCurrentTrack(isTransition = false) {
    const token = ++app.lyricsLoadToken;
    const info = getCurrentTrackLyricsInfo();
    const els = getLyricsEls();
    if (!els) return;

    if (isTransition) {
        await slideLyricsOut();
        if (token !== app.lyricsLoadToken) return;
        resetLyricsTransform();
    }

    if (!info) {
        app.lyricsCache = { uri: "", lines: [], synced: false, provider: "", instrumental: false, error: "" };
        setLyricsHeader(null, "");
        renderLyricsEmpty("¯\\_(ツ)_/¯");
        if (isTransition) slideLyricsIn();
        return;
    }

    if (app.lyricsCache.uri === info.uri && (app.lyricsCache.lines.length || app.lyricsCache.instrumental || app.lyricsCache.error)) {
        setLyricsHeader(info, app.lyricsCache.instrumental ? "instrumental" : `${app.lyricsCache.synced ? "synced" : "unsynced"} · ${app.lyricsCache.provider || "cache"}`);
        if (app.lyricsCache.instrumental) renderLyricsEmpty("Instrumental", "No vocals to show for this track.");
        else if (app.lyricsCache.error) renderLyricsEmpty("No lyrics", app.lyricsCache.error);
        else { renderLyricsLines(app.lyricsCache.lines, app.lyricsCache.synced); syncLyricsHighlight(true); }
        if (isTransition) slideLyricsIn();
        return;
    }

    setLyricsHeader(info, "fetching…");
    renderLyricsLoading();

    const fetchPromise = resolveTrackLyrics(info);
    const result = isTransition
        ? (await Promise.all([fetchPromise, sleep(1000)]))[0]
        : await fetchPromise;

    if (token !== app.lyricsLoadToken || !app.lyricsPanelOpen) return;

    app.lyricsCache = {
        uri: info.uri,
        lines: result.lines || [],
        synced: Boolean(result.synced),
        provider: result.provider || "",
        instrumental: Boolean(result.instrumental),
        error: result.error || "",
    };

    if (app.lyricsCache.instrumental) { setLyricsHeader(info, "instrumental"); renderLyricsEmpty("¯\\_(ツ)_/¯"); if (isTransition) slideLyricsIn(); return; }
    if (!app.lyricsCache.lines.length) { setLyricsHeader(info, "not found"); renderLyricsEmpty("¯\\_(ツ)_/¯"); if (isTransition) slideLyricsIn(); return; }
    setLyricsHeader(info, `${app.lyricsCache.synced ? "synced" : "unsynced"} · ${app.lyricsCache.provider}`);
    renderLyricsLines(app.lyricsCache.lines, app.lyricsCache.synced);
    syncLyricsHighlight(true);
    if (isTransition) slideLyricsIn();
}

// Persist lyrics panel open/closed state
export function storeLyricsOpen(open) {
    storageSet(LYRICS_STORAGE_KEY, open ? "1" : "0");
}

// Check if a playable track is loaded in Spotify player
export function hasPlayableTrackItem() {
    const item = Spicetify?.Player?.data?.item;
    return Boolean(item?.uri && String(item.uri).includes(":track:"));
}

// Wait for player to load a track, then execute callback
// Polls up to 40 times (10 seconds) before giving up
export function waitForPlayerReadyThen(callback, attempt = 0) {
    if (hasPlayableTrackItem()) {
        callback();
        return;
    }
    if (attempt >= 40) {
        callback();
        pollForTrackThenReload();
        return;
    }
    setTimeout(() => waitForPlayerReadyThen(callback, attempt + 1), 250);
}

// Poll for track availability and reload lyrics when found
export function pollForTrackThenReload() {
    if (!app.lyricsPanelOpen) return;
    if (hasPlayableTrackItem()) {
        loadLyricsForCurrentTrack();
        return;
    }
    setTimeout(pollForTrackThenReload, 1000);
}

// Open lyrics panel and start syncing with playback
export function openLyricsPanel() {
    closeActivePanel();
    app.lyricsPanelOpen = true;
    storeLyricsOpen(true);
    document.body.classList.add("spotui-lyrics-panel");
    
    const logoVisible = storageGet("spotui:logo-visible");
    if (logoVisible === "on") {
        document.body.classList.add("logo-on");
        document.body.classList.remove("logo-off");
    } else if (logoVisible === "off") {
        document.body.classList.add("logo-off");
        document.body.classList.remove("logo-on");
    } else {
        document.body.classList.add("logo-on");
        document.body.classList.remove("logo-off");
    }
    
    document.addEventListener("keydown", handleGlobalEsc);
    const root = document.getElementById("spotui-lyrics");
    if (root) {
        root.hidden = false;
        setTimeout(() => root.classList.add("spotui-lyrics-active"), 10);
    }
    bindLyricsEvents();
    loadLyricsForCurrentTrack();
    if (!app.lyricsSyncInterval) {
        app.lyricsSyncInterval = setInterval(() => syncLyricsHighlight(), 200);
    }
}

// Close lyrics panel and clean up interval/listeners
export function closeLyricsPanel() {
    if (!app.lyricsPanelOpen) return;
    app.lyricsPanelOpen = false;
    app.lyricsLoadToken += 1;
    resetLyricsTransform();
    storeLyricsOpen(false);
    document.removeEventListener("keydown", handleGlobalEsc);
    const root = document.getElementById("spotui-lyrics");
    if (root) {
        root.classList.remove("spotui-lyrics-active");
        setTimeout(() => {
            if (!app.lyricsPanelOpen) {
                root.hidden = true;
                document.body.classList.remove("spotui-lyrics-panel");
            }
        }, 500);
    } else {
        document.body.classList.remove("spotui-lyrics-panel");
    }
    if (app.lyricsSyncInterval) { clearInterval(app.lyricsSyncInterval); app.lyricsSyncInterval = null; }
}

// Attach event listener for track changes to reload lyrics
export function bindLyricsEvents() {
    if (app.lyricsBound || !Spicetify.Player?.addEventListener) return;
    app.lyricsBound = true;
    Spicetify.Player.addEventListener("songchange", () => {
        if (!app.lyricsPanelOpen) return;
        app.lyricsCache = { uri: "", lines: [], synced: false, provider: "", instrumental: false, error: "" };
        loadLyricsForCurrentTrack(true);
    });
}

// Handle lyrics command
export function handleLyricsCommand(arg) {
    const mode = String(arg || "").trim().toLowerCase();
    if (mode === "on" || mode === "open") { openLyricsPanel(); return; }
    if (mode === "off" || mode === "close") { closeLyricsPanel(); return; }
    if (mode && mode !== "toggle") return;
    if (app.lyricsPanelOpen) { closeLyricsPanel(); }
    else { openLyricsPanel(); }
}
