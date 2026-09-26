import { jamSay } from "./jam.js";
import { closeAdd2listPanel, closePlaylistPanel } from "./panels.js";
import { app } from "./state.js";
import { print } from "./terminal.js";

export const PLAYLIST_SONGS_FETCH_DELAY = 150;

export function scheduleSongsFetchForSelectedPlaylist() {
    if (app.playlistSongsFetchTimer) clearTimeout(app.playlistSongsFetchTimer);
    app.playlistSongsFetchTimer = setTimeout(() => {
        app.playlistSongsFetchTimer = null;
        fetchSongsForSelectedPlaylist();
    }, PLAYLIST_SONGS_FETCH_DELAY);
}

export function getLikedSongsUri() {
    try {
        const internalUri = Spicetify.Platform?.LibraryAPI?._likedSongsUri;
        if (internalUri) return internalUri;
        const username = Spicetify.Platform?.LocalStorageAPI?.namespace;
        if (!username) return "";
        return `spotify:user:${username}:collection`;
    } catch (e) {
        return "";
    }
}

export async function fetchSongsForSelectedPlaylist() {
    const token = ++app.playlistSongsFetchToken;
    cancelSongScrollAnim();
    const selectedPlaylistEntry = app.playlists[app.selectedPlaylist];
    const selectedPlaylistUri = selectedPlaylistEntry?.isLikedSongs
        ? getLikedSongsUri()
        : selectedPlaylistEntry?.uri;
    let songs = [];

    if (selectedPlaylistUri) {
        try {
            const res = await Spicetify.Platform.PlaylistAPI.getContents(selectedPlaylistUri);
            songs = (res.items || [])
                .filter(item => item && item.uri && item.isPlayable !== false)
                .map((item, index) => normalizeTrackItem(item, index));
        } catch (err) {
            songs = [{ name: "Error loading songs", artist: "" }];
        }
    }

    if (token !== app.playlistSongsFetchToken) return;

    app.playlistSongs = songs;
    app.playlistSongsDefault = songs.slice();
    app.playlistSongsTotal = songs.length;
    renderSongListVirtual();
    if (app.activePane === "song") scrollSongIntoView(app.selectedSong, false);
}

export async function renderPlaylistPanel() {
    const playlistList = document.getElementById("spotui-playlist-list");
    const songList = document.getElementById("spotui-song-list");
    if (!playlistList || !songList) return;

    renderPlaylistListVirtual();

    if (app.playlistSongsFetchTimer) {
        clearTimeout(app.playlistSongsFetchTimer);
        app.playlistSongsFetchTimer = null;
    }
    await fetchSongsForSelectedPlaylist();

    scrollSelectedIntoView();
}

// Virtual scrolling constants for performance with large playlists
export const SONG_ROW_HEIGHT = 26; // px
export const PLAYLIST_ROW_HEIGHT = 26; // px
const PLAYLIST_SORT_OPTS = ["Default", "Alphabetical", "Recently played"];

export function renderPlaylistSortMenu() {
    const el = document.getElementById("spotui-playlist-sort");
    if (!el) return;
    el.hidden = !app.playlistSortOpen;
    el.classList.toggle("songs", app.activePane === "song");
    if (!app.playlistSortOpen) return;
    el.innerHTML = PLAYLIST_SORT_OPTS.map((label, i) => `<div class="playlist-item${i === app.playlistSortIndex ? " selected" : ""}">${label}</div>`).join("");
}


export function ensurePlaylistListScaffold() {
    const id = app.add2listPanelOpen ? "spotui-add2list-list" : "spotui-playlist-list";
    const container = document.getElementById(id);
    if (!container || document.getElementById(id + "-spacer")) return;
    container.innerHTML = '<legend>Playlists</legend><div id="' + id + '-spacer" style="position:relative;"><div id="' + id + '-viewport" style="position:absolute;top:0;left:0;right:0;"></div></div>';
    container.addEventListener("scroll", () => {
        if (app.playlistListScrollRaf) return;
        app.playlistListScrollRaf = requestAnimationFrame(() => {
            app.playlistListScrollRaf = null;
            renderPlaylistListVirtual();
        });
    });
}

