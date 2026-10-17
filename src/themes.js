import { resetAllSettings } from "./appearance.js";
import { execute } from "./commands.js";
import { FIRST_BOOT_THEME_IDS, THEME_CHANNELS, THEME_HOST } from "./constants.js";
import { isRestrictedThemeCommand } from "./keybinds.js";
import { app } from "./state.js";

// Singleton promise for theme feed

// Load theme catalog from remote server
export function loadThemeFeed(onLoad, onError) {
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

const channelCache = {};
const channelInflight = {};

export function loadThemeChannel(channel, force = false) {
    const key = THEME_CHANNELS[channel] ? channel : "live";
    if (!force && channelCache[key]) return Promise.resolve(channelCache[key].slice());
    if (!force && channelInflight[key]) return channelInflight[key];
    const src = `${THEME_CHANNELS[key]}?_=${Math.floor(Date.now() / 1000)}`;
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            try {
                const themes = (window.spotuiThemes || []).slice();
                if (themes.length) {
                    channelCache[key] = themes;
                    resolve(themes.slice());
                } else {
                    reject(new Error("Theme feed loaded but empty"));
                }
            } finally {
                script.remove();
                delete channelInflight[key];
            }
        };
        script.onerror = () => {
            try {
                reject(new Error("Failed to load themes"));
            } finally {
                script.remove();
                delete channelInflight[key];
            }
        };
        document.body.appendChild(script);
    });
    channelInflight[key] = promise;
    return promise;
}

export function createAddThemeCard(imgUrl) {
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

export function createThemeCard(theme) {
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
export function applyThemeByName(themeName, opts = {}) {
    const skipNonTui = Boolean(opts.skipNonTui);
    const apply = async (themes) => {
        resetAllSettings();
        const theme = (themes || []).find((t) => t.name === themeName);
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
        return theme || null;
    };
    if (opts.channel) {
        return loadThemeChannel(opts.channel).then((themes) => apply(themes));
    }
    return new Promise((resolve, reject) => {
        loadThemeFeed(
            async () => {
                try {
                    resolve(await apply(window.spotuiThemes || []));
                } catch (err) {
                    reject(err);
                }
            },
            () => reject(new Error("Failed to load themes"))
        );
    });
}

// Encode theme name for theme ID generation
export function encodeThemeName(name) {
    try {
        return btoa(unescape(encodeURIComponent(String(name || ""))));
    } catch (e) {
        return "";
    }
}

export function getThemeSelectionList(themes, showAll = false) {
    if (showAll) return themes;

    const curated = themes.filter((theme) => {
        const themeId = String(theme?.id || "");
        const encodedName = encodeThemeName(theme?.name);
        return FIRST_BOOT_THEME_IDS.has(themeId) || FIRST_BOOT_THEME_IDS.has(encodedName);
    });

    if (curated.length) return curated;
    return themes.slice(0, 3);
}
