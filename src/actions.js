import { execute } from "./commands.js";
import { ACTIONS_STORAGE_KEY } from "./constants.js";
import { jamSay } from "./jam.js";
import { storageGet, storageSet } from "./storage.js";

const PANE_CLOSE_EVENT = "pane_close";
const RESERVED_NAMES = new Set(["create", "list", "enable", "disable", "delete"]);
const LISTENER_RE = /^actions:spotui@([a-z_]+)(?:>(!?)([a-z0-9_-]+))?$/i;

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

export function getActions() {
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

export function saveActions(map) {
    storageSet(ACTIONS_STORAGE_KEY, JSON.stringify(map));
}

function validName(name) {
    return typeof name === "string" && /^[A-Za-z0-9_-]+$/.test(name) && !RESERVED_NAMES.has(name.toLowerCase());
}

function parseListener(listener) {
    const m = String(listener || "").trim().match(LISTENER_RE);
    if (!m) return null;
    const target = (m[3] || "").toLowerCase();
    if (target === "onboarding") return null;
    return { event: m[1].toLowerCase(), exclude: m[2] === "!", target };
}

function listenerMatches(listener, event, target) {
    const parsed = parseListener(listener);
    if (!parsed) return false;
    if (parsed.event !== event) return false;
    if (!parsed.target) return true;
    const closed = String(target || "").toLowerCase();
    if (parsed.exclude) return closed !== parsed.target;
    return closed === parsed.target;
}

function paneTarget(target) {
    return String(target || "").toLowerCase();
}

export function emitPaneClose(target) {
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

export function handleActionsCommand(cleanedCmd) {
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
        if (!parsed || parsed.event !== PANE_CLOSE_EVENT) {
            jamSay("Unknown listener");
            return;
        }
        if (!String(command || "").trim()) {
            jamSay("Missing command");
            return;
        }
        const actions = getActions();
        const prev = actions[name] || { enabled: true, listener: "", command: "" };
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