// Render visible playlist items using virtual scrolling
export function renderPlaylistListVirtual() {
    const id = app.add2listPanelOpen ? "spotui-add2list-list" : "spotui-playlist-list";
    const container = document.getElementById(id);
    if (!container) return;
    ensurePlaylistListScaffold();
    const spacer = document.getElementById(id + "-spacer");
    const viewport = document.getElementById(id + "-viewport");
    if (!spacer || !viewport) return;

    const total = app.playlists.length;
    spacer.style.height = `${total * PLAYLIST_ROW_HEIGHT}px`;

    const scrollTop = container.scrollTop;
    const viewHeight = container.clientHeight || 400;
    const buffer = 10;
    const startIdx = Math.max(0, Math.floor(scrollTop / PLAYLIST_ROW_HEIGHT) - buffer);
    const endIdx = Math.min(total, Math.ceil((scrollTop + viewHeight) / PLAYLIST_ROW_HEIGHT) + buffer);

    const needed = Math.max(0, endIdx - startIdx);
    while (viewport.childNodes.length > needed) viewport.removeChild(viewport.lastChild);
    while (viewport.childNodes.length < needed) viewport.appendChild(document.createElement("div"));
    viewport.style.transform = `translateY(${startIdx * PLAYLIST_ROW_HEIGHT}px)`;
    for (let i = 0; i < needed; i++) {
        const idx = startIdx + i;
        const p = app.playlists[idx];
        const item = viewport.childNodes[i];
        const className = "playlist-item" + (idx === app.selectedPlaylist && (app.activePane === "playlist" || app.add2listPanelOpen) ? " selected" : "");
        const text = p.name;
        if (item.className !== className) item.className = className;
        if (item.textContent !== text) item.textContent = text;
    }
}

export function scrollPlaylistIntoView(idx, smooth = true) {
    const container = document.getElementById(app.add2listPanelOpen ? "spotui-add2list-list" : "spotui-playlist-list");
    if (!container) return;
    const itemTop = idx * PLAYLIST_ROW_HEIGHT;
    const itemCenter = itemTop + PLAYLIST_ROW_HEIGHT / 2;
    const targetScrollTop = itemCenter - container.clientHeight / 2;
    container.scrollTo({
        top: targetScrollTop,
        behavior: smooth ? "smooth" : "auto",
    });
}


export function ensureSongListScaffold() {
    const container = document.getElementById("spotui-song-list");
    if (!container || document.getElementById("spotui-song-list-spacer")) return;
    container.innerHTML = '<legend>Songs</legend><div id="spotui-song-list-spacer" style="position:relative;"><div id="spotui-song-list-viewport" style="position:absolute;top:0;left:0;right:0;"></div></div>';
    container.addEventListener("scroll", () => {
        if (app.songListScrollRaf) return;
        app.songListScrollRaf = requestAnimationFrame(() => {
            app.songListScrollRaf = null;
            renderSongListVirtual();
        });
    });
}

// Render visible song items with virtual scrolling
export function renderSongListVirtual() {
    const container = document.getElementById("spotui-song-list");
    if (!container) return;
    ensureSongListScaffold();
    const spacer = document.getElementById("spotui-song-list-spacer");
    const viewport = document.getElementById("spotui-song-list-viewport");
    if (!spacer || !viewport) return;

    const total = app.playlistSongs.length;
    spacer.style.height = `${total * SONG_ROW_HEIGHT}px`;

    const scrollTop = container.scrollTop;
    const viewHeight = container.clientHeight || 400;
    const buffer = 10;
    const startIdx = Math.max(0, Math.floor(scrollTop / SONG_ROW_HEIGHT) - buffer);
    const endIdx = Math.min(total, Math.ceil((scrollTop + viewHeight) / SONG_ROW_HEIGHT) + buffer);

    const needed = Math.max(0, endIdx - startIdx);
    while (viewport.childNodes.length > needed) viewport.removeChild(viewport.lastChild);
    while (viewport.childNodes.length < needed) viewport.appendChild(document.createElement("div"));
    viewport.style.transform = `translateY(${startIdx * SONG_ROW_HEIGHT}px)`;
    for (let i = 0; i < needed; i++) {
        const idx = startIdx + i;
        const s = app.playlistSongs[idx];
        const item = viewport.childNodes[i];
        const className = "song-item" + (idx === app.selectedSong && app.activePane === "song" ? " selected" : "");
        const text = `${s.name} - ${s.artist}`;
        if (item.className !== className) item.className = className;
        if (item.textContent !== text) item.textContent = text;
    }
}

export function scrollSongIntoView(idx, smooth = true) {
    const container = document.getElementById("spotui-song-list");
    if (!container) return;
    const itemTop = idx * SONG_ROW_HEIGHT;
    const itemCenter = itemTop + SONG_ROW_HEIGHT / 2;
    const targetScrollTop = itemCenter - container.clientHeight / 2;
    container.scrollTo({
        top: targetScrollTop,
        behavior: smooth ? "smooth" : "auto",
    });
}

