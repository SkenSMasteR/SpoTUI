import { applyCustomBarState, applyInputButtonsVisibility, applyInputColors, applyLyricColors, applyPanelColors, applyPlayerBarColors, applyPlayerBarVisibility, applyProgressBarColors, handleColorArgs, toggleLogo, updateCustomBar } from "./appearance.js";
import { resetGrid } from "./ascii.js";
import { initUpdateBanner, showRestartPopup } from "./banner.js";
import { ANIMATION_KEY, CUSTOM_BAR_ENABLED, CUSTOM_BAR_PROGRESS_STYLE, INPUT_BG, INPUT_BG_HOVER, INPUT_BORDER, INPUT_BUTTONS, INPUT_TEXT, KEYBIND_STORAGE_KEY, LAUNCHED_KEY, LYRICS_ANIMATION_KEY, LYRICS_COLOR_ACTIVE, LYRICS_COLOR_INACTIVE, LYRICS_COLOR_LIGHT_INACTIVE, PANEL_BG, PANEL_BORDER, PANEL_TEXT, PLAYER_BAR_BG, PLAYER_BAR_BORDER, PLAYER_BAR_TEXT, PLAYER_BAR_VISIBLE, PROGRESS_BAR_BG, PROGRESS_BAR_FG, PROGRESS_STYLES, UPDATE_BANNER_KEY, WP_OPACITY_KEY, WP_URL_KEY } from "./constants.js";
import { getAllowedJamGuestCommands, jamCreate, jamJoin, jamLeave, jamSay } from "./jam.js";
import { getKeybinds, saveKeybinds, stripCommandPrefix } from "./keybinds.js";
import { handleLyricsCommand, syncLyricsHighlight, syncLyricsState } from "./lyrics.js";
import { getAllowedOnboardingCommands } from "./onboarding.js";
import { openAboutPanel, openHelpPanel, openPlaylistPanel, openThemePanel } from "./panels.js";
import { app } from "./state.js";
import { storageClear, storageGet, storageRemove, storageSet } from "./storage.js";
import { applyThemeByName } from "./themes.js";
import { setWallpaper } from "./wallpaper.js";

export async function execute(cmd, opts = {}) {
    const cleanedCmd = stripCommandPrefix(cmd);
    const [rawCommand, ...args] = cleanedCmd.split(/\s+/);
    const command = (rawCommand || "").toLowerCase();
    const argText = args.join(" ").trim();
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
            storageClear();
            if (!fullRestore) {
                if (launchedValue !== null) storageSet(LAUNCHED_KEY, launchedValue);
                if (bannerValue !== null) storageSet(UPDATE_BANNER_KEY, bannerValue);
                if (keybindsValue !== null) storageSet(KEYBIND_STORAGE_KEY, keybindsValue);
            }
            showRestartPopup("Wait 5 seconds and relaunch Spotify", true);
            setTimeout(() => location.reload(), 100);
            return;
        }
        return;
    }

    if (command === "help") { openHelpPanel(); return; }
    if (command === "about") { openAboutPanel(); return; }
    if (command === "playlist" || command === "list") { openPlaylistPanel(); return; }
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
        document.body.classList.add("spotui-search-mode", "spotui-tui-hidden");
        syncLyricsState();
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

    if (command === "jam") {
        const sub = (args[0] || "").toLowerCase();
        if (sub === "create") { await jamCreate(); return; }
        if (sub === "join") { await jamJoin(args[1]); return; }
        if (sub === "leave") { await jamLeave(); return; }
        jamSay("Usage: jam create | jam join <pin> | jam leave");
        return;
    }
}
export function handleRepeatCommand(kind, arg) {
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
