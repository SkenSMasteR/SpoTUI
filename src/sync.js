import { execute } from "./commands.js";
import { CUSTOM_BAR_PROGRESS_STYLE, PROGRESS_STYLES } from "./constants.js";
import { getCurrentTrackLyricsInfo, resolveTrackLyrics } from "./lyrics.js";
import { getPlaylists, normalizeTrackItem } from "./playlists.js";
import { searchSpotify } from "./search.js";
import { storageGet } from "./storage.js";

const WS_URL = "ws://localhost:8765";
const HEARTBEAT_MS = 1000;
const RECONNECT_MS = 3000;

let socket = null;
let reconnectTimer = null;
let heartbeatTimer = null;
let lyricsToken = 0;
let lyricsCache = { uri: "", lines: [], synced: false, instrumental: false, error: "", loading: false };

function toHex(value, fallback) {
    const v = String(value || "").trim();
    if (!v || v === "transparent" || v === "none") return fallback;
    if (v[0] === "#") {
        if (v.length === 4 || v.length === 5) return "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
        return v.slice(0, 7);
    }
    const m = v.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return fallback;
    return "#" + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
}

function cssVar(name, fallback) {
    return toHex(getComputedStyle(document.documentElement).getPropertyValue(name), fallback);
}

function getColors() {
    return {
        active: cssVar("--lyrics-color-active", "#ff8c42"),
        inactive: cssVar("--lyrics-color-inactive", "#777777"),
        near: cssVar("--lyrics-color-light-inactive", "#b3b3b3"),
        accent: cssVar("--spotui-accent", "#ff8c42"),
        panel_bg: cssVar("--panel-bg-color", "#000000"),
        panel_border: cssVar("--panel-border-color", "#ff8c42"),
        panel_text: cssVar("--panel-text-color", "#ff8c42"),
        bar_bg: cssVar("--player-bar-background", "#000000"),
        bar_text: cssVar("--player-bar-text-color", "#ff8c42"),
    };
}

function isPlayingNow() {
    try {
        if (typeof Spicetify.Player.isPlaying === "function") return Spicetify.Player.isPlaying();
    } catch {}
    return !Spicetify.Player.data?.isPaused;
}

function getDurationMs(item) {
    if (!item) return 0;
    if (typeof item.duration === "number") return item.duration;
    if (item.duration?.milliseconds != null) return item.duration.milliseconds;
    return 0;
}

function getTrackPayload() {
    const data = Spicetify.Player.data;
    const item = data?.item ?? data?.track;
    if (!item) return null;
    return {
        type: "update",
        title: item.name ?? item.metadata?.title ?? "",
        artist: item.artists?.map((a) => a.name).join(", ") ?? item.metadata?.artist_name ?? "",
        album: item.album?.name ?? item.metadata?.album_title ?? "",
        uri: item.uri ?? "",
        duration_ms: getDurationMs(item),
        position_ms: Spicetify.Player.getProgress() || 0,
        is_playing: isPlayingNow(),
        timestamp: Date.now(),
        colors: getColors(),
        lyrics: lyricsCache,
        progress_style: storageGet(CUSTOM_BAR_PROGRESS_STYLE) || "classic-block",
        progress_chars: PROGRESS_STYLES[storageGet(CUSTOM_BAR_PROGRESS_STYLE) || "classic-block"] || PROGRESS_STYLES["classic-block"],
    };
}

function sendJson(obj) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(obj));
}

function send() {
    const payload = getTrackPayload();
    if (payload) sendJson(payload);
}