export function cancelSongScrollAnim() {
    if (app.songScrollAnimRaf) {
        cancelAnimationFrame(app.songScrollAnimRaf);
        app.songScrollAnimRaf = null;
    }
}

export function animateSongScrollToIndex(targetIdx) {
    cancelSongScrollAnim();
    const container = document.getElementById("spotui-song-list");
    if (!container) return;

    const token = app.playlistSongsFetchToken;
    const total = app.playlistSongs.length;
    if (!total) return;
    const destination = Math.max(0, Math.min(targetIdx, total - 1));
    const viewHeight = container.clientHeight || 400;
    const targetTop = Math.max(0, destination * SONG_ROW_HEIGHT - viewHeight / 2);
    if (Math.abs(targetTop - container.scrollTop) > viewHeight * 3) {
        container.scrollTop = targetTop;
        renderSongListVirtual();
        return;
    }

    const step = () => {
        app.songScrollAnimRaf = null;
        if (!app.playlistPanelOpen || app.activePane !== "song" || token !== app.playlistSongsFetchToken) return;

        const current = container.scrollTop;
        const distance = targetTop - current;
        if (Math.abs(distance) < 1) return;

        const speed = Math.max(36, Math.min(Math.abs(distance) * 0.25, 1800));
        container.scrollTop = current + Math.sign(distance) * Math.min(speed, Math.abs(distance));
        renderSongListVirtual();
        app.songScrollAnimRaf = requestAnimationFrame(step);
    };

    app.songScrollAnimRaf = requestAnimationFrame(step);
}

export function scrollSelectedIntoView() {
    if (app.activePane === 'playlist') {
        scrollPlaylistIntoView(app.selectedPlaylist);
    } else {
        scrollSongIntoView(app.selectedSong);
    }
}


// Update song list after navigation
export function commitSongNav(smooth) {
    renderSongListVirtual();
    scrollSongIntoView(app.selectedSong, smooth);
}

