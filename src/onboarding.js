import { initUpdateBanner } from "./banner.js";
import { LAUNCHED_KEY } from "./constants.js";
import { closeActivePanel, handleGlobalEsc } from "./panels.js";
import { app } from "./state.js";
import { storageGet, storageSet } from "./storage.js";
import { applyThemeByName, getThemeSelectionList, loadThemeFeed } from "./themes.js";

// Mark that the user has launched SpoTUI at least once
export function markLaunched() {
    storageSet(LAUNCHED_KEY, "1");
}

// Check if this is the users first time using SpoTUI
export function isFirstBoot() {
    return storageGet(LAUNCHED_KEY) !== "1";
}

export function closeOnboardingPanel() {
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
export function openOnboardingPanel() {
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
export function onboardingThemeCard(theme) {
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
export function renderOnboardingStage(panel) {
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

export function renderOnboardingFeedError(panel) {
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
export function applyOnboardingTheme(themeName) {
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

export function renderOnboardingPanel() {
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
export async function launchFirstBootIfNeeded() {
    if (!isFirstBoot()) return;
    openOnboardingPanel();
    app.onboardingStage = "commands";
    app.onboardingShowAllThemes = false;
    renderOnboardingPanel();
}
// Return set of allowed commands during onboarding stages
// Restricts the user to safe commands until onboarding is complete
export function getAllowedOnboardingCommands() {
    if (!app.onboardingPanelOpen) return null;
    if (app.onboardingStage === "done") return new Set(["p", "v", "loop", "list", "playlist"]);
    return new Set(["p", "v", "loop"]);
}