async function refreshLyrics() {
    const info = getCurrentTrackLyricsInfo();
    const token = ++lyricsToken;
    if (!info) {
        lyricsCache = { uri: "", lines: [], synced: false, instrumental: false, error: "", loading: false };
        send();
        return;
    }
    if (lyricsCache.uri === info.uri && (lyricsCache.lines.length || lyricsCache.instrumental || lyricsCache.error) && !lyricsCache.loading) {
        send();
        return;
    }
    lyricsCache = { uri: info.uri, lines: [], synced: false, instrumental: false, error: "", loading: true };
    send();
    const result = await resolveTrackLyrics(info);
    if (token !== lyricsToken) return;
    lyricsCache = {
        uri: info.uri,
        lines: result.lines || [],
        synced: Boolean(result.synced),
        instrumental: Boolean(result.instrumental),
        error: result.error || "",
        loading: false,
    };
    send();
}

async function sendSongs(uri) {
    let songs = [];
    try {
        const res = await Spicetify.Platform.PlaylistAPI.getContents(uri);
        songs = (res.items || [])
            .filter((item) => item && item.uri && item.isPlayable !== false)
            .map((item, index) => normalizeTrackItem(item, index))
            .map((s) => ({ name: s.name, artist: s.artist, uri: s.uri }));
    } catch {}
    sendJson({ type: "songs", uri, songs });
}

async function handleTuiSearch(query) {
    sendJson({ type: "search", query, results: [] });
    try {
        const { results } = await searchSpotify(query);
        sendJson({
            type: "search",
            query,
            results: (results || []).map((r) => ({ name: r.name, uri: r.uri, type: r.type || "" })),
        });
    } catch {
        sendJson({ type: "search", query, results: [] });
    }
}

async function handleTuiPlaylist(argText) {
    let list = [];
    try { list = await getPlaylists(); } catch { list = []; }
    const slim = list.map((p) => ({ name: p.name, uri: p.uri }));
    if (argText) {
        const q = argText.toLowerCase();
        const match = slim.filter((p) => p.name.toLowerCase().includes(q));
        if (match.length === 1) {
            Spicetify.Player.playUri(match[0].uri);
            return;
        }
        if (match.length > 1) {
            sendJson({ type: "playlists", playlists: match });
            if (match[0]?.uri) sendSongs(match[0].uri);
            return;
        }
    }
    sendJson({ type: "playlists", playlists: slim });
    if (slim[0]?.uri) sendSongs(slim[0].uri);
}

function playUri(uri, context) {
    if (!uri) return;
    if (context) Spicetify.Player.playUri(context, {}, { skipTo: { uri } });
    else Spicetify.Player.playUri(uri);
}

function scheduleReconnect() {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, RECONNECT_MS);
}

function connect() {
    try {
        socket = new WebSocket(WS_URL);
    } catch {
        scheduleReconnect();
        return;
    }
    socket.onopen = () => {
        send();
        refreshLyrics();
    };
    socket.onclose = scheduleReconnect;
    socket.onerror = () => {
        try { socket.close(); } catch {}
    };
    socket.onmessage = (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch { return; }
        if (data?.type === "play") {
            playUri(data.uri, data.context);
            return;
        }
        if (data?.type === "get_songs" && data.uri) {
            sendSongs(data.uri);
            return;
        }
        if (data?.type === "command" && data.cmd) {
            const cleaned = String(data.cmd).trim();
            const [raw, ...rest] = cleaned.split(/\s+/);
            const command = (raw || "").toLowerCase();
            const argText = rest.join(" ").trim();
            if (command === "search") { handleTuiSearch(argText); return; }
            if (command === "playlist" || command === "list") { handleTuiPlaylist(argText); return; }
            execute(cleaned);
        }
    };
}

export function initSync() {
    if (!Spicetify?.Player || !Spicetify?.Platform) {
        setTimeout(initSync, 300);
        return;
    }
    Spicetify.Player.addEventListener("songchange", () => {
        lyricsCache = { uri: "", lines: [], synced: false, instrumental: false, error: "", loading: true };
        send();
        refreshLyrics();
    });
    Spicetify.Player.addEventListener("onplaypause", send);
    Spicetify.Player.addEventListener("onprogress", send);
    if (!heartbeatTimer) heartbeatTimer = setInterval(send, HEARTBEAT_MS);
    connect();
}
