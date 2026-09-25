#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import json
import threading
import time

import websockets
from rich.panel import Panel
from rich.text import Text
from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical
from textual.widgets import Input, Static

SHRUG = r"¯\_(ツ)_/¯"
SPIN = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
DEFAULT = {
    "active": "#ff8c42",
    "inactive": "#777777",
    "near": "#b3b3b3",
    "accent": "#ff8c42",
    "panel_bg": "#000000",
    "panel_border": "#ff8c42",
    "panel_text": "#ff8c42",
    "bar_bg": "#000000",
    "bar_text": "#ff8c42",
    "visualizer": "#ff8c42",
}

BARS = 48
RATE = 44100
CHUNK = 2048

def _spectrum(samples):
    import numpy as np
    x = np.asarray(samples, dtype=np.float32).reshape(-1)
    if x.size < CHUNK:
        return [0.0] * BARS
    x = x[: x.size - x.size % CHUNK]
    x = x[-CHUNK:]
    mag = np.abs(np.fft.rfft(x * np.hanning(CHUNK)))
    freqs = np.fft.rfftfreq(CHUNK, 1.0 / RATE)
    out = np.interp(np.geomspace(40, 16000, BARS), freqs, mag)
    peak = float(out.max()) or 1.0
    if peak < 1e-4:
        return [0.0] * BARS
    return [min(1.0, (v / peak) ** 0.55) for v in out]


def start_capture():
    def run():
        try:
            import soundcard as sc
        except ImportError:
            return
        try:
            spk = sc.default_speaker()
            mic = sc.get_microphone(spk.name, include_loopback=True)
        except Exception:
            try:
                mic = next(m for m in sc.all_microphones(include_loopback=True) if getattr(m, "isloopback", False))
            except Exception:
                return
        try:
            with mic.recorder(samplerate=RATE, channels=1, blocksize=CHUNK) as rec:
                while True:
                    data = rec.record(numframes=CHUNK)
                    nxt = _spectrum(data)
                    prev = S.spectrum or [0.0] * BARS
                    S.spectrum = [p * 0.45 + n * 0.55 for p, n in zip(prev, nxt)]
        except Exception:
            return
    threading.Thread(target=run, daemon=True).start()


def hx(value, fallback):
    v = str(value or "").strip()
    if v.startswith("#") and len(v) in (4, 5, 7, 9):
        return v[:7] if len(v) >= 7 else v
    return fallback


