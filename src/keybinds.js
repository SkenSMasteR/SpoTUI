import { execute } from "./commands.js";
import { BIND_CMD_REGEX, F_KEY_REGEX, KEYBIND_STORAGE_KEY } from "./constants.js";
import { storageGet, storageSet } from "./storage.js";

// Retrieve stored keyboard shortcuts
export function getKeybinds() {
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

export function saveKeybinds(map) {
    storageSet(KEYBIND_STORAGE_KEY, JSON.stringify(map));
}

// Remove leading slash or dot from command strings
export function stripCommandPrefix(cmd) {
    const raw = String(cmd || "").trim();
    return raw.startsWith("/") || raw.startsWith(".") ? raw.slice(1).trim() : raw;
}

// Check if command is a keybind configuration command
export function isBindCommand(cmd) {
    return BIND_CMD_REGEX.test(stripCommandPrefix(cmd));
}

// Normalize keyboard shortcuts to canonical format
export function normalizeKeyCombo(comboStr) {
    const parts = String(comboStr).split("+").map((p) => p.trim()).filter(Boolean);
    const mods = [];
    let mainKey = "";
    parts.forEach((p) => {
        const lower = p.toLowerCase();
        if (lower === "ctrl" || lower === "control") mods.push("Ctrl");
        else if (lower === "alt") mods.push("Alt");
        else if (lower === "shift") mods.push("Shift");
        else if (lower === "meta" || lower === "cmd" || lower === "command" || lower === "win") mods.push("Meta");
        else mainKey = p;
    });
    if (!mainKey) return "";
    let keyName;
    if (mainKey.length === 1) {
        keyName = mainKey.toUpperCase();
    } else {
        // Map common key name variations to standard names
        const specialMap = {
            esc: "Escape", escape: "Escape",
            enter: "Enter", return: "Enter",
            space: " ", spacebar: " ",
            up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight",
            tab: "Tab", backspace: "Backspace", delete: "Delete", del: "Delete",
            home: "Home", end: "End", pageup: "PageUp", pagedown: "PageDown",
            insert: "Insert",
        };
        const lower = mainKey.toLowerCase();
        if (specialMap[lower]) keyName = specialMap[lower];
        else if (F_KEY_REGEX.test(mainKey)) keyName = mainKey.toUpperCase();
        else keyName = mainKey;
    }
    const order = { Ctrl: 0, Alt: 1, Shift: 2, Meta: 3 };
    mods.sort((a, b) => order[a] - order[b]);
    return [...mods, keyName].join("+");
}

export function eventToKeyCombo(e) {
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
export function handleKeybindKeydown(e) {
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
