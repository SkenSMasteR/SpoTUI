(function () {
    'use strict';

    // Theme feed host for pulling community themes
    const THEME_HOST = "https://spotui.root.sx/";

    // LocalStorage keys for user preferences
    const ANIMATION_KEY = "spotui:ascii-animation";
    const LYRICS_STORAGE_KEY = "spotui:lyrics-open";
    const LYRICS_ANIMATION_KEY = "spotui:lyrics-animation";
    const WP_URL_KEY = "spotui:wp-url";
    const WP_OPACITY_KEY = "spotui:wp-opacity";
    const LYRICS_COLOR_ACTIVE = "spotui:lyrics-color-active";
    const LYRICS_COLOR_INACTIVE = "spotui:lyrics-color-inactive";
    const LYRICS_COLOR_LIGHT_INACTIVE = "spotui:lyrics-color-light-inactive";
    const PLAYER_BAR_BG = "spotui:player-bar-bg";
    const PLAYER_BAR_BORDER = "spotui:player-bar-border";
    const PLAYER_BAR_TEXT = "spotui:player-bar-text";
    const PLAYER_BAR_VISIBLE = "spotui:player-bar-visible";
    const CUSTOM_BAR_ENABLED = "spotui:custom-bar-enabled";
    const CUSTOM_BAR_PROGRESS_STYLE = "spotui:custom-bar-progress-style";
    const PROGRESS_BAR_BG = "spotui:progress-bar-bg";
    const PROGRESS_BAR_FG = "spotui:progress-bar-fg";
    const INPUT_BG = "spotui:input-bg";
    const INPUT_BG_HOVER = "spotui:input-bg-hover";
    const INPUT_TEXT = "spotui:input-text";
    const INPUT_BORDER = "spotui:input-border";
    const INPUT_BUTTONS = "spotui:inputs-buttons";
    const PANEL_BG = "spotui:panel-bg";
    const PANEL_BORDER = "spotui:panel-border";
    const PANEL_TEXT = "spotui:panel-text";
    const UPDATE_BANNER_KEY = "spotui:update-banner";

    // Jam configs
    const JAM_SERVER_URL = "https://relay-spotui.root.sx/";
    const JAM_STATE_KEY = "spotui:jam-state";
    const JAM_POLL_MS = 1000;
    const JAM_SEEK_DRIFT_MS = 400; // Tolerated position drift before forcing seek

    const KEYBIND_STORAGE_KEY = "spotui:keybinds";
    const ACTIONS_STORAGE_KEY = "spotui:actions";
    const DISCORD_INVITE_URL = "https://discord.gg/WTzBEKDeKg";
    const LAUNCHED_KEY = "spotui:launched";

    // Theme IDs shown in first-boot onboarding
    const FIRST_BOOT_THEME_IDS = new Set([
        "U3BvVFVJIC0gRGVmYXVsdA==",
        "UmFuZG9tIGFuaW1lIHRoZW1l",
        "SURL",
    ]);
    // Progress bar styles for custom player bar
    const PROGRESS_STYLES = {
        "classic-block": { fg: "█", bg: "░" },
        "dark-block": { fg: "▓", bg: "░" },
        "gradient": { fg: "█▓▒", bg: "░" }, // Multi-char gradient from filled to empty
        "thin": { fg: "━", bg: "░" },
        "line": { fg: "━", bg: "─" },
        "square": { fg: "■", bg: "□" },
        "circle": { fg: "●", bg: "○" },
        "diamond": { fg: "◆", bg: "◇" },
        "chevron": { fg: ">", bg: "░" },
        "triangle": { fg: "▶", bg: "▷" },
        "braille": { fg: "⣿", bg: "⣀" },
        "retro": { fg: "▰", bg: "▱" },
        "pixel": { fg: "█", bg: "▀" },
        "dashed": { fg: "━", bg: "╸" }
    };

    const SPOTUI_ASCII_ART = [
        "   ▄████████    ▄███████▄  ▄██████▄      ███     ███    █▄   ▄█  ",
        "  ███    ███   ███    ███ ███    ███ ▀█████████▄ ███    ███ ███  ",
        "  ███    █▀    ███    ███ ███    ███    ▀███▀▀██ ███    ███ ███▌ ",
        "  ███          ███    ███ ███    ███     ███   ▀ ███    ███ ███▌ ",
        "▀███████████ ▀█████████▀  ███    ███     ███     ███    ███ ███▌ ",
        "         ███   ███        ███    ███     ███     ███    ███ ███  ",
        "   ▄█    ███   ███        ███    ███     ███     ███    ███ ███  ",
        " ▄████████▀   ▄████▀       ▀██████▀     ▄████▀   ████████▀  █▀   ",
    ];

    const GLITCH_CHARS = "01";

    // Orange-to-yellow gradient palette for logo coloring
    const ORANGE_PALETTE_RGB = [
        [255, 106, 0],
        [255, 122, 10],
        [255, 140, 26],
        [255, 158, 51],
        [255, 176, 77],
        [255, 194, 102],
        [255, 212, 128],
        [255, 230, 153],
    ];

    // Validation and parsing patterns
    const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    const THEME_SKIP_CMD_REGEX = /^(?:tui\s+(?:bind|unbind|actions|restore)\b|jam\b)/i;
    const LRC_STAMP_REGEX = /\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]/g; // LRC timestamp [mm:ss.ms]
    const LRC_STAMP_STRIP_REGEX = /\[\d{1,2}:\d{2}(?:\.\d+)?\]/g;

    // Placeholder images for "Add Theme" card in theme browser
    const ADD_THEME_IMG_OK = `https://imgs.search.brave.com/2VYp5kTKXFu84NcOgmYXQM8zyBByOalm9xwmIOX4Lp8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZs/YXRpY29uLmNvbS8x/MjgvOTU5Ni85NTk2/MTU2LnBuZw`;
    const ADD_THEME_IMG_ERR = `https://imgs.search.brave.com/qsWzCiBrdeOE9PQmFvp0eS0rfLyVkcm97DyHxEXGNBk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLm1h/Z25pZmljLmNvbS8y/NTYvMTAwODQvMTAw/ODQzOTAucG5nP3Nl/bXQ9YWlzX3doaXRl/X2xhYmVs`;

    // Available commands shown in help panel
    // This renders as innerHTML
    const COMMAND_LIST = [
        { cmd: "tui -l &lt;on/off&gt;", desc: "Toggle ASCII logo visibility" },
        { cmd: "tui -l -a &lt;on/off&gt;", desc: "Toggle ASCII animation" },
        { cmd: "tui -wp &lt;url&gt; [-o &lt;opacity&gt;]", desc: "Set wallpaper (opacity 0-1)" },
        { cmd: "tui -wp off", desc: "Remove wallpaper" },
        { cmd: "tui -t pull &lt;theme_id&gt;", desc: "Apply a theme by its ID (you can find the id on our website)" },
        { cmd: 'tui bind "&lt;Letter&gt;" "&lt;command&gt;"', desc: "Bind Alt+&lt;Letter&gt; to run a TUI command" },
        { cmd: 'tui unbind "&lt;Letter&gt;"', desc: "Remove the Alt+&lt;Letter&gt; keybind" },
        { cmd: "tui bind clear", desc: "Remove all keybinds" },
        { cmd: "tui actions create &lt;name&gt;", desc: "Create a named action" },
        { cmd: "tui actions &lt;name&gt; &lt;listener&gt; &lt;command&gt;", desc: "Bind an action to a listener" },
        { cmd: "tui actions list", desc: "List saved actions" },
        { cmd: "tui actions enable &lt;name&gt;", desc: "Enable an action" },
        { cmd: "tui actions disable &lt;name&gt;", desc: "Disable an action" },
        { cmd: "tui actions delete &lt;name&gt;", desc: "Delete an action" },
        { cmd: "tui -ly -cp -active &lt;#hex&gt; -inactive &lt;#hex&gt; -near &lt;#hex&gt;", desc: "Set lyrics colors" },
        { cmd: "tui -ly -cp off", desc: "Reset lyrics colors" },
        { cmd: "tui -ly -animation &lt;on/off&gt;", desc: "Toggle lyrics loader animation" },
        { cmd: "tui -bar -bg &lt;#hex&gt; -border &lt;#hex&gt; -text &lt;#hex&gt;", desc: "Set player bar colors" },
        { cmd: "tui -bar -v &lt;on/off&gt;", desc: "Toggle play bar visibility" },
        { cmd: "tui -bar -c &lt;on/off&gt;", desc: "Toggle custom TUI play bar" },
        { cmd: "tui -bar -c -progress &lt;id&gt;", desc: "Set custom bar progress style" },
        { cmd: "tui -bar off", desc: "Reset player bar colors" },
        { cmd: "tui -progress -bg &lt;#hex&gt; -fg &lt;#hex&gt;", desc: "Set progress bar colors" },
        { cmd: "tui -progress off", desc: "Reset progress bar colors" },
        { cmd: "tui -inputs -bg &lt;#hex&gt; -bg-hover &lt;#hex&gt; -text &lt;#hex&gt; -border &lt;#hex&gt;", desc: "Set input colors" },
        { cmd: "tui -inputs -buttons &lt;on/off&gt;", desc: "Toggle bottom right buttons visibility" },
        { cmd: "tui -inputs off", desc: "Reset input colors" },
        { cmd: "tui -panel -bg &lt;#hex&gt; -border &lt;#hex&gt; -text &lt;#hex&gt;", desc: "Set help/playlist/theme/about panel colors" },
        { cmd: "tui -panel off", desc: "Reset panel colors" },
        { cmd: "playlist / list &lt;playlist-name&gt;", desc: "Open playlist viewer or play a specific playlist" },
        { cmd: "play / pause / p", desc: "Toggle playback" },
        { cmd: "skip", desc: "Next track" },
        { cmd: "back", desc: "Previous track" },
        { cmd: "s / seek <mm:ss>", desc: "Jump to a specific time" },
        { cmd: "v / volume <%>", desc: "Set volume" },
        { cmd: "shuffle", desc: "Toggle shuffle" },
        { cmd: "loop / superloop", desc: "Toggle repeat mode" },
        { cmd: "like", desc: "Like/unlike current song" },
        { cmd: "lyrics", desc: "Toggle lyrics panel" },
        { cmd: "dj", desc: "Play the DJ playlist" },
        { cmd: "search &lt;query&gt;", desc: "Search Spotify" },
        { cmd: "about", desc: "Show about panel" },
        { cmd: "theme", desc: "Browse and apply themes" },
        { cmd: "standby", desc: "Enter standby mode (any key to exit)" },
        { cmd: "discord", desc: "Show the Discord update banner and re-enable it on boot" },
        { cmd: "jam create", desc: "Start a listening jam and get a PIN" },
        { cmd: "jam join <pin>", desc: "Join a jam by PIN (volume/lyrics only)" },
        { cmd: "jam leave", desc: "Leave the current jam" },
        { cmd: "help", desc: "Show this panel" },
    ];

    const app = {
        asciiAnimationInitialized: false,
        asciiCharData: [],
        asciiEnabled: true,
        tuiMode: "command",
        standbyOpen: false,
        results: [],
        selected: 0,
        lyricsObserver: null,
        djObserver: null,
        djMode: false,
        djPanelOpen: false,
        djPrevPane: null,
        commandHistory: [],
        commandHistoryIndex: -1,
        playlistPanelOpen: false,
        playlists: [],
        playlistSongs: [],
        playlistSongsTotal: 0,
        playlistSongsFetchToken: 0,
        playlistSongsFetchTimer: null,
        selectedPlaylist: 0,
        selectedSong: 0,
        activePane: "playlist",
        helpPanelOpen: false,
        aboutPanelOpen: false,
        themePanelOpen: false,
        onboardingPanelOpen: false,
        onboardingStage: "commands",
        onboardingShowAllThemes: false,
        lyricsPanelOpen: false,
        lyricsLoadToken: 0,
        lyricsActiveIndex: -1,
        lyricsActiveLoaderIndex: -1,
        searchPanelOpen: false,
        searchResults: [],
        searchSelected: 0,
        searchFocus: "input",
        searchQuery: "",
        searchAutocomplete: "",
        searchFetchToken: 0,
        searchDebounce: null,
        searchBound: false,
        lyricsCache: { uri: "", lines: [], synced: false, provider: "", instrumental: false, error: "" },
        lyricsBound: false,
        lyricsSyncInterval: null,
        cachedLyricsRows: [],
        cachedLyricsLoaders: [],
        jamRole: null,
        jamPin: null,
        jamToken: null,
        jamIntervalId: null,
        jamBarPrevHidden: null,
        jamLastAppliedUri: null,
        themesFeedPromise: null,
        playlistListScrollRaf: null,
        songListScrollRaf: null,
        songScrollAnimRaf: null,
        navRafPending: false,
        playlistNavLastAt: 0,
        playlistNavFast: false
    };

    // Returns true if any panel except lyrics or standby is open
    function isAnyPanelOpen() {
        return app.standbyOpen || Object.keys(app).some(k => k.endsWith("PanelOpen") && k !== "lyricsPanelOpen" && app[k]);
    }

    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {}
    }

    function storageRemove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {}
    }

    function storageClear() {
        try {
            localStorage.clear();
        } catch (e) {}
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // randomizing animation sequences - fisher-yates
    function shuffleArray(array) {
        for (let index = array.length - 1; index > 0; index -= 1) {
            const j = Math.floor(Math.random() * (index + 1));
            [array[index], array[j]] = [array[j], array[index]];
        }
        return array;
    }
    function createButton(id, className, text, onClick) {
        const btn = document.createElement("button");
        btn.id = id;
        btn.className = className;
        btn.textContent = text;
        btn.addEventListener("click", onClick);
        return btn;
    }

    // Generate random character for glitch effects
    function randomGlitchChar() {
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }

    function randomGlitchColor(minLightness = 50, lightnessRange = 30) {
        return `hsl(${20 + Math.random() * 35}, 100%, ${minLightness + Math.random() * lightnessRange}%)`;
    }
    function getCharColor(row, col, totalRows, totalCols) {
        const normRow = row / Math.max(totalRows - 1, 1);
        const normCol = col / Math.max(totalCols - 1, 1);
        const mix = normRow * 0.55 + normCol * 0.45; // Weighted blend favoring vertical
        const len = ORANGE_PALETTE_RGB.length;
        const idx = Math.floor(mix * (len - 1));
        const frac = mix * (len - 1) - idx; // Fractional position for interpolation
        const i = Math.min(idx, len - 2);
        const [r1, g1, b1] = ORANGE_PALETTE_RGB[i];
        const [r2, g2, b2] = ORANGE_PALETTE_RGB[i + 1] || ORANGE_PALETTE_RGB[i];
        const r = Math.round(r1 + (r2 - r1) * frac);
        const g = Math.round(g1 + (g2 - g1) * frac);
        const b = Math.round(b1 + (b2 - b1) * frac);
        return `rgb(${r},${g},${b})`;
    }

    const asciiDraw = {
        canvas: null,
        ctx: null,
        cols: 0,
        rows: 0,
        pad: 20,
        fontSize: 0,
        cellW: 0,
        cellH: 0,
        dpr: 1,
        raf: 0,
    };

    function getAsciiFontSize() {
        const vw = window.innerWidth;
        if (vw <= 450) return Math.min(Math.max(3.5, vw * 0.014), 7);
        if (vw <= 700) return Math.min(Math.max(5, vw * 0.011), 11);
        return Math.min(Math.max(9, vw * 0.014), 22);
    }

    function asciiFont(size) {
        return `400 ${size}px "JetBrains Mono", "Fira Code", monospace`;
    }

    function layoutAsciiCanvas() {
        const { canvas, ctx, cols, rows, pad } = asciiDraw;
        if (!canvas || !ctx) return;
        const fontSize = getAsciiFontSize();
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.font = asciiFont(fontSize);
        ctx.fontKerning = "none";
        ctx.letterSpacing = "0px";
        const cellW = ctx.measureText("0").width;
        const cellH = fontSize;
        const cssW = pad * 2 + cols * cellW;
        const cssH = pad * 2 + rows * cellH;
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
        canvas.width = Math.max(1, Math.round(cssW * dpr));
        canvas.height = Math.max(1, Math.round(cssH * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        asciiDraw.fontSize = fontSize;
        asciiDraw.cellW = cellW;
        asciiDraw.cellH = cellH;
        asciiDraw.dpr = dpr;
    }

    function paintAsciiCanvas() {
        const { canvas, ctx, cols, rows, pad, fontSize, cellW, cellH } = asciiDraw;
        if (!canvas || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        if (dpr !== asciiDraw.dpr || fontSize !== getAsciiFontSize()) layoutAsciiCanvas();
        const cssW = pad * 2 + cols * cellW;
        const cssH = pad * 2 + rows * cellH;
        ctx.clearRect(0, 0, cssW, cssH);
        ctx.font = asciiFont(asciiDraw.fontSize);
        ctx.fontKerning = "none";
        ctx.letterSpacing = "0px";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fontVariantCaps = "normal";
        const chars = app.asciiCharData;
        for (let i = 0; i < chars.length; i += 1) {
            const { el, row, col } = chars[i];
            const ch = el.textContent;
            if (!ch || ch === " ") continue;
            const color = el.style.color;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillText(ch, pad + col * asciiDraw.cellW, pad + row * asciiDraw.cellH);
        }
    }

    function startAsciiPaintLoop() {
        if (asciiDraw.raf) return;
        const tick = () => {
            paintAsciiCanvas();
            asciiDraw.raf = requestAnimationFrame(tick);
        };
        asciiDraw.raf = requestAnimationFrame(tick);
    }

    // Reset ASCII logo animation to original state
    function resetGrid() {
        app.asciiCharData.forEach(({ el, original, color }) => {
            el.textContent = original;
            el.style.color = color;
        });
    }

    function initAsciiAnimation() {
        if (app.asciiAnimationInitialized) return;
        app.asciiAnimationInitialized = true;

        const logo = document.getElementById("spotui-logo");
        if (!logo) return;

        logo.innerHTML = "";

        const canvas = document.createElement("canvas");
        canvas.className = "spotui-ascii-canvas";
        canvas.setAttribute("aria-hidden", "true");
        logo.appendChild(canvas);
        asciiDraw.canvas = canvas;
        asciiDraw.ctx = canvas.getContext("2d");

        const rows = SPOTUI_ASCII_ART.length;
        const cols = Math.max(...SPOTUI_ASCII_ART.map((row) => row.length));
        asciiDraw.rows = rows;
        asciiDraw.cols = cols;
        const charData = [];
        const rowSpansCache = [];

        SPOTUI_ASCII_ART.forEach((line, rowIdx) => {
            const padded = line.padEnd(cols, " ");
            const chars = [...padded];
            const rowSpans = [];
            chars.forEach((ch, colIdx) => {
                const color = getCharColor(rowIdx, colIdx, rows, cols);
                const el = {
                    textContent: ch,
                    style: { color },
                    dataset: {
                        row: String(rowIdx),
                        col: String(colIdx),
                        original: ch,
                        origColor: color,
                    },
                };
                charData.push({
                    row: rowIdx,
                    col: colIdx,
                    el,
                    original: ch,
                    color,
                });
                rowSpans.push(el);
            });
            rowSpansCache.push(rowSpans);
        });

        app.asciiCharData = charData;
        layoutAsciiCanvas();
        startAsciiPaintLoop();
        window.addEventListener("resize", layoutAsciiCanvas);
        if (document.fonts?.ready) document.fonts.ready.then(layoutAsciiCanvas);

        function getRowSpans(rowIdx) {
            return rowSpansCache[rowIdx] || [];
        }

        // Decrypt animation
        async function decryptRow(rowIdx) {
            const spans = getRowSpans(rowIdx);
            if (!spans.length) return;
            const origs = spans.map((span) => span.dataset.original || " ");
            const colors = spans.map((span) => span.dataset.origColor || "#ff8c1a");

            spans.forEach((span) => {
                span.textContent = randomGlitchChar();
            });

            const indices = Array.from({ length: spans.length }, (_, i) => i);
            shuffleArray(indices);

            const batchSize = 4;
            for (let start = 0; start < indices.length; start += batchSize) {
                const batch = indices.slice(start, start + batchSize);
                batch.forEach((idx) => {
                    spans[idx].textContent = randomGlitchChar();
                });
                await sleep(8);
                batch.forEach((idx) => {
                    spans[idx].textContent = origs[idx];
                    spans[idx].style.color = colors[idx];
                });
                await sleep(6);
            }
        }

        // Glitch wave
        async function glitchRowWave(rowIdx, duration = 500) {
            const spans = getRowSpans(rowIdx);
            if (!spans.length) return;
            const origs = spans.map((span) => span.dataset.original || " ");
            const colors = spans.map((span) => span.dataset.origColor || "#ff8c1a");
            const steps = 8;
            for (let step = 0; step < steps; step += 1) {
                spans.forEach((span) => {
                    span.textContent = randomGlitchChar();
                    span.style.color = randomGlitchColor();
                });
                await sleep(Math.floor(duration / steps));
            }
            spans.forEach((span, i) => {
                span.textContent = origs[i] || " ";
                span.style.color = colors[i] || "#ff8c1a";
            });
        }

        // run glitch effect based on distance from center
        async function runGlitchByDist(duration, logic) {
            const centerRow = Math.floor(rows / 2);
            const centerCol = Math.floor(cols / 2);
            const withDist = charData.map((entry) => {
                const dr = entry.row - centerRow;
                const dc = entry.col - centerCol;
                return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
            });
            const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
            await logic(withDist, maxDist);
            resetGrid();
        }

        // Burst
        async function burstGlitch(duration = 800) {
            const steps = 8;
            await runGlitchByDist(duration, async (withDist, maxDist) => {
                for (let step = 0; step < steps; step += 1) {
                    const progress = step / steps;
                    withDist.forEach(({ el, original, color, dist }) => {
                        const norm = dist / maxDist;
                        const threshold = progress * 1.1;
                        if (norm < threshold + 0.12 && norm > threshold - 0.12) {
                            if (Math.random() < 0.75) {
                                el.textContent = randomGlitchChar();
                                el.style.color = randomGlitchColor();
                            }
                        } else if (norm < threshold - 0.12) {
                            el.textContent = original;
                            el.style.color = color;
                        }
                    });
                    await sleep(Math.floor(duration / steps));
                }
            });
        }

        // Pulse
        async function pulseGlitch(duration = 1200) {
            const waves = 3;
            const stepsPerWave = 10;
            await runGlitchByDist(duration, async (withDist, maxDist) => {
                for (let wave = 0; wave < waves; wave += 1) {
                    for (let step = 0; step < stepsPerWave; step += 1) {
                        const progress = step / stepsPerWave;
                        const threshold = progress * 1.0;
                        withDist.forEach(({ el, original, color, dist }) => {
                            const norm = dist / maxDist;
                            if (norm < threshold + 0.1 && norm > threshold - 0.1) {
                                if (Math.random() < 0.7) {
                                    el.textContent = randomGlitchChar();
                                    el.style.color = randomGlitchColor(55, 25);
                                }
                            } else if (norm < threshold - 0.1 && wave === waves - 1) {
                                el.textContent = original;
                                el.style.color = color;
                            }
                        });
                        await sleep(Math.floor(duration / (waves * stepsPerWave)));
                    }
                    await sleep(40);
                }
            });
        }

        // Implosion
        async function implosionGlitch(duration = 900) {
            const steps = 10;
            await runGlitchByDist(duration, async (withDist, maxDist) => {
                withDist.forEach(({ el }) => {
                    el.textContent = randomGlitchChar();
                    el.style.color = randomGlitchColor(45, 35);
                });
                for (let step = 0; step < steps; step += 1) {
                    const progress = step / steps;
                    const threshold = 1.0 - progress * 1.1;
                    withDist.forEach(({ el, original, color, dist }) => {
                        const norm = dist / maxDist;
                        if (norm <= threshold) {
                            el.textContent = original;
                            el.style.color = color;
                        }
                    });
                    await sleep(Math.floor(duration / steps));
                }
            });
        }

        // Spiral
        async function spiralGlitch(duration = 1000) {
            const centerRow = Math.floor(rows / 2);
            const centerCol = Math.floor(cols / 2);
            const withAngle = charData.map((entry) => {
                const dr = entry.row - centerRow;
                const dc = entry.col - centerCol;
                const angle = Math.atan2(dc, dr);
                const dist = Math.sqrt(dr * dr + dc * dc);
                return { ...entry, angle, dist };
            });
            const steps = 36;
            const wedgeWidth = 0.5;

            for (let step = 0; step < steps; step += 1) {
                const sweepAngle = (step / steps) * Math.PI * 2 - Math.PI;
                withAngle.forEach(({ el, original, color, angle, dist }) => {
                    let diff = Math.abs(angle - sweepAngle);
                    if (diff > Math.PI) diff = Math.PI * 2 - diff;
                    if (diff < wedgeWidth && dist > 0.1) {
                        el.textContent = randomGlitchChar();
                        el.style.color = randomGlitchColor(55, 25);
                    } else {
                        el.textContent = original;
                        el.style.color = color;
                    }
                });
                await sleep(Math.floor(duration / steps));
            }
            resetGrid();
        }

        // Fuzz wave
        async function fuzzWaveGlitch(duration = 1000) {
            const steps = 20;
            const bandWidth = 0.25;
            await runGlitchByDist(duration, async (withDist, maxDist) => {
                for (let step = 0; step < steps; step += 1) {
                    const progress = step / steps;
                    const targetNorm = progress * 1.0;
                    withDist.forEach(({ el, original, color, dist }) => {
                        const norm = dist / maxDist;
                        const distanceFromTarget = Math.abs(norm - targetNorm);
                        if (distanceFromTarget < bandWidth && Math.random() < 0.65) {
                            el.textContent = randomGlitchChar();
                            el.style.color = randomGlitchColor();
                        } else if (distanceFromTarget > bandWidth * 1.5) {
                            el.textContent = original;
                            el.style.color = color;
                        }
                    });
                    await sleep(Math.floor(duration / steps));
                }
            });
        }

        // Static
        async function staticGlitch(duration = 600) {
            const steps = 6;
            for (let step = 0; step < steps; step += 1) {
                charData.forEach(({ el }) => {
                    if (Math.random() < 0.8) {
                        el.textContent = randomGlitchChar();
                        el.style.color = randomGlitchColor();
                    }
                });
                await sleep(Math.floor(duration / steps));
            }
            resetGrid();
        }

        // Horizontal band
        // 1 = downward, -1 = upward
        async function horizontalBand(direction = 1, duration = 800) {
            const start = direction === 1 ? 0 : rows - 1;
            const totalSteps = rows + 2;
            for (let step = 0; step <= totalSteps; step += 1) {
                resetGrid();
                const bandCenter = start + direction * step;
                const bandTop = Math.max(0, bandCenter - 1);
                const bandBottom = Math.min(rows - 1, bandCenter + 1);
                for (let row = bandTop; row <= bandBottom; row += 1) {
                    const spans = getRowSpans(row);
                    spans.forEach((span) => {
                        span.textContent = randomGlitchChar();
                        span.style.color = randomGlitchColor();
                    });
                }
                await sleep(Math.floor(duration / totalSteps));
            }
            resetGrid();
        }

        // Vertical slice
        // 1 = rightward, -1 = leftward
        async function verticalSlice(direction = 1, duration = 800) {
            const start = direction === 1 ? 0 : cols - 1;
            const totalSteps = cols + 2;
            for (let step = 0; step <= totalSteps; step += 1) {
                resetGrid();
                const bandCenter = start + direction * step;
                const bandLeft = Math.max(0, bandCenter - 1);
                const bandRight = Math.min(cols - 1, bandCenter + 1);
                charData.forEach(({ el, col }) => {
                    if (col >= bandLeft && col <= bandRight) {
                        el.textContent = randomGlitchChar();
                        el.style.color = randomGlitchColor();
                    }
                });
                await sleep(Math.floor(duration / totalSteps));
            }
            resetGrid();
        }

        // Stage functions
        async function stageWaveDown() {
            for (let row = 0; row < rows; row += 1) {
                await glitchRowWave(row, 300);
                await sleep(20);
            }
        }

        async function stageWaveUp() {
            for (let row = rows - 1; row >= 0; row -= 1) {
                await glitchRowWave(row, 260);
                await sleep(15);
            }
        }

        async function stageDecrypt() {
            charData.forEach(({ el }) => {
                el.textContent = randomGlitchChar();
            });
            for (let row = 0; row < rows; row += 1) {
                await decryptRow(row);
            }
        }

        async function stageBurst() { await burstGlitch(900); }
        async function stagePulse() { await pulseGlitch(1200); }
        async function stageImplosion() { await implosionGlitch(900); }
        async function stageSpiral() { await spiralGlitch(1000); }
        async function stageFuzzWave() { await fuzzWaveGlitch(1000); }
        async function stageStatic() { await staticGlitch(700); }
        async function stageHSlashDown() { await horizontalBand(1, 800); }
        async function stageHSlashUp() { await horizontalBand(-1, 800); }
        async function stageVSlashRight() { await verticalSlice(1, 800); }
        async function stageVSlashLeft() { await verticalSlice(-1, 800); }

        const stageFunctions = [
            stageWaveDown,
            stageWaveUp,
            stageDecrypt,
            stageBurst,
            stagePulse,
            stageImplosion,
            stageSpiral,
            stageFuzzWave,
            stageStatic,
            stageHSlashDown,
            stageHSlashUp,
            stageVSlashRight,
            stageVSlashLeft,
        ];

        async function runLoop() {
            while (true) {
                if (!app.asciiEnabled || storageGet(ANIMATION_KEY) === "off") {
                    await sleep(500);
                    continue;
                }
                const shuffled = shuffleArray([...stageFunctions]);
                for (const stageFn of shuffled) {
                    if (!app.asciiEnabled || storageGet(ANIMATION_KEY) === "off") break;
                    await stageFn();
                    await sleep(700 + Math.random() * 400);
                }
                resetGrid();
                await sleep(300);
            }
        }

        runLoop().catch(console.error);
    }

    // Display restart notification popup
    // persistSession - to survive the reload after all settings get reset
    function showRestartPopup(message = "Wait 5 seconds and relaunch Spotify", persistSession = false) {
        const existing = document.getElementById("spotui-restart-popup");
        if (existing) existing.remove();

        const popup = document.createElement("div");
        popup.id = "spotui-restart-popup";
        popup.textContent = message;
        popup.style.position = "fixed";
        popup.style.left = "50%";
        popup.style.bottom = "120px";
        popup.style.transform = "translateX(-50%)";
        popup.style.zIndex = "10000";
        popup.style.background = "rgba(0,0,0,0.92)";
        popup.style.border = "1px solid #ff8c42";
        popup.style.borderRadius = "6px";
        popup.style.padding = "12px 16px";
        popup.style.color = "#ff8c42";
        popup.style.fontFamily = "\"JetBrains Mono\", monospace";
        popup.style.fontSize = "14px";
        popup.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
        document.body.appendChild(popup);
        if (persistSession) {
            try { sessionStorage.setItem("spotui:restart-popup", message); } catch (e) {}
        }
    }
    // Initialize Discord community update banner
    // Shows unless user has dismissed with "never show again"
    function initUpdateBanner() {
        if (document.getElementById("spotui-update-banner")) return;
        if (storageGet(UPDATE_BANNER_KEY) === "never") return;

        const banner = document.createElement("div");
        banner.id = "spotui-update-banner";
        banner.innerHTML = `
        <div class="spotui-banner-secondary-actions">
            <button id="banner-dismiss-btn" class="spotui-banner-link-btn" title="Dismiss">Dismiss</button>
            <button id="banner-never-btn" class="spotui-banner-link-btn" title="Never show again">Never show</button>
        </div>
        <div class="spotui-banner-header">
            <img class="spotui-banner-icon" src="https://raw.githubusercontent.com/SkenSMasteR/SpoTUI/refs/heads/master/assets/logo.png" alt="SpoTUI Logo">
            <div>
                <h3>Updates & Community</h3>
            </div>
        </div>
        <p>Did you know that SpoTUI gets new updates almost every day?</p>
        <p>Join the SpoTUI Discord server to get breakdowns of every new feature, and notifications when new updates arrive.</p>
        <div class="spotui-update-actions">
            <button id="banner-join-btn" class="spotui-control-btn">Join Discord</button>
        </div>
    `;
        document.body.appendChild(banner);

        document.getElementById("banner-join-btn").onclick = () => {
            window.open(DISCORD_INVITE_URL, "_blank");
        };

        document.getElementById("banner-dismiss-btn").onclick = () => {
            banner.remove();
        };

        document.getElementById("banner-never-btn").onclick = () => {
            storageSet(UPDATE_BANNER_KEY, "never");
            banner.remove();
        };
    }

    // Get current theme accent color from CSS variables
    function getSpotuiAccentColor() {
        try {
            const accent = getComputedStyle(document.documentElement).getPropertyValue("--spotui-accent").trim();
            return accent || "#ff8c42";
        } catch (e) {
            return "#ff8c42";
        }
    }

    // Show temporary toast notification for jam-related messages
    function jamSay(text) {
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
    function showJamTags(pin, role) {
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
    function hideJamTags() {
        const el = document.getElementById("spotui-jam-tags");
        if (el) el.remove();
    }

    // Save current jam state to localStorage for session persistence
    function jamStorageSave() {
        if (!app.jamRole) { storageRemove(JAM_STATE_KEY); return; }
        storageSet(JAM_STATE_KEY, JSON.stringify({
            role: app.jamRole, pin: app.jamPin, token: app.jamToken, barPrevHidden: app.jamBarPrevHidden,
        }));
    }

    // Make fetch request to jam server
    async function jamFetch(path, opts) {
        const res = await fetch(JAM_SERVER_URL + path, opts);
        return res.json().catch(() => ({}));
    }

    // Stop jam polling interval
    function jamStopPolling() {
        if (app.jamIntervalId) { clearInterval(app.jamIntervalId); app.jamIntervalId = null; }
    }

    // Hide player bar when joining jam as guest
    function jamForceHideBar() {
        app.jamBarPrevHidden = document.body.classList.contains("spotui-bar-off");
        document.body.classList.add("spotui-bar-off");
    }

    function jamRestoreBar() {
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
    function jamHostTick() {
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
    async function jamCreate() {
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
    async function jamGuestTick() {
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
    async function jamJoin(pin) {
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
    async function jamLeave() {
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
    function getAllowedJamGuestCommands() {
        if (app.jamRole !== "guest") return null;
        return new Set(["v", "volume", "lyrics", "jam"]);
    }

    // Resume jam session from localStorage after page reload
    function resumeJamFromStorage() {
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

    // Retrieve stored keyboard shortcuts
    function getKeybinds() {
        try {
            const raw = storageGet(KEYBIND_STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
            const clean = {};
            Object.keys(parsed).forEach((key) => {
                if (typeof parsed[key] === "string") clean[key] = parsed[key];
            });
            return clean;
        } catch (e) {
            return {};
        }
    }

    function saveKeybinds(map) {
        storageSet(KEYBIND_STORAGE_KEY, JSON.stringify(map));
    }

    // Remove leading slash or dot from command strings
    function stripCommandPrefix(cmd) {
        const raw = String(cmd || "").trim();
        return raw.startsWith("/") || raw.startsWith(".") ? raw.slice(1).trim() : raw;
    }

    function isRestrictedThemeCommand(cmd) {
        const cleaned = stripCommandPrefix(cmd).toLowerCase();
        const [command, sub] = cleaned.split(/\s+/);
        if (command === "jam") return true;
        if (command === "tui" && (sub === "bind" || sub === "unbind" || sub === "actions" || sub === "restore")) return true;
        return THEME_SKIP_CMD_REGEX.test(cleaned);
    }

    function eventToKeyCombo(e) {
        const mods = [];
        if (e.ctrlKey) mods.push("Ctrl");
        if (e.altKey) mods.push("Alt");
        if (e.shiftKey) mods.push("Shift");
        if (e.metaKey) mods.push("Meta");
        let keyName = e.key;
        if (keyName.length === 1) keyName = keyName.toUpperCase();
        return [...mods, keyName].join("+");
    }

    // Global keydown handler for custom keybinds
    function handleKeybindKeydown(e) {
        if (app.standbyOpen) return;
        const binds = getKeybinds();
        if (!Object.keys(binds).length) return;

        // Ignore AltGr
        const isAltGr = e.ctrlKey && e.altKey;
        if (isAltGr) return;

        const combo = eventToKeyCombo(e);
        const cmd = binds[combo];
        if (!cmd) return;

        const activeEl = document.activeElement;
        const isTypingField = activeEl && (
            activeEl.id === "spotui-input" ||
            activeEl.id === "spotui-theme-search" ||
            activeEl.tagName === "TEXTAREA" ||
            (activeEl.tagName === "INPUT" && activeEl.type !== "button")
        );
        const hasModifier = e.ctrlKey || e.altKey || e.metaKey;
        if (isTypingField && !hasModifier) return;

        e.preventDefault();
        e.stopPropagation();
        execute(cmd);
    }

    const SEARCH_DEBOUNCE_MS = 250;

    function resolveName(data) {
        const candidates = [
            data.profile?.name,
            data.name,
            data.title,
            data.text,
            data.displayName,
            data.identity?.name,
            data.owner?.name,
        ];
        return candidates.find((value) => typeof value === "string" && value.trim()) || "";
    }

    function toResult(entry) {
        const data = entry?.item?.data ?? entry?.data ?? entry;
        if (!data || !data.uri) return null;
        const name = resolveName(data);
        if (!name) return null;
        return {
            type: data.__typename ?? entry?.item?.__typename ?? "",
            name,
            uri: data.uri,
            raw: data,
        };
    }

    function isAutocompleteEntry(entry, data) {
        const types = [entry?.item?.__typename, data?.__typename, entry?.__typename];
        return types.some((type) => typeof type === "string" && /autocomplete/i.test(type));
    }

    function extractResults(searchV2) {
        const results = [];
        const seen = new Set();
        let autocomplete = "";
        Object.values(searchV2 || {}).forEach((section) => {
            const list = section?.itemsV2 || section?.items;
            if (!Array.isArray(list)) return;
            list.forEach((entry) => {
                const data = entry?.item?.data ?? entry?.data ?? entry;
                const name = resolveName(data);
                if (isAutocompleteEntry(entry, data)) {
                    if (!autocomplete && name) autocomplete = name;
                    return;
                }
                const item = toResult(entry);
                if (!item || seen.has(item.uri)) return;
                seen.add(item.uri);
                results.push(item);
            });
        });
        return { results, autocomplete };
    }

    async function searchSpotify(query, limit = 20) {
        const definitions = Spicetify.GraphQL?.Definitions ?? {};
        const attempts = [];
        if (definitions.searchSuggestions) {
            attempts.push([
                definitions.searchSuggestions,
                {
                    query: query,
                    offset: 0,
                    limit: limit,
                    numberOfTopResults: limit,
                    includeAuthors: true,
                    includeAlbumPreReleases: true,
                    includeEpisodeContentRatingsV2: true,
                },
            ]);
        }
        if (definitions.searchModalResults) {
            attempts.push([
                definitions.searchModalResults,
                {
                    searchTerm: query,
                    offset: 0,
                    limit: limit,
                    numberOfTopResults: limit,
                    includeAudiobooks: true,
                    includeAuthors: true,
                    includePreRelease: true,
                    includeArtistHasConcertsField: false,
                },
            ]);
        }
        for (const [definition, variables] of attempts) {
            try {
                const res = await Spicetify.GraphQL.Request(definition, variables);
                const parsed = extractResults(res?.data?.searchV2);
                if (parsed.results.length || parsed.autocomplete) return parsed;
            } catch (err) {}
        }
        return { results: [], autocomplete: "" };
    }

    function updateSearchBarFocus() {
        const bar = document.getElementById("spotui-search-bar");
        if (bar) bar.classList.toggle("focused", app.searchFocus === "input");
    }

    function scrollSearchSelectedIntoView() {
        const selected = document.querySelector("#spotui-search-results .spotui-search-item.selected");
        if (selected) selected.scrollIntoView({ block: "nearest" });
    }

    function renderSearchResults() {
        const container = document.getElementById("spotui-search-results");
        if (!container) return;
        container.innerHTML = "";
        if (!app.searchResults.length) {
            const empty = document.createElement("div");
            empty.className = "spotui-search-empty";
            empty.textContent = app.searchQuery ? "No results" : "";
            container.appendChild(empty);
            return;
        }
        app.searchResults.forEach((item, idx) => {
            const row = document.createElement("div");
            row.className = "spotui-search-item" + (app.searchFocus === "results" && idx === app.searchSelected ? " selected" : "");
            const type = document.createElement("span");
            type.className = "spotui-search-type";
            type.textContent = item.type || "";
            const name = document.createElement("span");
            name.className = "spotui-search-name";
            name.textContent = item.name || "";
            row.appendChild(type);
            row.appendChild(name);
            row.addEventListener("click", () => playSearchResult(idx));
            container.appendChild(row);
        });
    }

    function renderSearchAutocomplete() {
        const input = document.getElementById("spotui-search-input");
        const ghost = document.getElementById("spotui-search-ghost");
        if (!input || !ghost) return;
        const value = input.value;
        const completion = app.searchAutocomplete || "";
        const matches = completion.length > value.length && completion.toLowerCase().startsWith(value.toLowerCase());
        if (!matches) {
            ghost.hidden = true;
            ghost.textContent = "";
            return;
        }
        ghost.hidden = false;
        ghost.style.left = `${input.offsetLeft}px`;
        ghost.style.top = `${input.offsetTop}px`;
        ghost.style.width = `${input.offsetWidth}px`;
        ghost.style.height = `${input.offsetHeight}px`;
        ghost.innerHTML = "";
        const typed = document.createElement("span");
        typed.style.visibility = "hidden";
        typed.textContent = value;
        const rest = document.createElement("span");
        rest.textContent = completion.slice(value.length);
        ghost.appendChild(typed);
        ghost.appendChild(rest);
    }

    async function runSearch(query) {
        const token = ++app.searchFetchToken;
        const term = query.trim();
        app.searchQuery = term;
        if (!term) {
            app.searchResults = [];
            app.searchSelected = 0;
            app.searchAutocomplete = "";
            renderSearchResults();
            renderSearchAutocomplete();
            return;
        }
        try {
            const { results, autocomplete } = await searchSpotify(term);
            if (token !== app.searchFetchToken) return;
            app.searchResults = results;
            app.searchAutocomplete = autocomplete;
        } catch (err) {
            if (token !== app.searchFetchToken) return;
            app.searchResults = [];
            app.searchAutocomplete = "";
        }
        if (app.searchSelected >= app.searchResults.length) {
            app.searchSelected = Math.max(0, app.searchResults.length - 1);
        }
        renderSearchResults();
        renderSearchAutocomplete();
        scrollSearchSelectedIntoView();
    }

    function scheduleSearch(query) {
        if (app.searchDebounce) clearTimeout(app.searchDebounce);
        app.searchDebounce = setTimeout(() => {
            app.searchDebounce = null;
            runSearch(query);
        }, SEARCH_DEBOUNCE_MS);
    }

    function setSearchFocus(mode) {
        app.searchFocus = mode;
        const input = document.getElementById("spotui-search-input");
        if (mode === "input" && input) input.focus();
        if (mode === "results" && input) input.blur();
        updateSearchBarFocus();
    }

    function playSearchResult(idx) {
        const item = app.searchResults[idx];
        if (!item || !item.uri) return;
        Spicetify.Player.playUri(item.uri);
        closeSearchPanel();
    }

    function initSearchPanel() {
        if (app.searchBound) return;
        const input = document.getElementById("spotui-search-input");
        const bar = document.getElementById("spotui-search-bar");
        if (!input || !bar) return;
        app.searchBound = true;
        if (!document.getElementById("spotui-search-ghost")) {
            const ghost = document.createElement("div");
            ghost.id = "spotui-search-ghost";
            ghost.hidden = true;
            bar.appendChild(ghost);
        }
        bar.addEventListener("click", () => {
            if (app.searchPanelOpen) setSearchFocus("input");
        });
        input.addEventListener("input", (e) => {
            app.searchSelected = 0;
            app.searchAutocomplete = "";
            renderSearchAutocomplete();
            scheduleSearch(e.target.value);
        });
        input.addEventListener("scroll", () => {
            if (app.searchAutocomplete) renderSearchAutocomplete();
        });
    }

    function handleSearchPanelKeydown(e) {
        if (!app.searchPanelOpen) return;
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopImmediatePropagation();
            closeSearchPanel();
            return;
        }
        if (e.key === "Tab") {
            const input = document.getElementById("spotui-search-input");
            const completion = app.searchAutocomplete || "";
            const value = input ? input.value : "";
            const canComplete = input && completion.length > value.length && completion.toLowerCase().startsWith(value.toLowerCase());
            if (!canComplete) return;
            e.preventDefault();
            input.value = completion;
            input.setSelectionRange(completion.length, completion.length);
            app.searchAutocomplete = "";
            renderSearchAutocomplete();
            runSearch(completion);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!app.searchResults.length) return;
            if (app.searchFocus === "input") {
                setSearchFocus("results");
                app.searchSelected = 0;
            } else {
                app.searchSelected = Math.min(app.searchSelected + 1, app.searchResults.length - 1);
            }
            renderSearchResults();
            scrollSearchSelectedIntoView();
            return;
        }
        if (e.key === "ArrowUp") {
            if (app.searchFocus !== "results") return;
            e.preventDefault();
            if (app.searchSelected <= 0) {
                setSearchFocus("input");
            } else {
                app.searchSelected -= 1;
            }
            renderSearchResults();
            scrollSearchSelectedIntoView();
            return;
        }
        if (e.key === "Enter" && app.searchFocus === "results") {
            e.preventDefault();
            playSearchResult(app.searchSelected);
        }
    }

    function closeSearchPanel() {
        const wasOpen = app.searchPanelOpen;
        app.searchPanelOpen = false;
        app.searchAutocomplete = "";
        const ghost = document.getElementById("spotui-search-ghost");
        if (ghost) {
            ghost.hidden = true;
            ghost.textContent = "";
        }
        document.body.classList.remove("spotui-search-panel");
        const panel = document.getElementById("spotui-search-panel");
        if (panel) panel.hidden = true;
        document.removeEventListener("keydown", handleSearchPanelKeydown, true);
        if (app.searchDebounce) {
            clearTimeout(app.searchDebounce);
            app.searchDebounce = null;
        }
        const input = document.getElementById("spotui-input");
        if (input) input.focus();
        if (wasOpen) emitPaneClose("search");
    }

    function openSearchPanel(query = "") {
        app.searchPanelOpen = true;
        app.searchResults = [];
        app.searchSelected = 0;
        app.searchAutocomplete = "";
        app.searchFetchToken += 1;
        document.body.classList.add("spotui-search-panel");
        const panel = document.getElementById("spotui-search-panel");
        if (panel) panel.hidden = false;
        const input = document.getElementById("spotui-search-input");
        if (input) {
            input.value = query;
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
        setSearchFocus("input");
        document.addEventListener("keydown", handleSearchPanelKeydown, true);
        runSearch(query);
    }

    function setTuiMode(mode) {
        app.tuiMode = "command";
        document.body.classList.toggle("spotui-cli-mode", app.tuiMode === "cli");
        document.body.classList.toggle("spotui-command-mode", app.tuiMode !== "cli");
    }
    // Create main terminal interface
    function createTerminal() {
        const box = document.createElement("div");
        box.id = "spotui-tui";
        setTuiMode();
        box.innerHTML = `
<div id="spotui-logo"></div>
<div id="spotui-top-fade"></div>
<div id="spotui-lyrics" hidden>
<div class="spotui-lyrics-viewport">
<div class="spotui-lyrics-lines"></div>
<div class="spotui-lyrics-fade spotui-lyrics-fade-bottom"></div>
</div>
</div>
<div id="spotui-dj" hidden>
<svg class="spotui-dj-logo" viewBox="-2 -2 20 20" overflow="visible" aria-hidden="true"><path d="M7.813 14.497A6.5 6.5 0 0 1 1.5 8.016c.008-3.553 2.71-5.744 5.043-6.078.85-.121 1.288.037 1.564.246.312.238.553.639.822 1.276q.115.277.239.602c.451 1.167 1.05 2.717 2.505 3.81 1.01.76 1.46 1.529 1.592 2.209.13.679-.037 1.375-.468 2.03-.88 1.34-2.793 2.388-4.844 2.388zm-.037 1.5A8 8 0 1 0 0 8.032c0 4.34 3.464 7.87 7.776 7.965m6.666-7.124c-.358-.788-.979-1.532-1.868-2.2-1.082-.813-1.51-1.9-1.967-3.06a31 31 0 0 0-.296-.736 6.3 6.3 0 0 0-.605-1.151 6.53 6.53 0 0 1 4.39 4.01 6.5 6.5 0 0 1 .346 3.137"/></svg>
</div>
<div id="spotui-playlist-panel" hidden>
    <fieldset id="spotui-playlist-list">
        <legend>Playlists</legend>
    </fieldset>
    <fieldset id="spotui-song-list">
        <legend>Songs</legend>
    </fieldset>
</div>
<div id="spotui-help-panel" hidden><fieldset class="spotui-help-fieldset"><legend class="spotui-help-legend">Exit - Esc</legend><div class="spotui-help-content"></div></fieldset></div>
<div id="spotui-about-panel" hidden></div>
<div id="spotui-search-panel" hidden>
    <div id="spotui-search-bar">
        <span class="spotui-search-prompt">></span>
        <input id="spotui-search-input" autocomplete="off" spellcheck="false" placeholder="type to search...">
    </div>
    <div id="spotui-search-results"></div>
</div>
<div id="spotui-theme-panel" hidden></div>
<div id="spotui-onboarding-panel" hidden></div>
<div id="spotui-footer">
<span class="prompt">></span>
<input id="spotui-input" autofocus placeholder="type help for a list of commands">
</div>
`;
        document.body.appendChild(box);
        initAsciiAnimation();
        initSearchPanel();

        const input = document.getElementById("spotui-input");

        // Focus the command input when user starts typing
        document.addEventListener("keydown", (e) => {
            if (document.activeElement === input) return;
            if (isAnyPanelOpen()) return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            if (e.key.length !== 1) return;
            input.focus();
        });

        input.addEventListener("keydown", async (e) => {
            if (isAnyPanelOpen()) {
                e.stopImmediatePropagation();
                return;
            }
            if (e.key === "Enter") {
                const cmd = input.value.trim();
                if (cmd) {
                    app.commandHistory = [cmd, ...app.commandHistory.filter((entry) => entry !== cmd)].slice(0, 50);
                }
                app.commandHistoryIndex = -1;
                input.value = "";
                await execute(cmd);
                return;
            }
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                if (!app.commandHistory.length) return;
                e.preventDefault();
                if (e.key === "ArrowUp") {
                    if (app.commandHistoryIndex < app.commandHistory.length - 1) app.commandHistoryIndex += 1;
                } else if (app.commandHistoryIndex >= 0) {
                    app.commandHistoryIndex -= 1;
                }
                input.value = app.commandHistoryIndex >= 0 ? app.commandHistory[app.commandHistoryIndex] || "" : "";
                return;
            }
            if (e.key === "ArrowDown" && app.results.length) {
                app.selected = Math.min(app.selected + 1, app.results.length - 1);
                renderResults();
            }
            if (e.key === "ArrowUp" && app.results.length) {
                app.selected = Math.max(app.selected - 1, 0);
                renderResults();
            }
        });
    }

    // Placeholder print function (output is handled differently now)
    function print(text) {}

    function renderResults() {
        const output = document.getElementById("spotui-output");
        output.textContent = "";
        app.results.forEach((item, idx) => {
            const line = document.createElement("div");
            line.className = "result" + (idx === app.selected ? " selected" : "");
            line.textContent = `${idx + 1}. ${item.name}${item.artist ? " - " + item.artist : ""}`;
            output.appendChild(line);
        });
    }

    const PLAYLIST_SONGS_FETCH_DELAY = 150;

    function scheduleSongsFetchForSelectedPlaylist() {
        if (app.playlistSongsFetchTimer) clearTimeout(app.playlistSongsFetchTimer);
        app.playlistSongsFetchTimer = setTimeout(() => {
            app.playlistSongsFetchTimer = null;
            fetchSongsForSelectedPlaylist();
        }, PLAYLIST_SONGS_FETCH_DELAY);
    }

    function getLikedSongsUri() {
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

    async function fetchSongsForSelectedPlaylist() {
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
        app.playlistSongsTotal = songs.length;
        renderSongListVirtual();
        if (app.activePane === "song") scrollSongIntoView(app.selectedSong, false);
    }

    async function renderPlaylistPanel() {
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
    const SONG_ROW_HEIGHT = 26; // px
    const PLAYLIST_ROW_HEIGHT = 26; // px


    function ensurePlaylistListScaffold() {
        const container = document.getElementById("spotui-playlist-list");
        if (!container || document.getElementById("spotui-playlist-list-spacer")) return;
        container.innerHTML = '<legend>Playlists</legend><div id="spotui-playlist-list-spacer" style="position:relative;"><div id="spotui-playlist-list-viewport" style="position:absolute;top:0;left:0;right:0;"></div></div>';
        container.addEventListener("scroll", () => {
            if (app.playlistListScrollRaf) return;
            app.playlistListScrollRaf = requestAnimationFrame(() => {
                app.playlistListScrollRaf = null;
                renderPlaylistListVirtual();
            });
        });
    }

    // Render visible playlist items using virtual scrolling
    function renderPlaylistListVirtual() {
        const container = document.getElementById("spotui-playlist-list");
        if (!container) return;
        ensurePlaylistListScaffold();
        const spacer = document.getElementById("spotui-playlist-list-spacer");
        const viewport = document.getElementById("spotui-playlist-list-viewport");
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
            const className = "playlist-item" + (idx === app.selectedPlaylist && app.activePane === "playlist" ? " selected" : "");
            const text = p.name;
            if (item.className !== className) item.className = className;
            if (item.textContent !== text) item.textContent = text;
        }
    }

    function scrollPlaylistIntoView(idx, smooth = true) {
        const container = document.getElementById("spotui-playlist-list");
        if (!container) return;
        const itemTop = idx * PLAYLIST_ROW_HEIGHT;
        const itemCenter = itemTop + PLAYLIST_ROW_HEIGHT / 2;
        const targetScrollTop = itemCenter - container.clientHeight / 2;
        container.scrollTo({
            top: targetScrollTop,
            behavior: smooth ? "smooth" : "auto",
        });
    }


    function ensureSongListScaffold() {
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
    function renderSongListVirtual() {
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

    function scrollSongIntoView(idx, smooth = true) {
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

    function cancelSongScrollAnim() {
        if (app.songScrollAnimRaf) {
            cancelAnimationFrame(app.songScrollAnimRaf);
            app.songScrollAnimRaf = null;
        }
    }

    function animateSongScrollToIndex(targetIdx) {
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

    function scrollSelectedIntoView() {
        if (app.activePane === 'playlist') {
            scrollPlaylistIntoView(app.selectedPlaylist);
        } else {
            scrollSongIntoView(app.selectedSong);
        }
    }


    // Update song list after navigation
    function commitSongNav(smooth) {
        renderSongListVirtual();
        scrollSongIntoView(app.selectedSong, smooth);
    }

    // Handle keyboard navigation in playlist panel
    async function handlePlaylistPanelKeydown(e) {
        if (e.key === "Escape") {
            e.preventDefault();
            closePlaylistPanel();
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

                scheduleSongsFetchForSelectedPlaylist();
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

    function getTrackTitle(track, index = 0) {
        const meta = track?.metadata || track?.contextTrack?.metadata || {};
        return track?.name || track?.title || meta.title || meta.name || `Track ${index + 1}`;
    }

    function getTrackArtist(track) {
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
    function normalizeTrackItem(track, index = 0) {
        const uri = track?.uri || track?.contextTrack?.uri || "";
        return {
            uri,
            name: getTrackTitle(track, index),
            artist: getTrackArtist(track),
        };
    }

    async function getPlaylists() {
        const rootlist = await Spicetify.Platform.RootlistAPI.getContents();
        const list = [];
        const likedSongsUri = getLikedSongsUri();
        if (likedSongsUri) {
            list.push({ name: "Liked Songs", uri: likedSongsUri, isLikedSongs: true });
        }
        function flatten(items) {
            for (const item of items) {
                if (item.type === "playlist") {
                    list.push({ name: item.name, uri: item.uri });
                } else if (item.type === "folder" && item.items) {
                    flatten(item.items);
                }
            }
        }
        flatten(rootlist.items);
        return list;
    }

    // Singleton promise for theme feed

    // Load theme catalog from remote server
    function loadThemeFeed(onLoad, onError) {
        if (window.spotuiThemes && window.spotuiThemes.length) {
            onLoad();
            return;
        }
        if (!app.themesFeedPromise) {
            app.themesFeedPromise = new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = `${THEME_HOST}themes.js?_=${Math.floor(Date.now() / 1000)}`;
                script.onload = () => {
                    try {
                        if (window.spotuiThemes && window.spotuiThemes.length) {
                            resolve();
                        } else {
                            reject(new Error("Theme feed loaded but empty"));
                        }
                    } finally {
                        script.remove();
                    }
                };
                script.onerror = () => {
                    try {
                        reject(new Error("Failed to load themes"));
                    } finally {
                        script.remove();
                    }
                };
                document.body.appendChild(script);
            });
            app.themesFeedPromise.then(
                () => { app.themesFeedPromise = null; },
                () => { app.themesFeedPromise = null; }
            );
        }
        app.themesFeedPromise.then(onLoad, onError);
    }

    function createAddThemeCard(imgUrl) {
        const card = document.createElement("div");
        card.className = "theme-card";
        card.innerHTML = `
        <h3>Add yours</h3>
        <img src="${imgUrl}" alt="Add Theme">
        <button>Add</button>
    `;
        card.querySelector("button").addEventListener("click", () => {
            window.open("https://spotui.root.sx/", "_blank");
        });
        return card;
    }

    function createThemeCard(theme) {
        const card = document.createElement("div");
        card.className = "theme-card";
        const title = document.createElement("h3");
        title.textContent = theme.name || "";
        const img = document.createElement("img");
        img.src = theme.screenshot_url || "";
        img.alt = `${theme.name || ""} screenshot`;
        const btn = document.createElement("button");
        btn.textContent = "Apply";
        btn.dataset.commands = JSON.stringify(theme.commands || []);
        card.appendChild(title);
        card.appendChild(img);
        card.appendChild(btn);
        return card;
    }
    // Apply community theme by name
    function applyThemeByName(themeName, opts = {}) {
        const skipNonTui = Boolean(opts.skipNonTui);
        return new Promise((resolve, reject) => {
            loadThemeFeed(
                async () => {
                    try {
                        resetAllSettings();
                        const themes = window.spotuiThemes || [];
                        const theme = themes.find((t) => t.name === themeName);

                        if (theme && theme.commands) {
                            const pending = [];
                            theme.commands.forEach((cmd, idx) => {
                                const text = String(cmd || "").trim();
                                if (skipNonTui && !text.startsWith("tui")) return;
                                if (isRestrictedThemeCommand(text)) return;
                                pending.push(
                                    new Promise((res, rej) => {
                                        setTimeout(() => {
                                            execute(cmd, { bypassOnboarding: skipNonTui, fromTheme: true }).then(res, rej);
                                        }, idx * 120);
                                    })
                                );
                            });
                            await Promise.all(pending);
                        }
                        resolve(theme || null);
                    } catch (err) {
                        reject(err);
                    }
                },
                () => reject(new Error("Failed to load themes"))
            );
        });
    }

    // Encode theme name for theme ID generation
    function encodeThemeName(name) {
        try {
            return btoa(unescape(encodeURIComponent(String(name || ""))));
        } catch (e) {
            return "";
        }
    }

    function getThemeSelectionList(themes, showAll = false) {
        if (showAll) return themes;

        const curated = themes.filter((theme) => {
            const themeId = String(theme?.id || "");
            const encodedName = encodeThemeName(theme?.name);
            return FIRST_BOOT_THEME_IDS.has(themeId) || FIRST_BOOT_THEME_IDS.has(encodedName);
        });

        if (curated.length) return curated;
        return themes.slice(0, 3);
    }

    const PANE_TARGETS = {
        helpPanelOpen: "help",
        aboutPanelOpen: "about",
        themePanelOpen: "theme",
    };

    // Global Escape key handler - closes active panels
    function handleGlobalEsc(e) {
        if (e.key !== "Escape") return;
        if (app.onboardingPanelOpen) {
            e.preventDefault();
            return;
        }
        e.preventDefault();
        closeActivePanel();
    }

    // Close all open panels
    function closeActivePanel() {
        if (app.helpPanelOpen) setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", false);
        if (app.aboutPanelOpen) setPanelState("spotui-about-panel", "spotui-about-panel", "aboutPanelOpen", false);
        if (app.lyricsPanelOpen) closeLyricsPanel();
        if (app.playlistPanelOpen) closePlaylistPanel();
        if (app.themePanelOpen) closeThemePanel();
        if (app.searchPanelOpen) closeSearchPanel();
        if (app.onboardingPanelOpen) closeOnboardingPanel();
        if (app.djPanelOpen) {
            const root = document.getElementById("spotui-dj");
            app.djPanelOpen = false;
            app.djPrevPane = null;
            if (root) {
                root.classList.remove("spotui-dj-active");
                root.hidden = true;
            }
            document.body.classList.remove("spotui-dj-panel");
        }
    }

    // Generic panel state manager
    function setPanelState(panelId, className, openVarName, targetState) {
        const wasOpen = Boolean(app[openVarName]);
        const panels = {
            'helpPanelOpen': () => app.helpPanelOpen = targetState,
            'aboutPanelOpen': () => app.aboutPanelOpen = targetState,
            'themePanelOpen': () => app.themePanelOpen = targetState,
            'onboardingPanelOpen': () => app.onboardingPanelOpen = targetState,
        };
        if (panels[openVarName]) panels[openVarName]();
        document.body.classList.toggle(className, targetState);
        const panel = document.getElementById(panelId);
        if (panel) panel.hidden = !targetState;
        const input = document.getElementById("spotui-input");
        if (input) {
            if (targetState) input.blur();
            else input.focus();
        }
        if (targetState) document.addEventListener("keydown", handleGlobalEsc);
        else document.removeEventListener("keydown", handleGlobalEsc);
        if (!targetState && wasOpen) emitPaneClose(PANE_TARGETS[openVarName] || "");
    }

    // Open or toggle help panel
    function openHelpPanel() {
        if (app.helpPanelOpen) { setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", false); return; }
        closeActivePanel();

        setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", true);
        const panel = document.getElementById("spotui-help-panel");
        if (panel) {
            const content = panel.querySelector('.spotui-help-content');
            if (content) {
                content.innerHTML = COMMAND_LIST.map(
                    item => `<div class="help-item"><span class="command">${item.cmd}</span><span class="description">${item.desc}</span></div>`
                ).join('');
            }
        }
    }

    // Open or toggle about panel
    function openAboutPanel() {
        if (app.aboutPanelOpen) { setPanelState("spotui-about-panel", "spotui-about-panel", "aboutPanelOpen", false); return; }
        closeActivePanel();

        setPanelState("spotui-about-panel", "spotui-about-panel", "aboutPanelOpen", true);
        const panel = document.getElementById("spotui-about-panel");
        if (panel) {
            panel.innerHTML = `
<div class="help-item"><span class="command">Developer</span><span class="description">SkenS</span></div>
<div class="help-item"><span class="command">Repository</span><span class="description"><a href="https://github.com/SkenSMasteR/SpoTUI">https://github.com/SkenSMasteR/SpoTUI</a></span></div>
<div class="help-item"><span class="command">Docs</span><span class="description"><a href="https://spotui.root.sx/">https://spotui.root.sx/</a></span></div>
<div class="help-item"><span class="command">Contact</span><span class="description"><a href="mailto:receive@gmx.us">receive@gmx.us</a></span></div>
        `;
        }
    }

    function closePlaylistPanel() {
        const wasOpen = app.playlistPanelOpen;
        app.playlistPanelOpen = false;
        document.body.classList.remove("spotui-playlist-panel");
        const panel = document.getElementById("spotui-playlist-panel");
        if (panel) panel.hidden = true;
        const input = document.getElementById("spotui-input");
        if (input) input.focus();
        document.removeEventListener("keydown", handlePlaylistPanelKeydown);
        if (wasOpen) emitPaneClose("playlist");
    }

    // Open playlist panel and load users playlists
    async function openPlaylistPanel() {
        if (app.playlistPanelOpen) { closePlaylistPanel(); return; }
        closeActivePanel();

        try {
            app.playlists = (await getPlaylists()).filter((p) => p.name !== "DJ");
        } catch (err) {
            print("Playlist error: " + err.message);
            return;
        }

        app.playlistPanelOpen = true;
        document.body.classList.add("spotui-playlist-panel");
        const panel = document.getElementById("spotui-playlist-panel");
        if (panel) panel.hidden = false;

        const input = document.getElementById("spotui-input");
        if (input) input.blur();

        app.selectedPlaylist = 0;
        app.selectedSong = 0;
        app.activePane = 'playlist';

        await renderPlaylistPanel();
        document.addEventListener("keydown", handlePlaylistPanelKeydown);
    }

    function closeThemePanel() {
        setPanelState("spotui-theme-panel", "spotui-theme-panel", "themePanelOpen", false);
    }

    // Open theme browser panel (with search and theme cards)
    async function openThemePanel() {
        if (app.themePanelOpen) { closeThemePanel(); return; }
        closeActivePanel();

        setPanelState("spotui-theme-panel", "spotui-theme-panel", "themePanelOpen", true);
        const panel = document.getElementById("spotui-theme-panel");
        if (!panel) return;

        panel.innerHTML = `<div class="spotui-theme-loading"><div class="spotui-lyrics-loader active"></div></div>`;

        loadThemeFeed(
            () => {
                const themes = window.spotuiThemes || [];
                    panel.innerHTML = `
                <div style="margin-bottom: 20px; display: flex;">
                    <input id="spotui-theme-search" placeholder="Search themes..." style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--panel-border-color, #ff8c42); border-radius: 4px; color: #ddd; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 14px;">
                </div>
                <div class="theme-grid"></div>
            `;
                const grid = panel.querySelector('.theme-grid');
                const searchInput = document.getElementById('spotui-theme-search');

                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const cards = grid.querySelectorAll('.theme-card');
                    cards.forEach(card => {
                        const title = card.querySelector('h3')?.textContent.toLowerCase();
                        if (title) {
                            card.style.display = title.includes(searchTerm) ? '' : 'none';
                        }
                    });
                });

                grid.appendChild(createAddThemeCard(ADD_THEME_IMG_OK));

                themes.forEach(theme => {
                    grid.appendChild(createThemeCard(theme));
                });

                grid.addEventListener('click', e => {
                    if (e.target.tagName === 'BUTTON' && e.target.dataset.commands) {
                        resetAllSettings();
                        const commands = JSON.parse(e.target.dataset.commands);
                        commands.forEach(cmd => { if (!isRestrictedThemeCommand(cmd)) execute(cmd, { fromTheme: true }); });
                        closeThemePanel();
                    }
                });
            },
            () => {
                    panel.innerHTML = `
                <div style="margin-bottom: 20px; display: flex;">
                     <input id="spotui-theme-search" placeholder="Search themes..." style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--panel-border-color, #ff8c42); border-radius: 4px; color: #ddd; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 14px;" disabled>
                </div>
                <p>¯\\_(ツ)_/¯</p><p>Error loading themes. The server may be down or you are rate-limited. Please wait and try again.</p>
            `;
                const grid = document.createElement('div');
                grid.className = 'theme-grid';
                grid.appendChild(createAddThemeCard(ADD_THEME_IMG_ERR));
                panel.appendChild(grid);
            }
        );
    }

    // Mark that the user has launched SpoTUI at least once
    function markLaunched() {
        storageSet(LAUNCHED_KEY, "1");
    }

    // Check if this is the users first time using SpoTUI
    function isFirstBoot() {
        return storageGet(LAUNCHED_KEY) !== "1";
    }

    function closeOnboardingPanel() {
        const wasFirstBoot = app.onboardingPanelOpen && app.onboardingStage === "done";
        app.onboardingPanelOpen = false;
        app.onboardingStage = "commands";
        app.onboardingShowAllThemes = false;
        document.body.classList.remove("spotui-onboarding-panel");
        const panel = document.getElementById("spotui-onboarding-panel");
        if (panel) panel.hidden = true;
        const input = document.getElementById("spotui-input");
        if (input) input.focus();
        document.removeEventListener("keydown", handleGlobalEsc);
        if (wasFirstBoot) initUpdateBanner();
    }
    function openOnboardingPanel() {
        if (app.onboardingPanelOpen) return;
        closeActivePanel();
        app.onboardingPanelOpen = true;
        document.body.classList.add("spotui-onboarding-panel");
        const panel = document.getElementById("spotui-onboarding-panel");
        if (panel) panel.hidden = false;
        const input = document.getElementById("spotui-input");
        if (input) input.blur();
        document.addEventListener("keydown", handleGlobalEsc);
    }

    // Create theme card for onboarding selection
    function onboardingThemeCard(theme) {
        const button = document.createElement("button");
        button.className = "spotui-onboarding-theme";
        button.dataset.themeName = theme.name || "";
        const img = document.createElement("img");
        img.src = theme.screenshot_url || "";
        img.alt = `${theme.name || ""} screenshot`;
        const label = document.createElement("span");
        label.textContent = theme.name || "";
        button.appendChild(img);
        button.appendChild(label);
        return button;
    }

    // Render current onboarding stage content
    function renderOnboardingStage(panel) {
        const themes = getThemeSelectionList(window.spotuiThemes || [], app.onboardingShowAllThemes);
        const themeCards = themes.map(onboardingThemeCard);

        if (app.onboardingStage === "commands") {
            panel.innerHTML = `
            <div class="spotui-onboarding-stage">
                <div class="spotui-onboarding-copy">
                    <div class="spotui-onboarding-kicker">Onboarding · stage 1</div>
                    <h2>Learn commands.</h2>
                    <p>These are some of the most common commands you can use, try them out!</p>
                </div>
                <div class="spotui-onboarding-primer">
                    <div class="help-item"><span class="command">p</span><span class="description">Play / pause</span></div>
                    <div class="help-item"><span class="command">v 50</span><span class="description">Set volume to 50%</span></div>
                    <div class="help-item"><span class="command">loop</span><span class="description">Loop current playlist</span></div>
                </div>
                <div class="spotui-onboarding-callout">
                    <div class="arrow">↙</div>
                    <div>Enter <code>p</code> to play and pause.</div>
                </div>
                <div class="spotui-onboarding-actions centered">
                    <button id="spotui-onboarding-next" class="spotui-control-btn">Next</button>
                </div>
            </div>
        `;
            document.getElementById("spotui-onboarding-next")?.addEventListener("click", () => {
                app.onboardingStage = "themes";
                renderOnboardingPanel();
            });
        } else if (app.onboardingStage === "themes") {
            panel.innerHTML = `
            <div class="spotui-onboarding-stage">
                <div class="spotui-onboarding-copy">
                    <div class="spotui-onboarding-kicker">Onboarding · stage 2</div>
                    <h2>Pick theme.</h2>
                    <p>These are some of the most popular themes. Choose the one that fits your style!</p>
                    <p>You dont like the top 3? Click "View all" to see more themes.</p>
                    <p>Don't worry, you can change theme any time with <code>theme</code>.</p>
                </div>
                <div class="theme-grid spotui-onboarding-grid"></div>
                <div class="spotui-onboarding-actions centered">
                    <button id="spotui-onboarding-view-all" class="spotui-control-btn">View all</button>
                </div>
            </div>
        `;
            const grid = panel.querySelector(".spotui-onboarding-grid");
            if (grid) {
                themeCards.forEach((card) => grid.appendChild(card));
            }
            panel.querySelectorAll(".spotui-onboarding-theme").forEach((button) => {
                button.addEventListener("click", () => {
                    const themeName = button.dataset.themeName;
                    if (!themeName) return;
                    app.onboardingStage = "theme-picked";
                    applyOnboardingTheme(themeName);
                });
            });
            const viewAllBtn = document.getElementById("spotui-onboarding-view-all");
            if (viewAllBtn && !app.onboardingShowAllThemes) {
                viewAllBtn.addEventListener("click", () => {
                    app.onboardingShowAllThemes = true;
                    renderOnboardingPanel();
                });
            } else if (viewAllBtn) {
                viewAllBtn.remove();
            }
        } else if (app.onboardingStage === "theme-picked") {
            panel.innerHTML = `
            <div class="spotui-onboarding-stage">
                <div class="spotui-onboarding-copy">
                    <div class="spotui-onboarding-kicker">Onboarding · stage 3</div>
                    <h2>Theme applied.</h2>
                    <p>You can change theme any time with <code>theme</code>.</p>
                </div>
                <div class="spotui-onboarding-actions centered">
                    <button id="spotui-onboarding-continue" class="spotui-control-btn">Continue</button>
                </div>
            </div>
        `;
            document.getElementById("spotui-onboarding-continue")?.addEventListener("click", () => {
                app.onboardingStage = "done";
                renderOnboardingPanel();
            });
        } else {
            markLaunched();
            panel.innerHTML = `
            <div class="spotui-onboarding-stage">
                <div class="spotui-onboarding-copy">
                    <div class="spotui-onboarding-kicker">Onboarding · stage 4</div>
                    <h2>Ready.</h2>
                    <p>Enter <code>list</code> or <code>playlist</code> to open menu for playlists.</p>
                    <br>
                    <p>Note: You must run one of the commands above to finish onboarding!</p>
                    <p>After finishing onboarding, feel free to explore all the commands with <code>help</code>.</p>
                </div>
            </div>
        `;
        }
    }

    function renderOnboardingFeedError(panel) {
        panel.innerHTML = `
        <div class="spotui-onboarding-copy">
            <div class="spotui-onboarding-kicker">Onboarding · stage 5</div>
            <h2>Theme feed failed.</h2>
            <p>This may happen if you have been ratelimited, wait a few seconds and click the retry button below.</p>
            <p>Or skip theme selection for now, you can pick one later with <code>theme</code>.</p>
        </div>
        <div class="spotui-onboarding-actions centered">
            <button id="spotui-onboarding-retry" class="spotui-control-btn">Retry</button>
            <button id="spotui-onboarding-skip" class="spotui-control-btn">Skip</button>
        </div>
    `;
        document.getElementById("spotui-onboarding-retry")?.addEventListener("click", () => renderOnboardingPanel());
        document.getElementById("spotui-onboarding-skip")?.addEventListener("click", () => {
            app.onboardingStage = "done";
            renderOnboardingPanel();
        });
    }

    // Apply theme during onboarding flow
    function applyOnboardingTheme(themeName) {
        const panel = document.getElementById("spotui-onboarding-panel");
        if (!panel) return;
        panel.innerHTML = `
        <div class="spotui-onboarding-stage">
            <div class="spotui-onboarding-copy">
                <div class="spotui-onboarding-kicker">Onboarding · stage 3</div>
                <h2>Applying theme...</h2>
            </div>
        </div>
    `;
        applyThemeByName(themeName, { skipNonTui: true })
            .then((theme) => {
                if (!theme) throw new Error("Theme not found");
                if (app.onboardingStage !== "theme-picked") return;
                renderOnboardingStage(panel);
            })
            .catch(() => {
                if (app.onboardingStage !== "theme-picked") return;
                app.onboardingStage = "themes";
                renderOnboardingFeedError(panel);
            });
    }

    function renderOnboardingPanel() {
        const panel = document.getElementById("spotui-onboarding-panel");
        if (!panel) return;

        if (app.onboardingStage !== "themes") {
            renderOnboardingStage(panel);
            return;
        }

        if (window.spotuiThemes && window.spotuiThemes.length) {
            renderOnboardingStage(panel);
            return;
        }

        panel.innerHTML = "<p>Loading first boot...</p>";

        loadThemeFeed(
            () => renderOnboardingStage(panel),
            () => renderOnboardingFeedError(panel)
        );
    }

    // Launch first-boot onboarding if user has never launched before
    async function launchFirstBootIfNeeded() {
        if (!isFirstBoot()) return;
        openOnboardingPanel();
        app.onboardingStage = "commands";
        app.onboardingShowAllThemes = false;
        renderOnboardingPanel();
    }
    // Return set of allowed commands during onboarding stages
    // Restricts the user to safe commands until onboarding is complete
    function getAllowedOnboardingCommands() {
        if (!app.onboardingPanelOpen) return null;
        if (app.onboardingStage === "done") return new Set(["p", "v", "loop", "list", "playlist"]);
        return new Set(["p", "v", "loop"]);
    }

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

    function exitStandby() {
        if (!app.standbyOpen) return;
        standbyToken += 1;
        app.standbyOpen = false;
        if (!swallowKeys) detachKeyListeners();
        window.removeEventListener("blur", onStandbyBlur, true);
        document.removeEventListener("focusin", onStandbyBlur, true);
        removeOverlay();
        restoreSpotui();
    }

    async function enterStandby() {
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

    // Check if URL points to video file
    function isVideoWallpaperUrl(url) {
        try {
            const clean = String(url).split("?")[0].split("#")[0];
            return /\.(mp4|webm)$/i.test(clean);
        } catch (e) {
            return false;
        }
    }

    // Set background wallpaper (image or video)
    function setWallpaper(url, opacity, save = true) {
        let tui = document.getElementById("spotui-tui");
        if (!tui) return;

        const isVideo = isVideoWallpaperUrl(url);
        let wp = document.getElementById("spotui-wallpaper");

        if (wp && ((isVideo && wp.tagName !== "VIDEO") || (!isVideo && wp.tagName === "VIDEO"))) {
            wp.remove();
            wp = null;
        }

        if (!wp) {
            wp = document.createElement(isVideo ? "video" : "div");
            wp.id = "spotui-wallpaper";
            wp.style.position = "absolute";
            wp.style.top = "0";
            wp.style.left = "0";
            wp.style.width = "100%";
            wp.style.height = "100%";
            wp.style.zIndex = "-1";
            wp.style.objectFit = "cover";
            wp.style.backgroundSize = "cover";
            wp.style.backgroundPosition = "center";
            if (isVideo) {
                wp.muted = true;
                wp.autoplay = true;
                wp.loop = true;
                wp.playsInline = true;
                wp.controls = false;
                wp.referrerPolicy = "no-referrer";
                wp.setAttribute("muted", "");
                wp.setAttribute("autoplay", "");
                wp.setAttribute("loop", "");
                wp.setAttribute("playsinline", "");
                wp.setAttribute("referrerpolicy", "no-referrer");
            }
            tui.prepend(wp);
        }

        if (isVideo) {
            if (wp.getAttribute("src") !== url) {
                wp.src = url;
                wp.onerror = () => {
                    console.error(
                        "SpoTUI: wallpaper video failed to load",
                        url,
                        "error code:", wp.error && wp.error.code,
                        "message:", wp.error && wp.error.message,
                        "networkState:", wp.networkState,
                        "readyState:", wp.readyState
                    );
                };
            }
            wp.muted = true;
            const playPromise = wp.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch((err) => console.error("SpoTUI: wallpaper video play() rejected", err, "networkState:", wp.networkState, "readyState:", wp.readyState));
            }
        } else {
            wp.style.backgroundImage = `url("${url}")`;
        }
        wp.style.opacity = opacity;
        tui.style.backgroundColor = "transparent";
        const children = tui.querySelectorAll(':not(#spotui-wallpaper)');
        children.forEach(c => {
            if (window.getComputedStyle(c).position === 'static') c.style.position = 'relative';
            c.style.zIndex = '1';
        });
        if (save) {
            storageSet(WP_URL_KEY, url);
            storageSet(WP_OPACITY_KEY, opacity);
        }
    }

    async function execute(cmd, opts = {}) {
        const cleanedCmd = stripCommandPrefix(cmd);
        const [rawCommand, ...args] = cleanedCmd.split(/\s+/);
        const command = (rawCommand || "").toLowerCase();
        const argText = args.join(" ").trim();
        if (opts.fromTheme && isRestrictedThemeCommand(cleanedCmd)) return;

        const allowedOnboardingCommands = opts.bypassOnboarding ? null : getAllowedOnboardingCommands();
        if (allowedOnboardingCommands && !allowedOnboardingCommands.has(command)) return;

        const allowedJamCommands = getAllowedJamGuestCommands();
        if (allowedJamCommands && !allowedJamCommands.has(command)) {
            jamSay("Commands limited to: `volume`, `lyrics`, `jam leave`");
            return;
        }

        if (command === "tui") {
            const argsLower = args.map((a) => a.toLowerCase());
            if (argsLower.includes("-l") && argsLower.includes("-a")) {
                const state = (args[args.length - 1] || "").toLowerCase();
                if (state === "off") {
                    app.asciiEnabled = false;
                    resetGrid();
                    storageSet(ANIMATION_KEY, "off");
                } else if (state === "on") {
                    app.asciiEnabled = true;
                    storageRemove(ANIMATION_KEY);
                }
                return;
            }
            if (argsLower[0] === "-l") {
                const state = (args[1] || "").toLowerCase();
                if (state === "on" || state === "off") {
                    toggleLogo(state);
                }
                return;
            }
            if (argsLower.includes("-wp")) {
                const urlIdx = argsLower.indexOf("-wp") + 1;
                const url = args[urlIdx];
                if ((url || "").toLowerCase() === "off") {
                    const wp = document.getElementById("spotui-wallpaper");
                    if (wp) wp.remove();
                    storageRemove(WP_URL_KEY);
                    storageRemove(WP_OPACITY_KEY);
                    return;
                }
                if (url) {
                    let opacity = "1";
                    const oIdx = argsLower.indexOf("-o");
                    if (oIdx !== -1 && args[oIdx + 1]) opacity = args[oIdx + 1];
                    setWallpaper(url, opacity);
                }
                return;
            }
            if (argsLower.includes("-t")) {
                const tIndex = argsLower.indexOf("-t");
                if (argsLower[tIndex+1] === "pull" && args[tIndex+2]) {
                    const base64Name = args[tIndex+2];
                    try {
                        const themeName = atob(base64Name);
                        applyThemeByName(themeName);
                    } catch (e) {}
                }
                return;
            }
            if (argsLower[0] === "bind") {
                if (argsLower[1] === "clear" && args.length === 2) {
                    saveKeybinds({});
                    return;
                }
                const bindMatch = cleanedCmd.match(/^tui\s+bind\s+"([A-Za-z])"\s+"([^"]+)"\s*$/i);
                if (bindMatch) {
                    const combo = "Alt+" + bindMatch[1].toUpperCase();
                    const binds = getKeybinds();
                    binds[combo] = bindMatch[2];
                    saveKeybinds(binds);
                }
                return;
            }
            if (argsLower[0] === "unbind") {
                const unbindMatch = cleanedCmd.match(/^tui\s+unbind\s+"([A-Za-z])"\s*$/i);
                if (unbindMatch) {
                    const combo = "Alt+" + unbindMatch[1].toUpperCase();
                    const binds = getKeybinds();
                    delete binds[combo];
                    saveKeybinds(binds);
                } else if (argsLower[1] === "all") {
                    saveKeybinds({});
                }
                return;
            }
            if (argsLower[0] === "actions") {
                handleActionsCommand(cleanedCmd);
                return;
            }
            if (argsLower.includes("-ly") && argsLower.includes("-cp")) {
                handleColorArgs(args, {
                    "-active": LYRICS_COLOR_ACTIVE,
                    "-inactive": LYRICS_COLOR_INACTIVE,
                    "-near": LYRICS_COLOR_LIGHT_INACTIVE,
                });
                applyLyricColors();
                return;
            }
            if (argsLower.includes("-ly") && argsLower.includes("-animation")) {
                const idx = argsLower.indexOf("-animation");
                const state = (args[idx + 1] || "").toLowerCase();
                if (state === "on") {
                    document.body.classList.add("spotui-lyrics-animation-on");
                    storageSet(LYRICS_ANIMATION_KEY, "on");
                } else if (state === "off") {
                    document.body.classList.remove("spotui-lyrics-animation-on");
                    storageSet(LYRICS_ANIMATION_KEY, "off");
                }
                if (app.lyricsPanelOpen) {
                    syncLyricsHighlight(true);
                }
                return;
            }
            if (argsLower.includes("-bar")) {
                if (argsLower.includes("-v")) {
                    const idx = argsLower.indexOf("-v");
                    const state = (args[idx + 1] || "").toLowerCase();
                    if (state === "on" || state === "off") {
                        storageSet(PLAYER_BAR_VISIBLE, state);
                        applyPlayerBarVisibility();
                        applyCustomBarState();
                    }
                    const newArgs = args.filter((arg, i) => i !== idx && i !== idx + 1);
                    if (newArgs.length > 1) {
                        handleColorArgs(newArgs, {
                            "-bg": PLAYER_BAR_BG,
                            "-border": PLAYER_BAR_BORDER,
                            "-text": PLAYER_BAR_TEXT,
                        });
                        applyPlayerBarColors();
                    }
                } else if (argsLower.includes("-c")) {
                    const idx = argsLower.indexOf("-c");
                    const state = (args[idx + 1] || "").toLowerCase();
                    if (state === "on" || state === "off") {
                        storageSet(CUSTOM_BAR_ENABLED, state);
                        applyCustomBarState();
                    }
                    if (argsLower.includes("-progress")) {
                        const pIdx = argsLower.indexOf("-progress");
                        const styleId = (args[pIdx + 1] || "").toLowerCase();
                        if (styleId && PROGRESS_STYLES[styleId]) {
                            storageSet(CUSTOM_BAR_PROGRESS_STYLE, styleId);
                            if (storageGet(CUSTOM_BAR_ENABLED) === "on") updateCustomBar();
                        }
                    }
                } else {
                    handleColorArgs(args, {
                        "-bg": PLAYER_BAR_BG,
                        "-border": PLAYER_BAR_BORDER,
                        "-text": PLAYER_BAR_TEXT,
                    });
                    applyPlayerBarColors();
                }
                return;
            }
            if (argsLower.includes("-progress")) {
                handleColorArgs(args, {
                    "-bg": PROGRESS_BAR_BG,
                    "-fg": PROGRESS_BAR_FG,
                });
                applyProgressBarColors();
                return;
            }
            if (argsLower.includes("-panel")) {
                handleColorArgs(args, {
                    "-bg": PANEL_BG,
                    "-border": PANEL_BORDER,
                    "-text": PANEL_TEXT,
                });
                applyPanelColors();
                return;
            }
            if (argsLower.includes("-inputs")) {
                if (argsLower.includes("-buttons")) {
                    const idx = argsLower.indexOf("-buttons");
                    const state = (args[idx + 1] || "").toLowerCase();
                    if (state === "on" || state === "off") {
                        storageSet(INPUT_BUTTONS, state);
                        applyInputButtonsVisibility();
                    }
                }
                const filteredArgs = [];
                for (let i = 0; i < args.length; i++) {
                    if (argsLower[i] === "-buttons") {
                        i++;
                    } else {
                        filteredArgs.push(args[i]);
                    }
                }
                if (filteredArgs.length > 1 || (filteredArgs.length === 1 && filteredArgs[0].toLowerCase() === "off")) {
                    handleColorArgs(filteredArgs, {
                        "-bg": INPUT_BG,
                        "-bg-hover": INPUT_BG_HOVER,
                        "-text": INPUT_TEXT,
                        "-border": INPUT_BORDER,
                    });
                    applyInputColors();
                }
                return;
            }
            if (argsLower[0] === "restore") {
                const fullRestore = argsLower[1] === "-full";
                const launchedValue = storageGet(LAUNCHED_KEY);
                const bannerValue = storageGet(UPDATE_BANNER_KEY);
                const keybindsValue = storageGet(KEYBIND_STORAGE_KEY);
                const actionsValue = storageGet(ACTIONS_STORAGE_KEY);
                storageClear();
                if (!fullRestore) {
                    if (launchedValue !== null) storageSet(LAUNCHED_KEY, launchedValue);
                    if (bannerValue !== null) storageSet(UPDATE_BANNER_KEY, bannerValue);
                    if (keybindsValue !== null) storageSet(KEYBIND_STORAGE_KEY, keybindsValue);
                    if (actionsValue !== null) storageSet(ACTIONS_STORAGE_KEY, actionsValue);
                }
                showRestartPopup("Wait 5 seconds and relaunch Spotify", true);
                setTimeout(() => location.reload(), 100);
                return;
            }
            return;
        }

        if (command === "standby") { closeActivePanel(); await enterStandby(); return; }
        if (command === "help") { openHelpPanel(); return; }
        if (command === "about") { openAboutPanel(); return; }
        if (command === "playlist" || command === "list") { 
            if (argText) {
                try {
                    app.playlists = await getPlaylists();
                } catch (err) {
                    jamSay("Playlist error: " + err.message);
                    return;
                }

                const match = app.playlists.filter(p => p.name.toLowerCase().includes(argText.toLowerCase()));
                if (match.length === 1) {
                    Spicetify.Player.playUri(match[0].uri);
                    return;
                } else if (match.length > 1) {
                    jamSay("Multiple matches: " + match.map(p => p.name).join(", "));
                    return;
                }
            }

            openPlaylistPanel(); return; 
        }
        if (command === "theme") { openThemePanel(); return; }
        if (command === "discord") {
            storageRemove(UPDATE_BANNER_KEY);
            const existingBanner = document.getElementById("spotui-update-banner");
            if (existingBanner) existingBanner.remove();
            initUpdateBanner();
            return;
        }

        const playerMap = {
            play: { fn: () => { if (!Spicetify.Player.isPlaying()) Spicetify.Player.togglePlay(); }, name: "Play" },
            pause: { fn: () => { if (Spicetify.Player.isPlaying()) Spicetify.Player.togglePlay(); }, name: "Pause" },
            p: { fn: () => { const p = Spicetify.Player.isPlaying(); Spicetify.Player.togglePlay(); return p; }, name: "Play/PauseToggle" },
            skip: { fn: () => Spicetify.Player.next(), name: "Skip" },
            back: { fn: () => Spicetify.Player.back(), name: "Back" },
            shuffle: { fn: () => { const s = Spicetify.Player.getShuffle(); Spicetify.Player.setShuffle(!s); return s; }, name: "Shuffle" },
            like: { fn: async () => { const h = await Spicetify.Player.getHeart(); await Spicetify.Player.toggleHeart(); return h; }, name: "Like" }
        };

        if (playerMap[command]) {
            const act = playerMap[command];
            try { await act.fn(); } catch {}
            return;
        }

        if (command === "search") {
            closeActivePanel();
            openSearchPanel(argText);
            return;
        }

        if (command === "seek" || command === "s") {
            try {
                if (!argText) return;
                const parts = argText.split(':').map(Number);
                if (parts.length !== 2 || parts.some(isNaN)) return;
                Spicetify.Player.seek((parts[0] * 60 + parts[1]) * 1000);
            } catch {}
            return;
        }

        if (command === "volume" || command === "v") {
            try {
                if (!argText) return;
                const percent = Number(argText);
                if (!Number.isFinite(percent) || percent < 0 || percent > 100) return;
                Spicetify.Player.setVolume(percent / 100);
            } catch {}
            return;
        }

        if (command === "loop") { handleRepeatCommand("loop", argText); return; }
        if (command === "superloop") { handleRepeatCommand("superloop", argText); return; }
        if (command === "lyrics") { handleLyricsCommand(argText); return; }
        if (command === "dj") {
            try {
                app.playlists = await getPlaylists();
                const match = app.playlists.find((p) => p.name === "DJ");
                if (!match) {
                    jamSay("Spotify DJ isn’t available for your account yet.");
                    return;
                }
                Spicetify.Player.playUri(match.uri);
            } catch (err) {
                jamSay("Spotify DJ isn’t available for your account yet.");
            }
            return;
        }

        if (command === "jam") {
            const sub = (args[0] || "").toLowerCase();
            if (sub === "create") { await jamCreate(); return; }
            if (sub === "join") { await jamJoin(args[1]); return; }
            if (sub === "leave") { await jamLeave(); return; }
            jamSay("Usage: jam create | jam join <pin> | jam leave");
            return;
        }
    }
    function handleRepeatCommand(kind, arg) {
        try {
            const current = Spicetify.Player.getRepeat();
            const targetMode = kind === "loop" ? 1 : 2;
            let nextMode = targetMode;
            const normalizedArg = String(arg || "").trim().toLowerCase();

            if (normalizedArg === "on") nextMode = targetMode;
            else if (normalizedArg === "off") nextMode = 0;
            else if (normalizedArg === "") nextMode = current === targetMode ? 0 : targetMode;
            else return;

            Spicetify.Player.setRepeat(nextMode);
        } catch (err) {}
    }

    const PANE_CLOSE_EVENT = "pane_close";
    const RESERVED_NAMES = new Set(["create", "list", "enable", "disable", "delete"]);
    const CLAUSE_RE = /^(?:actions:)?spotui@([a-z_]+)(?:>(!?)([a-z0-9_-]+))?$/i;

    let runningActions = false;

    function parseQuotedTokens(text) {
        const tokens = [];
        const re = /"([^"]*)"|(\S+)/g;
        let m;
        while ((m = re.exec(String(text || "")))) {
            tokens.push(m[1] !== undefined ? m[1] : m[2]);
        }
        return tokens;
    }

    function getActions() {
        try {
            const raw = storageGet(ACTIONS_STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
            const clean = {};
            Object.keys(parsed).forEach((key) => {
                const item = parsed[key];
                if (!item || typeof item !== "object") return;
                clean[key] = {
                    enabled: item.enabled !== false,
                    listener: typeof item.listener === "string" ? item.listener : "",
                    command: typeof item.command === "string" ? item.command : "",
                };
            });
            return clean;
        } catch (e) {
            return {};
        }
    }

    function saveActions(map) {
        storageSet(ACTIONS_STORAGE_KEY, JSON.stringify(map));
    }

    function validName(name) {
        return typeof name === "string" && /^[A-Za-z0-9_-]+$/.test(name) && !RESERVED_NAMES.has(name.toLowerCase());
    }

    function parseListener(listener) {
        const raw = String(listener || "").trim();
        if (!raw.toLowerCase().startsWith("actions:")) return null;
        const parts = raw.split("|").map((p) => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        const clauses = [];
        for (let i = 0; i < parts.length; i++) {
            const m = parts[i].match(CLAUSE_RE);
            if (!m) return null;
            const event = m[1].toLowerCase();
            const exclude = m[2] === "!";
            const target = (m[3] || "").toLowerCase();
            if (event !== PANE_CLOSE_EVENT) return null;
            if (target === "onboarding") return null;
            clauses.push({ event, exclude, target });
        }
        return clauses;
    }

    function listenerMatches(listener, event, target) {
        const clauses = parseListener(listener);
        if (!clauses) return false;
        const matching = clauses.filter((c) => c.event === event);
        if (!matching.length) return false;
        const closed = String(target || "").toLowerCase();
        const includes = [];
        const excludes = [];
        let anyPane = false;
        for (let i = 0; i < matching.length; i++) {
            const clause = matching[i];
            if (!clause.target) {
                anyPane = true;
                continue;
            }
            if (clause.exclude) excludes.push(clause.target);
            else includes.push(clause.target);
        }
        if (excludes.indexOf(closed) !== -1) return false;
        if (anyPane) return true;
        if (includes.length) return includes.indexOf(closed) !== -1;
        return true;
    }

    function paneTarget(target) {
        return String(target || "").toLowerCase();
    }

    function emitPaneClose(target) {
        const closed = paneTarget(target);
        if (!closed || closed === "onboarding") return;
        queueMicrotask(() => runPaneClose(closed));
    }

    async function runPaneClose(target) {
        if (runningActions) return;
        runningActions = true;
        try {
            const actions = getActions();
            const names = Object.keys(actions);
            for (let i = 0; i < names.length; i++) {
                const action = actions[names[i]];
                if (!action.enabled || !action.listener || !action.command) continue;
                if (!listenerMatches(action.listener, PANE_CLOSE_EVENT, target)) continue;
                await execute(action.command);
            }
        } finally {
            runningActions = false;
        }
    }

    function handleActionsCommand(cleanedCmd) {
        const rest = parseQuotedTokens(cleanedCmd).slice(2);
        if (!rest.length) {
            jamSay('Usage: tui actions create <name> | tui actions "<name>" "<listener>" "<command>" | tui actions list | tui actions enable <name> | tui actions disable <name> | tui actions delete <name>');
            return;
        }
        const sub = rest[0].toLowerCase();
        if (sub === "create") {
            const name = rest[1];
            if (!validName(name)) {
                jamSay("Invalid action name");
                return;
            }
            const actions = getActions();
            if (actions[name]) {
                jamSay("Action already exists: " + name);
                return;
            }
            actions[name] = { enabled: true, listener: "", command: "" };
            saveActions(actions);
            jamSay("Created action: " + name);
            return;
        }
        if (sub === "list") {
            const actions = getActions();
            const names = Object.keys(actions);
            if (!names.length) {
                jamSay("No actions");
                return;
            }
            jamSay(names.map((n) => {
                const a = actions[n];
                const state = a.enabled ? "on" : "off";
                const listener = a.listener || "-";
                const command = a.command || "-";
                return n + " [" + state + "] " + listener + " -> " + command;
            }).join("\n"));
            return;
        }
        if (sub === "delete") {
            const name = rest[1];
            if (!name) {
                jamSay("Usage: tui actions delete <name>");
                return;
            }
            const actions = getActions();
            if (!actions[name]) {
                jamSay("Unknown action: " + name);
                return;
            }
            delete actions[name];
            saveActions(actions);
            jamSay("Deleted action: " + name);
            return;
        }
        if (sub === "enable" || sub === "disable") {
            const name = rest[1];
            if (!name) {
                jamSay("Usage: tui actions " + sub + " <name>");
                return;
            }
            const actions = getActions();
            if (!actions[name]) {
                jamSay("Unknown action: " + name);
                return;
            }
            actions[name].enabled = sub === "enable";
            saveActions(actions);
            jamSay((sub === "enable" ? "Enabled" : "Disabled") + " action: " + name);
            return;
        }
        if (rest.length >= 3) {
            const name = rest[0];
            const listener = rest[1];
            const command = rest.slice(2).join(" ");
            if (!validName(name)) {
                jamSay("Invalid action name");
                return;
            }
            const parsed = parseListener(listener);
            if (!parsed) {
                jamSay("Unknown listener");
                return;
            }
            if (!String(command || "").trim()) {
                jamSay("Missing command");
                return;
            }
            const actions = getActions();
            const prev = actions[name] || { enabled: true};
            actions[name] = {
                enabled: prev.enabled !== false,
                listener,
                command,
            };
            saveActions(actions);
            jamSay("Updated action: " + name);
            return;
        }
        jamSay('Usage: tui actions create <name> | tui actions "<name>" "<listener>" "<command>" | tui actions list | tui actions enable <name> | tui actions disable <name> | tui actions delete <name>');
    }

    // Check if Spotifys lyrics panel is visible in DOM
    function detectLyricsSurface() {
        return Boolean(
            document.querySelector(
                ".main-nowPlayingView-lyricsContent, .main-lyricsCinema-container, .lyrics-lyricsContainer-LyricsContainer"
            )
        );
    }

    function syncLyricsState() {
        if (document.body) {
            document.body.classList.toggle("spotui-lyrics-open", detectLyricsSurface());
        }
    }

    // Hook into Spotifys native lyrics button to track panel state changes
    function hookLyricsButton() {
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
    function initLyricsBridge() {
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
    function getLyricsEls() {
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
    function getCurrentTrackLyricsInfo() {
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
    function parseLrc(lrcText) {
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
    function plainLyricsToLines(plainText) {
        return String(plainText || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(text => ({ startTime: -1, text }));
    }

    // Fetch lyrics from Spotify's color-lyrics API
    // Returns {lines, synced, provider, instrumental} or null
    async function fetchSpotifyColorLyrics(uri) {
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
    async function fetchLrclibLyrics(info) {
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
    function normalizeLrclibPayload(data) {
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
    async function resolveTrackLyrics(info) {
        const spotify = await fetchSpotifyColorLyrics(info.uri);
        if (spotify) return spotify;
        const lrclib = await fetchLrclibLyrics(info);
        if (lrclib) return lrclib;
        return { lines: [], synced: false, provider: "", instrumental: false, error: "No lyrics found" };
    }

    // Display empty state message in lyrics panel
    function renderLyricsEmpty(message, detail = "") {
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
    function slideLyricsOut() {
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
    function resetLyricsTransform() {
        const els = getLyricsEls();
        if (!els?.lines) return;
        const lines = els.lines;
        lines.style.transition = "none";
        lines.classList.remove("spotui-lyrics-exit-active");
        void lines.offsetWidth;
        lines.style.transition = "";
    }

    // Animate lyrics panel sliding in (enter transition)
    function slideLyricsIn() {
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
    function renderLyricsLoading() {
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
    function renderLyricsLines(lines, synced = true) {
        const els = getLyricsEls();
        if (!els?.lines) return;
        els.lines.innerHTML = "";
        els.lines.classList.toggle("unsynced", !synced);
        app.lyricsActiveIndex = -1;
        app.cachedLyricsRows = [];
        app.cachedLyricsLoaders = [];
        if (!lines.length) { renderLyricsEmpty(); return; }

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

    function findActiveLyricIndex(lines, progressMs) {
        if (!lines?.length || lines[0].startTime < 0) return -1;
        let idx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startTime <= progressMs) idx = i;
            else break;
        }
        return idx;
    }

    // Update lyric highlight and scroll position based on playback progress
    function syncLyricsHighlight(force = false) {
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
    function setLyricsHeader(info, statusText) {
        const els = getLyricsEls();
        if (!els) return;
        if (els.track) els.track.textContent = info ? `${info.title}${info.artist ? ` — ${info.artist}` : ""}` : "Nothing playing";
        if (els.meta) els.meta.textContent = statusText || "";
    }

    // Load lyrics for currently playing track with optional slide transition
    async function loadLyricsForCurrentTrack(isTransition = false) {
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
            renderLyricsEmpty();
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

        if (app.lyricsCache.instrumental) { setLyricsHeader(info, "instrumental"); renderLyricsEmpty(); if (isTransition) slideLyricsIn(); return; }
        if (!app.lyricsCache.lines.length) { setLyricsHeader(info, "not found"); renderLyricsEmpty(); if (isTransition) slideLyricsIn(); return; }
        setLyricsHeader(info, `${app.lyricsCache.synced ? "synced" : "unsynced"} · ${app.lyricsCache.provider}`);
        renderLyricsLines(app.lyricsCache.lines, app.lyricsCache.synced);
        syncLyricsHighlight(true);
        if (isTransition) slideLyricsIn();
    }

    // Persist lyrics panel open/closed state
    function storeLyricsOpen(open) {
        storageSet(LYRICS_STORAGE_KEY, open ? "1" : "0");
    }

    // Check if a playable track is loaded in Spotify player
    function hasPlayableTrackItem() {
        const item = Spicetify?.Player?.data?.item;
        return Boolean(item?.uri && String(item.uri).includes(":track:"));
    }

    // Wait for player to load a track, then execute callback
    // Polls up to 40 times (10 seconds) before giving up
    function waitForPlayerReadyThen(callback, attempt = 0) {
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
    function pollForTrackThenReload() {
        if (!app.lyricsPanelOpen) return;
        if (hasPlayableTrackItem()) {
            loadLyricsForCurrentTrack();
            return;
        }
        setTimeout(pollForTrackThenReload, 1000);
    }

    // Open lyrics panel and start syncing with playback
    function openLyricsPanel() {
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
    function closeLyricsPanel() {
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
        emitPaneClose("lyrics");
    }

    // Attach event listener for track changes to reload lyrics
    function bindLyricsEvents() {
        if (app.lyricsBound || !Spicetify.Player?.addEventListener) return;
        app.lyricsBound = true;
        Spicetify.Player.addEventListener("songchange", () => {
            if (!app.lyricsPanelOpen) return;
            app.lyricsCache = { uri: "", lines: [], synced: false, provider: "", instrumental: false, error: "" };
            loadLyricsForCurrentTrack(true);
        });
    }

    // Handle lyrics command
    function handleLyricsCommand(arg) {
        const mode = String(arg || "").trim().toLowerCase();
        if (mode === "on" || mode === "open") { if (!app.lyricsPanelOpen) openLyricsPanel(); return; }
        if (mode === "off" || mode === "close") { closeLyricsPanel(); return; }
        if (mode && mode !== "toggle") return;
        if (app.lyricsPanelOpen) { closeLyricsPanel(); }
        else { openLyricsPanel(); }
    }

    function applyCssVar(key, cssVar) {
        const root = document.documentElement;
        const value = storageGet(key);
        if (value) root.style.setProperty(cssVar, value);
        else root.style.removeProperty(cssVar);
    }

    // Validate hex color format
    function isValidHexColor(value) {
        return typeof value === "string" && HEX_COLOR_REGEX.test(value);
    }

    // Parse color flag arguments and save valid hex colors to storage
    function handleColorArgs(args, flagToKey) {
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
    function applyLyricColors() {
        try {
            applyCssVar(LYRICS_COLOR_ACTIVE, "--lyrics-color-active");
            applyCssVar(LYRICS_COLOR_INACTIVE, "--lyrics-color-inactive");
            applyCssVar(LYRICS_COLOR_LIGHT_INACTIVE, "--lyrics-color-light-inactive");
        } catch (e) {
            console.error("SpoTUI: Failed to apply lyric colors", e);
        }
    }

    // Apply stored player bar color preferences from localStorage
    function applyPlayerBarColors() {
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
    function applyPlayerBarVisibility() {
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
    function renderProgressBar(progress, styleId, width) {
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
    function updateCustomBarWidth() {
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
    function drawCustomBarLeft(track, artist, liked) {
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
    async function updateCustomBar() {
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
            volEl.addEventListener("wheel", (e) => {
                e.preventDefault();
                const cur = Spicetify.Player.getVolume();
                const delta = e.deltaY < 0 ? 0.05 : -0.05;
                Spicetify.Player.setVolume(Math.max(0, Math.min(1, cur + delta)));
            }, { passive: false });
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
    function applyCustomBarState() {
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
    function applyProgressBarColors() {
        try {
            applyCssVar(PROGRESS_BAR_BG, "--progress-bar-background");
            applyCssVar(PROGRESS_BAR_FG, "--progress-bar-foreground");
        } catch (e) {
            console.error("SpoTUI: Failed to apply progress bar colors", e);
        }
    }

    // Apply stored input field colors
    function applyInputColors() {
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
    function darkenHexColor(hex, factor) {
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
    function applyPanelColors() {
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
    function applyInputButtonsVisibility() {
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
    // Create control buttons - Lyrics, Enable Spotify, Back
    function createControlButtons() {
        const controls = document.createElement("div");
        controls.id = "spotui-controls";
        const state = storageGet(INPUT_BUTTONS) || "on";
        controls.style.display = state === "off" ? "none" : "flex";

        const lyricsBtn = createButton("lyrics-btn", "spotui-control-btn", "Lyrics", () => {
            handleLyricsCommand();
        });

        const spotifyBtn = createButton("enable-spotify-btn", "spotui-control-btn", "Enable Spotify", () => {
            const enabled = document.body.classList.toggle("spotui-spotify-enabled");
            if (enabled) {
                document.body.classList.add("spotui-tui-hidden");
                spotifyBtn.textContent = "Disable Spotify";
            } else {
                spotifyBtn.textContent = "Enable Spotify";
                document.body.classList.remove("spotui-tui-hidden");
                document.body.classList.remove("spotui-search-mode");
            }
        });

        const standbyBtn = createButton("standby-btn", "spotui-control-btn spotui-standby-btn", "", () => {
            enterStandby();
        });
        standbyBtn.setAttribute("aria-label", "Standby");
        standbyBtn.title = "Standby";
        standbyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M1 3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5M8 6a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 12.293V6.5A.5.5 0 0 1 8 6"/></svg>`;

        controls.appendChild(lyricsBtn);
        controls.appendChild(spotifyBtn);
        controls.appendChild(standbyBtn);
        (document.getElementById("spotui-footer") || document.body).appendChild(controls);

        const backBtn = createButton("spotui-back-btn", "spotui-control-btn", "Back", () => {
            document.body.classList.remove("spotui-search-mode", "spotui-spotify-enabled", "spotui-tui-hidden");
            spotifyBtn.textContent = "Enable Spotify";
            syncLyricsState();
        });
        document.body.appendChild(backBtn);
    }
    // Toggle ASCII logo visibility
    function toggleLogo(state) {
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
    function resetAllSettings() {
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

    const PREV_OPENERS = {
        lyrics: openLyricsPanel,
        help: openHelpPanel,
        about: openAboutPanel,
        playlist: openPlaylistPanel,
        theme: openThemePanel,
    };

    function detectDjMode() {
        return Boolean(document.querySelector(".XTtlZOmdtscvhPLr, .dj-button"));
    }

    function detectDjCover() {
        return Boolean(document.querySelector(`[src*="Your-DJ-Cover-Art-300.png"], [href*="Your-DJ-Cover-Art-300.png"], [srcset*="Your-DJ-Cover-Art-300.png"], [style*="Your-DJ-Cover-Art-300.png"]`));
    }

    function currentPane() {
        if (app.lyricsPanelOpen) return "lyrics";
        if (app.helpPanelOpen) return "help";
        if (app.aboutPanelOpen) return "about";
        if (app.playlistPanelOpen) return "playlist";
        if (app.themePanelOpen) return "theme";
        return null;
    }

    function showDjTag() {
        if (document.getElementById("spotui-dj-tags")) return;
        const wrap = document.createElement("div");
        wrap.id = "spotui-dj-tags";
        const tag = document.createElement("div");
        tag.className = "spotui-jam-tag";
        tag.textContent = "This client is being controlled by Spotify DJ";
        wrap.appendChild(tag);
        document.body.appendChild(wrap);
    }

    function hideDjTag() {
        const el = document.getElementById("spotui-dj-tags");
        if (el) el.remove();
    }

    function openDjPanel() {
        if (!app.djPanelOpen) {
            app.djPrevPane = currentPane();
            closeActivePanel();
            app.djPanelOpen = true;
            document.body.classList.add("spotui-dj-panel");
        }
        const root = document.getElementById("spotui-dj");
        if (root && root.hidden) {
            root.hidden = false;
            setTimeout(() => root.classList.add("spotui-dj-active"), 10);
        }
    }

    function closeDjPanel() {
        if (!app.djPanelOpen) return;
        app.djPanelOpen = false;
        const root = document.getElementById("spotui-dj");
        if (root) {
            root.classList.remove("spotui-dj-active");
            setTimeout(() => {
                if (!app.djPanelOpen) {
                    root.hidden = true;
                    document.body.classList.remove("spotui-dj-panel");
                }
            }, 500);
        } else {
            document.body.classList.remove("spotui-dj-panel");
        }
        const prev = app.djPrevPane;
        app.djPrevPane = null;
        const open = PREV_OPENERS[prev];
        if (open) open();
    }

    function syncDjState() {
        const mode = detectDjMode();
        if (mode !== app.djMode) {
            app.djMode = mode;
            document.body.classList.toggle("spotui-dj-mode", mode);
            if (mode) showDjTag();
            else hideDjTag();
        }
        const cover = detectDjCover();
        if (cover && !app.djPanelOpen) openDjPanel();
        else if (!cover && app.djPanelOpen) closeDjPanel();
    }

    function initDjBridge() {
        if (!document.body) {
            setTimeout(initDjBridge, 250);
            return;
        }
        syncDjState();
        if (!app.djObserver) {
            app.djObserver = new MutationObserver(syncDjState);
            app.djObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["class", "src", "href", "srcset", "style"],
            });
            window.addEventListener(
                "beforeunload",
                () => { app.djObserver?.disconnect(); },
                { once: true }
            );
        }
    }

    const style = `#spotui-tui {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 4.75rem;
    width: 100vw;
    background: #000;
    color: #ddd;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 15px;
    padding: 40px;
    box-sizing: border-box;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    user-select: text;
    cursor: text;
}

#spotui-logo {
    position: absolute;
    left: 50%;
    top: 41%;
    transform: translate(-50%, -50%);
    color: #ff8c42;
    opacity: 1;
    white-space: pre;
    text-align: center;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 28px;
    line-height: 1.0;
    pointer-events: none;
    user-select: none;
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: top 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

body.spotui-lyrics-panel #spotui-logo,
body.spotui-dj-panel #spotui-logo,
body.spotui-playlist-panel #spotui-logo,
body.spotui-help-panel #spotui-logo,
body.spotui-theme-panel #spotui-logo,
body.spotui-search-panel #spotui-logo,
body.spotui-about-panel #spotui-logo,
body.spotui-onboarding-panel #spotui-logo {
    top: 12px;
    transform: translate(-50%, 0) scale(0.6);
    opacity: 0.8;
    z-index: 2;
    background-color: transparent;
}

#spotui-onboarding-panel {
    display: none;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 18px;
    padding: 30px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin: 33vh 5vw 8px;
    height: 60vh;
    border: 1px solid var(--panel-border-color, rgba(255, 140, 66, 0.3));
    border-radius: 6px;
    background: var(--panel-bg-color, transparent);
}

body.spotui-onboarding-panel #spotui-onboarding-panel {
    display: flex;
}

.spotui-onboarding-stage {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 100%;
}

.spotui-onboarding-copy h2 {
    margin: 0 0 8px;
    color: #ff8c42;
    font-size: 28px;
    line-height: 1.1;
}

.spotui-onboarding-kicker {
    color: #b3b3b3;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.spotui-onboarding-copy p,
.spotui-onboarding-primer,
.spotui-onboarding-actions,
.spotui-onboarding-callout {
    color: #ddd;
}

.spotui-onboarding-copy code,
.spotui-onboarding-primer code,
.spotui-onboarding-callout code {
    color: #ff8c42;
    background: rgba(255, 140, 66, 0.12);
    border: 1px solid rgba(255, 140, 66, 0.22);
    border-radius: 4px;
    padding: 0 4px;
    font-family: "JetBrains Mono", monospace;
}

.spotui-onboarding-copy code {
    white-space: nowrap;
}

.spotui-onboarding-copy p code,
.spotui-onboarding-callout code {
    display: inline-block;
    line-height: 1.2;
}

.spotui-onboarding-primer {
    border: 1px solid rgba(255, 140, 66, 0.2);
    border-radius: 6px;
    padding: 16px;
    display: grid;
    gap: 8px;
}

.spotui-onboarding-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.spotui-onboarding-actions.centered {
    justify-content: center;
    margin-top: auto;
}

.spotui-onboarding-callout {
    margin-top: auto;
    align-self: flex-start;
    max-width: 280px;
    border: 1px solid rgba(255, 140, 66, 0.28);
    border-radius: 6px;
    padding: 12px 14px;
    background: rgba(0, 0, 0, 0.28);
}

.spotui-onboarding-callout .arrow {
    color: #ff8c42;
    font-size: 24px;
    line-height: 1;
    margin-bottom: 6px;
}

.spotui-onboarding-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    padding: 0;
}

.spotui-onboarding-theme {
    border: 1px solid rgba(255, 140, 66, 0.35);
    border-radius: 6px;
    background: rgba(0,0,0,0.35);
    color: #ddd;
    padding: 0;
    overflow: hidden;
    text-align: left;
    display: flex;
    flex-direction: column;
    cursor: pointer;
}

.spotui-onboarding-theme img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

.spotui-onboarding-theme span {
    padding: 10px 12px;
    font-family: "JetBrains Mono", monospace;
    color: #ff8c42;
}

body:has(#spotui-wallpaper) body.spotui-lyrics-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-dj-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-playlist-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-help-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-theme-panel #spotui-logo,
body:has(#spotui-wallpaper) body.spotui-about-panel #spotui-logo {
    background-color: #000;
}

#spotui-top-fade {
    display: block;
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 120px;
    background: linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0));
    pointer-events: none;
    z-index: 2;
}


.spotui-ascii-canvas {
    display: block;
    padding: 0;
    margin: 0;
    user-select: none;
    pointer-events: none;
    contain: layout style paint;
}

#spotui-output {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column-reverse;
    white-space: pre-wrap;
    line-height: 1.6;
    user-select: text;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    position: relative;
    z-index: 1;
    transition: opacity 260ms ease, transform 260ms ease;
}

body.spotui-command-mode #spotui-output,
body.spotui-playlist-panel #spotui-output,
body.spotui-help-panel #spotui-output,
body.spotui-about-panel #spotui-output,
body.spotui-theme-panel #spotui-output,
body.spotui-dj-panel #spotui-output,
body.spotui-lyrics-panel #spotui-output {
    display: none !important;
}

body.spotui-cli-mode #spotui-output {
    display: flex !important;
}

#spotui-output::-webkit-scrollbar,
#spotui-help-panel::-webkit-scrollbar,
#spotui-about-panel::-webkit-scrollbar,
#spotui-theme-panel::-webkit-scrollbar,
#spotui-playlist-list::-webkit-scrollbar,
#spotui-song-list::-webkit-scrollbar,
.spotui-lyrics-lines::-webkit-scrollbar {
    width: 0;
    height: 0;
}

#spotui-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
    margin-top: auto;
    border-top: 1px solid var(--input-border-color, rgba(255, 140, 66, 0.18));
    position: relative;
    z-index: 1;
    transition: opacity 260ms ease, transform 260ms ease;
}

#spotui-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--input-text-color, #ff8c42);
    font-family: inherit;
    font-size: inherit;
    flex: 1 1 auto;
    min-width: 0;
}

.prompt { color: var(--input-text-color, #ff8c42); }
.cl-line, .result { margin-bottom: 8px; user-select: text; }
.result { padding: 5px; }
.selected { background: #ff8c42; color: #000; }

body.spotui-lyrics-panel #spotui-logo,
body.spotui-dj-panel #spotui-logo {
    display: flex !important;
}

body.logo-off #spotui-logo {
    display: none !important;
}

body.logo-on.spotui-lyrics-panel #spotui-lyrics,
body.logo-on.spotui-dj-panel #spotui-dj {
    height: 80vh !important;
    margin-top: 15vh !important;
}

#spotui-lyrics {
    display: none;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
    position: relative;
    z-index: 1;
    margin: 0 0 8px;
    border: none;
    background: transparent;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.spotui-lyrics-panel #spotui-lyrics.spotui-lyrics-active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.6s;
}

#spotui-dj {
    display: none;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    margin: 0 0 8px;
    overflow: visible;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.spotui-dj-panel #spotui-dj.spotui-dj-active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.6s;
}

.spotui-dj-logo {
    width: min(42vw, 42vh);
    height: auto;
    overflow: visible;
    fill: none;
    stroke: var(--player-bar-border-color, var(--spotui-accent, #ff8c42));
    stroke-width: 0.45;
    stroke-linejoin: round;
    stroke-linecap: round;
    transform-origin: center;
    animation: spotui-dj-pulse 2.4s ease-in-out infinite;
}

@keyframes spotui-dj-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(0.78); }
}

body.spotui-dj-mode .XTtlZOmdtscvhPLr,
body.spotui-dj-mode .dj-button,
body.spotui-dj-mode .DHOpYzKPUqobiHLW {
    background: var(--player-bar-background, #000) !important;
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
}

body.spotui-dj-mode .XTtlZOmdtscvhPLr svg,
body.spotui-dj-mode .dj-button svg {
    color: var(--player-bar-text-color, var(--spotui-accent, #ff8c42)) !important;
    fill: var(--player-bar-text-color, var(--spotui-accent, #ff8c42)) !important;
}

.spotui-lyrics-header {
    flex: 0 0 auto;
    padding: 16px 22px 12px;
    border-bottom: 1px solid rgba(255, 140, 66, 0.18);
}

.spotui-lyrics-kicker {
    color: #ff8c42;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.spotui-lyrics-track {
    color: #ddd;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.spotui-lyrics-meta {
    margin-top: 4px;
    color: #b3b3b3;
    font-size: 12px;
    letter-spacing: 0.02em;
}

.spotui-lyrics-viewport {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

.spotui-lyrics-lines {
    height: 100%;
    overflow-y: auto;
    padding: 10vh 28px;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    text-align: center;
}

.spotui-lyrics-fade {
    pointer-events: none;
    position: absolute;
    left: 0; right: 0;
    height: 72px;
    z-index: 2;
}

    top: 0;
    background: linear-gradient(180deg, #000, transparent);
}

.spotui-lyrics-fade-bottom {
    bottom: 0;
    background: linear-gradient(0deg, #000, transparent);
}

.spotui-lyrics-line {
    color: var(--lyrics-color-inactive, #777);
    font-size: 17px;
    line-height: 1.45;
    padding: 10px 8px;
    opacity: 0.45;
    transform: scale(0.96);
    transition:
        color 220ms ease,
        opacity 220ms ease,
        transform 220ms ease,
        text-shadow 220ms ease;
}

.spotui-lyrics-line.near {
    color: var(--lyrics-color-light-inactive, #b3b3b3);
    opacity: 0.72;
    transform: scale(0.98);
}

.spotui-lyrics-line.active {
    color: var(--lyrics-color-active, #ff8c42);
    opacity: 1;
    transform: scale(1.06);
    font-weight: 600;
}

.spotui-lyrics-loader {
    height: 27px;
    aspect-ratio: 5;
    --c: var(--lyrics-color-inactive, #777) 90deg, #0000 0;
    background:
        conic-gradient(from 135deg at top, var(--c)),
        conic-gradient(from -45deg at bottom, var(--c)) 12.5% 100%;
    background-size: 20% 50%;
    background-repeat: repeat-x;
    -webkit-mask: repeating-linear-gradient(90deg, #000 0 15%, #0000 0 50%) 0 0/200%;
    mask: repeating-linear-gradient(90deg, #000 0 15%, #0000 0 50%) 0 0/200%;
    margin: 20px auto;
    opacity: 0.45;
    transform: scale(0.96);
    transition: opacity 220ms ease, transform 220ms ease;
}

body:not(.spotui-lyrics-animation-on) .spotui-lyrics-loader {
    display: none !important;
}

body.spotui-lyrics-animation-on .spotui-lyrics-loader {
    animation: spotui-loader-anim 0.8s infinite linear;
}

.spotui-lyrics-loader.active {
    --c: var(--lyrics-color-active, #ff8c42) 90deg, #0000 0;
    opacity: 1;
    transform: scale(1);
}

@keyframes spotui-loader-anim {
    to { 
        -webkit-mask-position: -100% 0;
        mask-position: -100% 0;
    }
}

#spotui-playlist-panel {
    display: none;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: row;
    position: relative;
    z-index: 1;
    margin: 33vh 5vw 8px;
    height: 60vh;
    border: none;
    background: transparent;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    gap: 10px;
}

body.spotui-playlist-panel #spotui-playlist-panel {
    display: flex;
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.6s;
}

#spotui-help-panel, #spotui-about-panel, #spotui-theme-panel {
    display: none;
    flex: 1 1 auto;
    flex-direction: column;
    padding: 30px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin: 33vh 5vw 8px;
    height: 60vh;
    border: 1px solid var(--panel-border-color, rgba(255, 140, 66, 0.3));
    border-radius: 6px;
    background: var(--panel-bg-color, transparent);
}

#spotui-help-panel {
    border: none;
    padding: 0;
    margin: 33vh 5vw 8px;
}

.spotui-help-fieldset {
    border: 1px solid var(--panel-border-color, rgba(255, 140, 66, 0.3));
    border-radius: 6px;
    padding: 30px;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    background: var(--panel-bg-color, transparent);
}

body.spotui-help-panel #spotui-help-panel,
body.spotui-about-panel #spotui-about-panel,
body.spotui-theme-panel #spotui-theme-panel {
    display: flex;
}

.spotui-help-legend {
    float: right;
    color: var(--panel-text-color, #ff8c42);
    padding: 0 5px;
}

.spotui-theme-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 0;
    height: 100%;
}

#spotui-theme-panel .spotui-lyrics-loader {
    display: block !important;
    animation: spotui-loader-anim 0.8s infinite linear;
}

.theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 12px;
}

.theme-card {
    border: 1px solid var(--panel-border-color, #ff8c42);
    border-radius: 4px;
    padding: 10px;
    background: rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.theme-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.2);
}

.theme-card img {
    width: 100%;
    height: auto;
    border-radius: 4px;
    object-fit: cover;
    aspect-ratio: 16/9;
}

.theme-card h3 {
    margin: 10px 0 10px;
    color: var(--panel-text-color, #ff8c42);
    font-weight: 600;
}

.theme-card button {
    background: var(--panel-text-color, #ff8c42);
    color: #000;
    border: none;
    padding: 8px 12px;
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 4px;
    margin-top: auto;
    width: 100%;
    transition: background-color 0.2s ease;
}

.theme-card button:hover {
    background-color: var(--panel-text-hover-color, #e07b39);
}
.help-item {
    padding: 4px 0;
    display: flex;
    justify-content: space-between;
}

.help-item .command {
    color: var(--panel-text-color, #ff8c42);
    flex-basis: 30%;
}

.help-item .description {
    flex-basis: 70%;
    color: #b3b3b3;
}

#spotui-playlist-list, #spotui-song-list {
    width: 50%;
    overflow-y: auto;
    scroll-behavior: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 10px;
    border: 1px solid var(--panel-border-color, #ff8c42);
    border-radius: 4px;
    background: var(--panel-bg-color, transparent);
}

#spotui-playlist-list legend, #spotui-song-list legend {
    color: var(--panel-text-color, #ff8c42);
    padding: 0 5px;
}

.playlist-item, .song-item {
    padding: 4px 6px;
    cursor: pointer;
}

.playlist-item, .song-item {
    height: 26px;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#spotui-playlist-list, #spotui-song-list {
    position: relative;
}

.playlist-item.selected, .song-item.selected {
    background: var(--panel-text-color, #ff8c42);
    color: #000;
}

.spotui-lyrics-lines.unsynced .spotui-lyrics-line {
    color: #b3b3b3;
    opacity: 0.9;
    transform: none;
    text-align: center;
}

.spotui-lyrics-empty {
    color: #b3b3b3;
    font-size: 3em;
    line-height: 1.6;
    padding: 18vh 24px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    opacity: 0.5;
}

.spotui-lyrics-empty strong {
    display: block;
    color: #ff8c42;
    font-size: 16px;
    margin-bottom: 8px;
    font-weight: 600;
}

.spotui-lyrics-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 18vh 24px;
}

.spotui-lyrics-lines.spotui-lyrics-exit-active {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
    transform: translateY(-40px);
    opacity: 0;
}

.spotui-lyrics-lines.spotui-lyrics-enter {
    transition: none;
    transform: translateY(40px);
    opacity: 0;
}

.spotui-lyrics-lines.spotui-lyrics-enter-active {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
    transform: translateY(0);
    opacity: 1;
}

.spotui-lyrics-fetch-loader {
    --color-1: var(--lyrics-color-active, #ff8c42);
    --size: 1px;
    width: calc(8 * var(--size));
    height: calc(40 * var(--size));
    border-radius: calc(4 * var(--size));
    display: block;
    position: relative;
    background: currentColor;
    color: var(--color-1);
    box-sizing: border-box;
    animation: spotui-fetch-loader-anim 0.3s 0.3s linear infinite alternate;
}
.spotui-lyrics-fetch-loader::after,
.spotui-lyrics-fetch-loader::before {
    content: '';
    width: calc(8 * var(--size));
    height: calc(40 * var(--size));
    border-radius: calc(4 * var(--size));
    background: currentColor;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: calc(20 * var(--size));
    box-sizing: border-box;
    animation: spotui-fetch-loader-anim 0.3s 0.45s linear infinite alternate;
}
.spotui-lyrics-fetch-loader::before {
    left: calc(-20 * var(--size));
    animation-delay: 0s;
}
@keyframes spotui-fetch-loader-anim {
    0% {
        height: calc(48 * var(--size));
    }
    100% {
        height: calc(4 * var(--size));
    }
}

#spotui-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-left: auto;
}

.spotui-control-btn {
    background: var(--input-bg-color, #ff8c42);
    color: var(--input-text-color, #000);
    border: none;
    padding: 6px 12px;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
}

.spotui-control-btn:hover {
    background: var(--input-bg-hover-color, #e07b39);
}

.spotui-standby-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 8px;
}

.spotui-standby-btn svg {
    display: block;
}

body.spotui-tui-hidden #spotui-tui {
			    display: none !important;
			}

			body:not(.spotui-tui-hidden) .main-topBar-container,
			body:not(.spotui-tui-hidden) header {
			    display: none !important;
			}

			body.spotui-bar-off #spotui-tui {
			    bottom: 0 !important;
			}

#spotui-update-banner {
    position: fixed;
    top: 70px;
    right: 20px;
    background: #000;
    color: #ddd;
    border: 1px solid #ff8c42;
    border-radius: 6px;
    padding: 20px;
    max-width: 360px;
    z-index: 10001;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    font-family: "JetBrains Mono", monospace;
}

.spotui-banner-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.spotui-banner-icon {
    width: 36px;
    height: 36px;
    object-fit: contain;
    border-radius: 4px;
}

#spotui-update-banner h3 {
    margin: 0;
    color: #ff8c42;
    font-size: 15px;
}

#spotui-update-banner p {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: #b3b3b3;
}

.spotui-update-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
}

#banner-join-btn {
    flex: 1;
    text-align: center;
    padding: 8px 16px;
    font-weight: 600;
}

.spotui-banner-secondary-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 6px;
}

.spotui-banner-link-btn {
    background: transparent;
    border: none;
    color: #888;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    cursor: pointer;
    padding: 2px 4px;
}

.spotui-banner-link-btn:hover {
    color: #ff8c42;
    text-decoration: underline;
}

#spotui-jam-tags,
#spotui-dj-tags {
    position: fixed;
    top: 70px;
    left: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 6px;
    pointer-events: none;
}

.spotui-jam-tag {
    background: rgba(0,0,0,0.85);
    border: 1px solid var(--spotui-accent, #ff8c42);
    color: var(--spotui-accent, #ff8c42);
    border-radius: 4px;
    padding: 4px 10px;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35);
}

#spotui-search-panel {
    display: none;
    flex: 1 1 auto;
    flex-direction: column;
    margin: 33vh 5vw 8px;
    height: 60vh;
    padding: 20px;
    box-sizing: border-box;
    border: 1px solid var(--panel-border-color, rgba(255, 140, 66, 0.3));
    border-radius: 6px;
    background: var(--panel-bg-color, transparent);
    overflow: hidden;
}

body.spotui-search-panel #spotui-search-panel {
    display: flex;
}

#spotui-search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    position: relative;
    padding: 8px 12px;
    border: 1px solid var(--panel-border-color, rgba(255, 140, 66, 0.3));
    border-radius: 4px;
    background: rgba(0,0,0,0.5);
}

#spotui-search-bar.focused {
    border-color: var(--spotui-accent, #ff8c42);
}

.spotui-search-prompt {
    color: var(--panel-text-color, #ff8c42);
}

#spotui-search-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--panel-text-color, #ff8c42);
    font-family: inherit;
    font-size: 15px;
    caret-color: var(--spotui-accent, #ff8c42);
}

#spotui-search-input::placeholder {
    color: #777;
}

#spotui-search-ghost {
    position: absolute;
    display: flex;
    align-items: center;
    pointer-events: none;
    overflow: hidden;
    white-space: nowrap;
    font-family: inherit;
    font-size: 15px;
    color: #777;
}

#spotui-search-results {
    flex: 1 1 auto;
    min-height: 0;
    margin-top: 12px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#spotui-search-results::-webkit-scrollbar {
    display: none;
}

.spotui-search-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 4px;
    color: #ddd;
    cursor: pointer;
}

.spotui-search-item.selected {
    background: var(--spotui-accent, #ff8c42);
    color: #000;
}

.spotui-search-type {
    flex: 0 0 auto;
    min-width: 70px;
    font-size: 11px;
    text-transform: uppercase;
    opacity: 0.7;
    color: var(--panel-text-color, #ff8c42);
}

.spotui-search-item.selected .spotui-search-type {
    color: #000;
    opacity: 1;
}

.spotui-search-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.spotui-search-empty {
    padding: 10px;
    color: #777;
}

#spotui-standby-overlay {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483647 !important;
    background: #000;
    overflow: hidden;
}

#spotui-standby-overlay iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    pointer-events: none;
}

#spotui-standby-catcher {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    outline: none;
    color: transparent;
    caret-color: transparent;
    opacity: 0;
}

body.spotui-standby #spotui-tui,
body.spotui-standby #spotui-controls,
body.spotui-standby #spotui-custom-bar,
body.spotui-standby #spotui-back-btn,
body.spotui-standby #spotui-update-banner,
body.spotui-standby #spotui-jam-tags,
body.spotui-standby #spotui-dj-tags,
body.spotui-standby #spotui-popup,
body.spotui-standby .Root__now-playing-bar {
    display: none !important;
}
`;
    // Inject theme CSS into document head
    function injectStyle() {
        const s = document.createElement("style");
        s.textContent = style;
        document.head.appendChild(s);
    }

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

    function initSync() {
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

    // Inject styles, set up event listeners, and restore saved state
    injectStyle();
    document.addEventListener("keydown", handleKeybindKeydown, true);
    setTimeout(createControlButtons, 500);
    setTimeout(initLyricsBridge, 1000);
    setTimeout(initDjBridge, 1000);
    setTimeout(initSync, 1000);

    // Apply stored logo visibility preference
    if (storageGet("spotui:logo-visible") === "off") {
        document.body.classList.add("logo-off");
    } else {
        document.body.classList.add("logo-on");
    }

    // Apply stored lyrics animation preference
    if (storageGet(LYRICS_ANIMATION_KEY) === "off") {
        document.body.classList.remove("spotui-lyrics-animation-on");
    } else {
        document.body.classList.add("spotui-lyrics-animation-on");
    }

    // Create terminal when Spicetify API is ready
    if (Spicetify?.Platform) createTerminal();
    else setTimeout(createTerminal, 1500);

    // Initialize update banner after first boot onboarding is complete
    if (!isFirstBoot()) {
        setTimeout(initUpdateBanner, 1600);
    }

    // Restore restart popup message across page reloads if present
    try {
        const restartMessage = sessionStorage.getItem("spotui:restart-popup");
        if (restartMessage) {
            showRestartPopup(restartMessage, false);
        }
    } catch (e) {}

    // Launch first-boot onboarding for new users
    setTimeout(() => { launchFirstBootIfNeeded().catch(() => {}); }, 2000);

    // Restore saved state: lyrics panel, wallpaper, colors, jam session
    try {
        if (storageGet(LYRICS_STORAGE_KEY) === "1") {
            waitForPlayerReadyThen(() => {
                if (storageGet(LYRICS_STORAGE_KEY) === "1") openLyricsPanel();
            });
        }
        if (storageGet(WP_URL_KEY)) {
            setTimeout(() => setWallpaper(storageGet(WP_URL_KEY), storageGet(WP_OPACITY_KEY) || "1", false), 1500);
        }
        applyLyricColors();
        applyPlayerBarColors();
        applyPlayerBarVisibility();
        applyCustomBarState();
        applyProgressBarColors();
        applyInputColors();
        applyInputButtonsVisibility();
        applyPanelColors();
        resumeJamFromStorage();
    } catch { }

})();
