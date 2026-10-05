import { emitPaneClose } from "./actions.js";
import { normalizeTrackItem } from "./playlists.js";
import { app } from "./state.js";

function loadQueue() {
    const q = Spicetify.Queue || {};
    const cur = q.track;
    const tracks = [];
    if (cur) tracks.push({ ...normalizeTrackItem(cur, 0), uid: cur.uid, current: true });
    (q.nextTracks || []).forEach((t, i) => tracks.push({ ...normalizeTrackItem(t, i + 1), uid: t.uid, current: false }));
    app.queueTracks = tracks;
    app.selectedQueue = 0;
}

function onSongChange() {
    if (!app.queuePanelOpen || app.queueGrab >= 0) return;
    const sel = app.queueTracks[app.selectedQueue];
    loadQueue();
    if (sel) {
        const i = app.queueTracks.findIndex((t) => (sel.uid && t.uid === sel.uid) || t.uri === sel.uri);
        if (i >= 0) app.selectedQueue = i;
    }
    renderQueueList();
}

function renderQueueList() {
    const el = document.getElementById("spotui-queue-list");
    if (!el) return;
    const legend = document.createElement("legend");
    legend.textContent = "Queue";
    const nodes = app.queueTracks.map((t, i) => {
        const d = document.createElement("div");
        d.className = "playlist-item" + (i === app.selectedQueue ? " selected" : "");
        d.textContent = (app.queueGrab === i ? "> " : "") + (t.current ? "\u25B6 " : "") + t.name + (t.artist ? " - " + t.artist : "");
        return d;
    });
    el.replaceChildren(legend, ...nodes);
    el.children[app.selectedQueue + 1]?.scrollIntoView({ block: "nearest" });
}

async function applyQueueOrder() {
    const i = app.queueTracks.findIndex((t) => t.current);
    const next = app.queueTracks.slice(i < 0 ? 0 : i + 1).map((t) => ({ uri: t.uri, uid: t.uid }));
    await Spicetify.Platform.PlayerAPI.clearQueue();
    if (next.length) await Spicetify.addToQueue(next);
}

function handleQueueKeydown(e) {
    if (!app.queuePanelOpen) return;
    e.stopPropagation();
    if (e.key === "Escape") {
        e.preventDefault();
        closeQueuePanel();
        return;
    }
    if (e.key === "Tab") {
        e.preventDefault();
        if (app.queueGrab < 0) { if (app.selectedQueue) app.queueGrab = app.selectedQueue; }
        else {
            app.queueGrab = -1;
            applyQueueOrder();
        }
        renderQueueList();
        return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? -1 : 1;
        const n = app.queueTracks.length;
        if (!n) return;
        const to = app.selectedQueue + dir;
        if (to < 0 || to >= n) return;
        if (app.queueGrab >= 0) {
            if (!to) return;
            const a = app.queueTracks;
            [a[app.selectedQueue], a[to]] = [a[to], a[app.selectedQueue]];
            app.selectedQueue = app.queueGrab = to;
        } else app.selectedQueue = to;
        renderQueueList();
        return;
    }
    if (e.key === "Enter") {
        e.preventDefault();
        if (!app.selectedQueue) return;
        for (let i = app.selectedQueue; i--;) Spicetify.Player.next();
        closeQueuePanel();
    }
}

export function closeQueuePanel() {
    const wasOpen = app.queuePanelOpen;
    app.queuePanelOpen = false;
    app.queueGrab = -1;
    document.body.classList.remove("spotui-queue-panel");
    const panel = document.getElementById("spotui-queue-panel");
    if (panel) panel.hidden = true;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
    document.removeEventListener("keydown", handleQueueKeydown, true);
    Spicetify.Player.removeEventListener("songchange", onSongChange);
    if (wasOpen) emitPaneClose("queue");
}

export function openQueuePanel() {
    loadQueue();
    app.queueGrab = -1;
    app.queuePanelOpen = true;
    document.body.classList.add("spotui-queue-panel");
    const panel = document.getElementById("spotui-queue-panel");
    if (panel) panel.hidden = false;
    const input = document.getElementById("spotui-input");
    if (input) input.blur();
    renderQueueList();
    document.addEventListener("keydown", handleQueueKeydown, true);
    Spicetify.Player.addEventListener("songchange", onSongChange);
}
