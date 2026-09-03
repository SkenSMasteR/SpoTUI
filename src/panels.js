import { resetAllSettings } from "./appearance.js";
import { execute } from "./commands.js";
import { ADD_THEME_IMG_ERR, ADD_THEME_IMG_OK, COMMAND_LIST } from "./constants.js";
import { isBindCommand } from "./keybinds.js";
import { closeLyricsPanel } from "./lyrics.js";
import { closeOnboardingPanel } from "./onboarding.js";
import { getPlaylists, handlePlaylistPanelKeydown, renderPlaylistPanel } from "./playlists.js";
import { app } from "./state.js";
import { print } from "./terminal.js";
import { createAddThemeCard, createThemeCard, loadThemeFeed } from "./themes.js";

// Global Escape key handler - closes active panels
export function handleGlobalEsc(e) {
    if (e.key !== "Escape") return;
    if (app.onboardingPanelOpen) {
        e.preventDefault();
        return;
    }
    e.preventDefault();
    closeActivePanel();
}

// Close all open panels
export function closeActivePanel() {
    if (app.helpPanelOpen) setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", false);
    if (app.aboutPanelOpen) setPanelState("spotui-about-panel", "spotui-about-panel", "aboutPanelOpen", false);
    if (app.lyricsPanelOpen) closeLyricsPanel();
    if (app.playlistPanelOpen) closePlaylistPanel();
    if (app.themePanelOpen) closeThemePanel();
    if (app.onboardingPanelOpen) closeOnboardingPanel();
}

// Generic panel state manager
export function setPanelState(panelId, className, openVarName, targetState) {
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
}

// Open or toggle help panel
export function openHelpPanel() {
    if (app.helpPanelOpen) { setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", false); return; }
    closeActivePanel();

    setPanelState("spotui-help-panel", "spotui-help-panel", "helpPanelOpen", true);
    const panel = document.getElementById("spotui-help-panel");
    if (panel) {
        panel.innerHTML = COMMAND_LIST.map(
            item => `<div class="help-item"><span class="command">${item.cmd}</span><span class="description">${item.desc}</span></div>`
        ).join('');
    }
}

// Open or toggle about panel
export function openAboutPanel() {
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

export function closePlaylistPanel() {
    app.playlistPanelOpen = false;
    document.body.classList.remove("spotui-playlist-panel");
    const panel = document.getElementById("spotui-playlist-panel");
    if (panel) panel.hidden = true;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
    document.removeEventListener("keydown", handlePlaylistPanelKeydown);
}

// Open playlist panel and load users playlists
export async function openPlaylistPanel() {
    if (app.playlistPanelOpen) { closePlaylistPanel(); return; }
    closeActivePanel();

    try {
        app.playlists = await getPlaylists();
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

export function closeThemePanel() {
    setPanelState("spotui-theme-panel", "spotui-theme-panel", "themePanelOpen", false);
}

// Open theme browser panel (with search and theme cards)
export async function openThemePanel() {
    if (app.themePanelOpen) { closeThemePanel(); return; }
    closeActivePanel();

    setPanelState("spotui-theme-panel", "spotui-theme-panel", "themePanelOpen", true);
    const panel = document.getElementById("spotui-theme-panel");
    if (!panel) return;

    panel.innerHTML = "<p>Loading themes...</p>";

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
                    commands.forEach(cmd => { if (!isBindCommand(cmd)) execute(cmd); });
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