def fmt(ms):
    s = max(0, int(ms // 1000))
    return f"{s // 60:02d}:{s % 60:02d}"


class State:
    def __init__(self):
        self.title = ""
        self.artist = ""
        self.duration_ms = 0
        self.position_ms = 0.0
        self.is_playing = False
        self.last_update = time.time()
        self.connected = False
        self.lines = []
        self.synced = False
        self.instrumental = False
        self.error = ""
        self.loading = False
        self.spin = 0
        self.colors = dict(DEFAULT)
        self.clients = set()
        self.mode = "lyrics"
        self.playlists = []
        self.songs = []
        self.playlist_i = 0
        self.song_i = 0
        self.pane = "playlist"
        self.search_q = ""
        self.search_results = []
        self.search_i = 0
        self.search_focus = "input"
        self.progress_style = "classic-block"
        self.progress_chars = {"fg": "█", "bg": "░"}
        self.spectrum = [0.0] * BARS
        self.visualizer = False

    def pos(self):
        if not self.is_playing:
            return self.position_ms
        return self.position_ms + max(0.0, (time.time() - self.last_update) * 1000)

    def colors_of(self):
        c = self.colors
        return (
            hx(c["active"], DEFAULT["active"]),
            hx(c["inactive"], DEFAULT["inactive"]),
            hx(c["near"], DEFAULT["near"]),
            hx(c["accent"], DEFAULT["accent"]),
            hx(c["panel_text"], DEFAULT["panel_text"]),
        )


S = State()


def slice_rows(items, selected, height):
    if not items:
        return 0, []
    h = max(1, height)
    start = max(0, min(selected - h // 2, max(0, len(items) - h)))
    return start, items[start:start + h]


def paint_list(items, selected, height, width, border, text, inactive, label, highlight):
    inner_h = max(1, (height or 12) - 2)
    inner_w = max(1, (width or 40) - 4)
    start, view = slice_rows(items, selected, inner_h)
    t = Text()
    if not view:
        t.append(" ", style=inactive)
    else:
        for i, item in enumerate(view):
            idx = start + i
            line = (item or "")[:inner_w].ljust(inner_w)
            if highlight and idx == selected:
                t.append(line + "\n", style=f"bold #000000 on {text}")
            else:
                t.append(line + "\n", style="#dddddd")
    return Panel(t, title=f"[{text}]{label}[/]", border_style=border, padding=(0, 1))


class Header(Static):
    def render(self):
        c = S.colors
        t = Text()
        if not S.connected:
            t.append("waiting for SpoTUI", style=hx(c["inactive"], DEFAULT["inactive"]))
            return t
        t.append(S.title or "Nothing playing", style=f"bold {hx(c['accent'], DEFAULT['accent'])}")
        if S.artist:
            t.append(f" - {S.artist}", style=hx(c["panel_text"], DEFAULT["panel_text"]))
        icon = "▶" if S.is_playing else "⏸"
        t.append(f"\n{icon}  {fmt(S.pos())} / {fmt(S.duration_ms)}", style=hx(c["near"], DEFAULT["near"]))
        return t


class Lyrics(Static):
    DEFAULT_CSS = """
    Lyrics {
        width: 1fr;
        height: 1fr;
    }
    """

    def render(self):
        active, inactive, near, _, _ = S.colors_of()
        lines = S.lines
        size = self.app.size if self.app else self.size
        h = max(1, self.size.height or size.height or 12)
        w = max(1, self.size.width or size.width - 6)
        rows = []
        if S.loading:
            rows = [(SPIN[S.spin % len(SPIN)], f"bold {active}")]
        elif not lines:
            rows = [(SHRUG, f"bold {active}")]
        elif not S.synced or lines[0].get("startTime", -1) < 0:
            rows = [(line.get("text") or "", inactive) for line in lines[:h]]
        else:
            pos = S.pos()
            idx = -1
            for i, line in enumerate(lines):
                if (line.get("startTime") or 0) <= pos:
                    idx = i
                else:
                    break
            ctx = max(1, (h - 1) // 2)
            start = max(0, idx - ctx)
            end = min(len(lines), max(idx, 0) + ctx + 1)
            if idx < 0:
                start, end = 0, min(len(lines), h)
            for i in range(start, end):
                dist = abs(i - idx) if idx >= 0 else 99
                style = f"bold {active}" if dist == 0 else near if dist == 1 else inactive
                rows.append((lines[i].get("text") or "", style))
        t = Text()
        pad = max(0, (h - len(rows)) // 2)
        for _ in range(pad):
            t.append(" " * w + "\n")
        for i, (text, style) in enumerate(rows):
            t.append(text[:w].center(w), style=style)
            if i < len(rows) - 1 or pad + len(rows) < h:
                t.append("\n")
        rest = h - pad - len(rows)
        for i in range(max(0, rest)):
            t.append(" " * w)
            if i < rest - 1:
                t.append("\n")
        return t


class PlaylistCol(Static):
    def render(self):
        _, inactive, _, _, text = S.colors_of()
        border = hx(S.colors["panel_border"], DEFAULT["panel_border"])
        names = [p.get("name") or "" for p in S.playlists]
        return paint_list(names, S.playlist_i, self.size.height, self.size.width, border, text, inactive, "Playlists", S.pane == "playlist")


class SongCol(Static):
    def render(self):
        _, inactive, _, _, text = S.colors_of()
        border = hx(S.colors["panel_border"], DEFAULT["panel_border"])
        names = [((s.get("name") or "") + (" - " + s["artist"] if s.get("artist") else "")) for s in S.songs]
        return paint_list(names, S.song_i, self.size.height, self.size.width, border, text, inactive, "Songs", S.pane == "song")


class SearchList(Static):
    def render(self):
        _, inactive, _, accent, text = S.colors_of()
        border = hx(S.colors["panel_border"], DEFAULT["panel_border"])
        inner_h = max(1, (self.size.height or 12) - 4)
        inner_w = max(1, (self.size.width or 40) - 6)
        start, view = slice_rows(S.search_results, S.search_i, inner_h)
        body = Text()
        q = S.search_q or ""
        caret = "█" if S.search_focus == "input" else ""
        body.append("> ", style=text)
        shown = (q + caret) if q or caret else "type to search..."
        body.append(shown[: max(1, inner_w - 2)] + "\n\n", style=text if q or caret else inactive)
        if not view:
            body.append("No results" if q else "", style=inactive)
        else:
            for i, item in enumerate(view):
                idx = start + i
                kind = (item.get("type") or "").replace("Track", "TRACK").upper()[:10].ljust(10)
                name = (item.get("name") or "")[: max(1, inner_w - 12)]
                line = f"{kind} {name}".ljust(inner_w)
                if idx == S.search_i:
                    body.append(line + "\n", style=f"bold #000000 on {accent}")
                else:
                    row = Text()
                    row.append(kind + " ", style=text)
                    row.append(name.ljust(max(1, inner_w - 11)) + "\n", style="#dddddd")
                    body.append(row)
        return Panel(body, border_style=border, padding=(1, 1))


def render_progress(progress, width, chars):
    filled = min(width, max(0, round(width * progress)))
    empty = width - filled
    fg = chars.get("fg") or "█"
    bg = chars.get("bg") or "░"
    if len(fg) == 1:
        return fg * filled + (bg * empty if bg else "")
    out = ""
    for i in range(filled):
        out += fg[min(len(fg) - 1, int(i / max(1, filled) * len(fg)))]
    return out + (bg * empty if bg else "")


class Bar(Static):
    def render(self):
        c = S.colors
        fg = hx(c["active"], DEFAULT["active"])
        bg = hx(c["inactive"], DEFAULT["inactive"])
        w = max(10, (self.size.width or 40) - 4)
        dur = S.duration_ms or 1
        bar = render_progress(S.pos() / dur, w, S.progress_chars or {"fg": "█", "bg": "░"})
        filled = min(w, max(0, round(w * (S.pos() / dur))))
        t = Text(justify="center")
        t.append(bar[:filled], style=fg)
        t.append(bar[filled:], style=bg)
        return t


class SpotuiApp(App):
    CSS = """
    Screen { layout: vertical; }
    #wrap { width: 1fr; height: 1fr; padding: 1 2; }
    #header { width: 1fr; height: auto; text-align: left; content-align: left top; }
    #lyrics { width: 1fr; height: 1fr; content-align: center middle; text-align: center; }
    #playlist { width: 1fr; height: 1fr; layout: horizontal; }
    #plist { width: 1fr; height: 1fr; margin-right: 1; }
    #slist { width: 1fr; height: 1fr; }
    #search { width: 1fr; height: 1fr; }
    #bar { width: 1fr; height: 1; content-align: center middle; }
    Input { dock: bottom; width: 1fr; }
    """
    BINDINGS = [("escape", "leave", "back")]

    def __init__(self, host, port):
        super().__init__()
        self.host = host
        self.port = port
        self.search_timer = None

    def compose(self) -> ComposeResult:
        with Vertical(id="wrap"):
            yield Header(id="header", expand=True)
            yield Lyrics(id="lyrics", expand=True)
            with Horizontal(id="playlist"):
                yield PlaylistCol(id="plist", expand=True)
                yield SongCol(id="slist", expand=True)
            yield SearchList(id="search", expand=True)
            yield Bar(id="bar", expand=True)
        yield Input(placeholder="type help for a list of commands")

    def on_mount(self):
        self.theme_bg = ""
        self.query_one("#playlist").display = False
        self.query_one("#search").display = False
        self.run_worker(self.serve, exclusive=True)
        self.run_worker(self.spectrum_pump)
        self.set_interval(0.1, self.tick)

    def set_mode(self, mode):
        S.mode = mode
        self.query_one("#lyrics").display = mode == "lyrics"
        self.query_one("#playlist").display = mode == "playlist"
        self.query_one("#search").display = mode == "search"
        inp = self.query_one(Input)
        if mode == "lyrics":
            inp.placeholder = "type help for a list of commands"
            inp.focus()
        else:
            inp.blur()

    def action_leave(self):
        if S.mode != "lyrics":
            self.set_mode("lyrics")

    def paint_bg(self, bg):
        for node in (self.screen, self.query_one("#wrap"), self.query_one(Header), self.query_one(Lyrics), self.query_one("#playlist"), self.query_one("#plist"), self.query_one("#slist"), self.query_one("#search"), self.query_one(Bar), self.query_one(Input)):
            node.styles.background = bg

    def tick(self):
        bg = hx(S.colors["panel_bg"], DEFAULT["panel_bg"])
        border = hx(S.colors["panel_border"], DEFAULT["panel_border"])
        text = hx(S.colors["bar_text"], DEFAULT["bar_text"])
        self.paint_bg(bg)
        inp = self.query_one(Input)
        wrap = self.query_one("#wrap")
        inp.styles.border = ("solid", border)
        inp.styles.color = text
        wrap.styles.border = ("solid", border)
        if bg != self.theme_bg:
            self.theme_bg = bg
            self.refresh(repaint=True, layout=True)
        if S.loading:
            S.spin += 1
        self.query_one(Header).refresh()
        self.query_one(Lyrics).refresh()
        self.query_one(PlaylistCol).refresh()
        self.query_one(SongCol).refresh()
        self.query_one(SearchList).refresh()
        self.query_one(Bar).refresh()

    async def ws_send(self, obj):
        payload = json.dumps(obj)
        await asyncio.gather(*[ws.send(payload) for ws in list(S.clients)], return_exceptions=True)

    async def spectrum_pump(self):
        start_capture()
        while True:
            await asyncio.sleep(0.033)
            if S.clients and S.visualizer:
                await self.ws_send({"type": "spectrum", "bars": S.spectrum})

    def schedule_search(self):
        if self.search_timer is not None:
            self.search_timer.stop()
        self.search_timer = self.set_timer(0.35, self.flush_search)

    async def flush_search(self):
        self.search_timer = None
        if S.mode != "search":
            return
        await self.ws_send({"type": "command", "cmd": "search " + S.search_q})

    async def on_input_submitted(self, event: Input.Submitted):
        cmd = event.value.strip()
        event.input.value = ""
        if not cmd:
            return
        low = cmd.lower()
        if low in {"q", "quit", "exit"}:
            self.exit()
            return
        parts = cmd.split(None, 1)
        name = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""
        if name in {"playlist", "list"}:
            S.playlists = []
            S.songs = []
            S.playlist_i = 0
            S.song_i = 0
            S.pane = "playlist"
            self.set_mode("playlist")
            await self.ws_send({"type": "command", "cmd": cmd})
            return
        if name == "search":
            S.search_q = arg
            S.search_results = []
            S.search_i = 0
            S.search_focus = "input"
            self.set_mode("search")
            if arg:
                await self.ws_send({"type": "command", "cmd": cmd})
            return
        await self.ws_send({"type": "command", "cmd": cmd})

    async def on_key(self, event):
        if S.mode == "lyrics":
            return
        key = event.key
        if key == "escape":
            event.prevent_default()
            event.stop()
            self.set_mode("lyrics")
            return
        if S.mode == "playlist":
            if key in {"up", "down"}:
                event.prevent_default()
                event.stop()
                if S.pane == "playlist" and S.playlists:
                    S.playlist_i = (S.playlist_i + (-1 if key == "up" else 1)) % len(S.playlists)
                    S.song_i = 0
                    uri = S.playlists[S.playlist_i].get("uri")
                    if uri:
                        await self.ws_send({"type": "get_songs", "uri": uri})
                elif S.pane == "song" and S.songs:
                    S.song_i = (S.song_i + (-1 if key == "up" else 1)) % len(S.songs)
                return
            if key == "left":
                event.prevent_default()
                event.stop()
                S.pane = "playlist"
                return
            if key == "right":
                event.prevent_default()
                event.stop()
                S.pane = "song"
                return
            if key == "enter":
                event.prevent_default()
                event.stop()
                if S.pane == "playlist" and S.playlists:
                    await self.ws_send({"type": "play", "uri": S.playlists[S.playlist_i].get("uri")})
                    self.set_mode("lyrics")
                elif S.pane == "song" and S.songs and S.playlists:
                    await self.ws_send({
                        "type": "play",
                        "uri": S.songs[S.song_i].get("uri"),
                        "context": S.playlists[S.playlist_i].get("uri"),
                    })
                    self.set_mode("lyrics")
                return
        if S.mode == "search":
            if key in {"up", "down"}:
                event.prevent_default()
                event.stop()
                if S.search_focus == "input" and key == "down" and S.search_results:
                    S.search_focus = "results"
                    S.search_i = 0
                elif S.search_focus == "results" and S.search_results:
                    if key == "up" and S.search_i <= 0:
                        S.search_focus = "input"
                    else:
                        S.search_i = (S.search_i + (-1 if key == "up" else 1)) % len(S.search_results)
                return
            if key == "enter":
                event.prevent_default()
                event.stop()
                if S.search_focus == "input":
                    if self.search_timer is not None:
                        self.search_timer.stop()
                        self.search_timer = None
                    await self.ws_send({"type": "command", "cmd": "search " + S.search_q})
                elif S.search_results:
                    await self.ws_send({"type": "play", "uri": S.search_results[S.search_i].get("uri")})
                    self.set_mode("lyrics")
                return
            if S.search_focus == "input":
                if key == "backspace":
                    event.prevent_default()
                    event.stop()
                    S.search_q = S.search_q[:-1]
                    self.schedule_search()
                    return
                if len(key) == 1:
                    event.prevent_default()
                    event.stop()
                    S.search_q += key
                    self.schedule_search()
                    return

    async def handler(self, ws):
        S.clients.add(ws)
        S.connected = True
        try:
            async for message in ws:
                try:
                    data = json.loads(message)
                except json.JSONDecodeError:
                    continue
                kind = data.get("type")
                if kind == "playlists":
                    S.playlists = data.get("playlists") or []
                    S.playlist_i = min(S.playlist_i, max(0, len(S.playlists) - 1))
                    self.set_mode("playlist")
                    continue
                if kind == "songs":
                    S.songs = data.get("songs") or []
                    S.song_i = 0
                    continue
                if kind == "search":
                    S.search_q = data.get("query") or S.search_q
                    S.search_results = data.get("results") or []
                    S.search_i = 0
                    self.set_mode("search")
                    continue
                if kind != "update":
                    continue
                S.title = data.get("title", S.title)
                S.artist = data.get("artist", S.artist)
                S.duration_ms = data.get("duration_ms", S.duration_ms) or 0
                S.position_ms = data.get("position_ms", S.position_ms) or 0
                S.is_playing = bool(data.get("is_playing", S.is_playing))
                S.last_update = time.time()
                S.connected = True
                S.visualizer = bool(data.get("visualizer", S.visualizer))
                chars = data.get("progress_chars")
                if isinstance(chars, dict) and chars.get("fg"):
                    S.progress_chars = chars
                    S.progress_style = data.get("progress_style") or S.progress_style
                colors = data.get("colors") or {}
                for k in DEFAULT:
                    if colors.get(k):
                        S.colors[k] = colors[k]
                lyrics = data.get("lyrics") or {}
                S.lines = lyrics.get("lines") or []
                S.synced = bool(lyrics.get("synced"))
                S.instrumental = bool(lyrics.get("instrumental"))
                S.error = lyrics.get("error") or ""
                S.loading = bool(lyrics.get("loading"))
                if S.instrumental or S.error:
                    S.lines = []
                    S.loading = False
        finally:
            S.clients.discard(ws)
            if not S.clients:
                S.connected = False

    async def serve(self):
        async with websockets.serve(self.handler, self.host, self.port):
            await asyncio.Future()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--host", default="localhost")
    p.add_argument("--port", type=int, default=8765)
    args = p.parse_args()
    SpotuiApp(args.host, args.port).run()


if __name__ == "__main__":
    main()