// Handle keyboard navigation in playlist panel
export async function handlePlaylistPanelKeydown(e) {
    if (app.playlistSortOpen) {
        if (e.key === "Escape" || e.key === "o" || e.key === "O") {
            e.preventDefault();
            app.playlistSortOpen = false;
            renderPlaylistSortMenu();
            return;
        }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const dir = e.key === "ArrowDown" ? 1 : -1;
            app.playlistSortIndex = (app.playlistSortIndex + dir + PLAYLIST_SORT_OPTS.length) % PLAYLIST_SORT_OPTS.length;
            renderPlaylistSortMenu();
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            const sortSongs = app.activePane === "song";
            const list = (sortSongs ? app.playlistSongsDefault || app.playlistSongs : app.playlistsDefault || app.playlists).slice();
            if (app.playlistSortIndex === 1) list.sort((a, b) => a.name.localeCompare(b.name));
            else if (app.playlistSortIndex === 2) list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
            app.playlistSortOpen = false;
            renderPlaylistSortMenu();
            if (sortSongs) {
                app.playlistSongs = list;
                app.playlistSongsTotal = list.length;
                if (app.selectedSong >= list.length) app.selectedSong = Math.max(0, list.length - 1);
                renderSongListVirtual();
                scrollSongIntoView(app.selectedSong, false);
            } else {
                app.playlists = list;
                if (app.selectedPlaylist >= list.length) app.selectedPlaylist = Math.max(0, list.length - 1);
                renderPlaylistListVirtual();
                scrollPlaylistIntoView(app.selectedPlaylist, false);
                scheduleSongsFetchForSelectedPlaylist();
            }
            return;
        }
        return;
    }

    if (!app.add2listPanelOpen && (e.key === "o" || e.key === "O") && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        app.playlistSortOpen = true;
        app.playlistSortIndex = 0;
        renderPlaylistSortMenu();
        return;
    }

    if (e.key === "Escape") {
        e.preventDefault();
        if (app.add2listPanelOpen) closeAdd2listPanel();
        else closePlaylistPanel();
        return;
    }

    const isPlaylist = app.activePane === 'playlist';

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? -1 : 1;

        if (isPlaylist) {
            if (!app.playlists.length) return;
            cancelSongScrollAnim();
            app.selectedPlaylist = (app.selectedPlaylist + dir + app.playlists.length) % app.playlists.length;
            const now = performance.now();
            app.playlistNavFast = e.repeat || now - app.playlistNavLastAt < 160;
            app.playlistNavLastAt = now;

            if (app.navRafPending) return;
            app.navRafPending = true;
            requestAnimationFrame(() => {
                app.navRafPending = false;
                renderPlaylistListVirtual();
                scrollPlaylistIntoView(app.selectedPlaylist, !app.playlistNavFast);
            });

            if (!app.add2listPanelOpen) scheduleSongsFetchForSelectedPlaylist();
            return;
        }

        if (!app.playlistSongs.length) return;

        const navTotal = app.playlistSongsTotal || app.playlistSongs.length;
        const prevSelected = app.selectedSong;
        app.selectedSong = (prevSelected + dir + navTotal) % navTotal;
        const wrapped = (dir === -1 && prevSelected === 0) || (dir === 1 && prevSelected === navTotal - 1);
        const now = performance.now();
        app.playlistNavFast = e.repeat || now - app.playlistNavLastAt < 160;
        app.playlistNavLastAt = now;

        if (app.navRafPending) return;
        app.navRafPending = true;
        requestAnimationFrame(() => {
            app.navRafPending = false;
            cancelSongScrollAnim();
            if (wrapped && !app.playlistNavFast) {
                renderSongListVirtual();
                animateSongScrollToIndex(app.selectedSong);
            } else {
                commitSongNav(!app.playlistNavFast);
            }
        });
        return;
    }

    if (app.add2listPanelOpen) {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            const p = app.playlists[app.selectedPlaylist];
            const uri = Spicetify.Player.data?.item?.uri || Spicetify.Player.data?.track?.uri;
            if (!uri) { jamSay("Nothing playing"); return; }
            if (!p) return;
            try {
                await Spicetify.Platform.PlaylistAPI.add(p.uri, [uri], { after: "end" });
                jamSay("Added to " + p.name);
                closeAdd2listPanel();
            } catch (err) {
                jamSay("Add error: " + (err.message || err));
            }
        }
        return;
    }

    if (e.key === "ArrowLeft") {
        e.preventDefault();
        app.activePane = 'playlist';
        await renderPlaylistPanel();
    } else if (e.key === "ArrowRight") {
        e.preventDefault();
        app.activePane = 'song';
        await renderPlaylistPanel();
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (isPlaylist) {
            const p = app.playlists[app.selectedPlaylist];
            if (p) {
                Spicetify.Player.playUri(p.uri);
                print("Playing playlist: " + p.name);
                closePlaylistPanel();
            }
        } else {
            const song = app.playlistSongs[app.selectedSong];
            const context = app.playlists[app.selectedPlaylist];
            if (song && context) {
                Spicetify.Player.playUri(context.uri, {}, { skipTo: { uri: song.uri } });
                print(`Playing: ${song.name} from ${context.name}`);
                closePlaylistPanel();
            }
        }
    }
}

export function getTrackTitle(track, index = 0) {
    const meta = track?.metadata || track?.contextTrack?.metadata || {};
    return track?.name || track?.title || meta.title || meta.name || `Track ${index + 1}`;
}

export function getTrackArtist(track) {
    const meta = track?.metadata || track?.contextTrack?.metadata || {};
    if (track?.artist) return track.artist;
    if (Array.isArray(track?.artists) && track.artists.length) {
        return track.artists.map((artist) => artist?.name).filter(Boolean).join(", ");
    }
    if (meta.artist_name) return meta.artist_name;
    if (meta["artist_name:1"]) return meta["artist_name:1"];
    return "";
}

// Normalize track object to consistent {uri, name, artist} format
export function normalizeTrackItem(track, index = 0) {
    const uri = track?.uri || track?.contextTrack?.uri || "";
    return {
        uri,
        name: getTrackTitle(track, index),
        artist: getTrackArtist(track),
        addedAt: typeof track?.addedAt === "number" ? track.addedAt : Date.parse(track?.addedAt || track?.added_at || "") || 0,
    };
}

export async function getPlaylists() {
    const rootlist = await Spicetify.Platform.RootlistAPI.getContents();
    const list = [];
    const likedSongsUri = getLikedSongsUri();
    if (likedSongsUri) {
        list.push({ name: "Liked Songs", uri: likedSongsUri, isLikedSongs: true });
    }
    function flatten(items) {
        for (const item of items) {
            if (item.type === "playlist") {
                list.push({ name: item.name, uri: item.uri, addedAt: typeof item.addedAt === "number" ? item.addedAt : Date.parse(item.addedAt || item.added_at || "") || 0 });
            } else if (item.type === "folder" && item.items) {
                flatten(item.items);
            }
        }
    }
    flatten(rootlist.items);
    return list;
}
