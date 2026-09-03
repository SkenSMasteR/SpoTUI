import { initAsciiAnimation } from "./ascii.js";
import { execute } from "./commands.js";
import { app } from "./state.js";

export function setTuiMode(mode) {
    app.tuiMode = mode === "cli" ? "cli" : "command";
    document.body.classList.toggle("spotui-cli-mode", app.tuiMode === "cli");
    document.body.classList.toggle("spotui-command-mode", app.tuiMode !== "cli");
}
// Create main terminal interface
export function createTerminal() {
    const box = document.createElement("div");
    box.id = "spotui-tui";
    setTuiMode("command");
    box.innerHTML = `
<div id="spotui-logo"></div>
<div id="spotui-top-fade"></div>
<div id="spotui-lyrics" hidden>
<div class="spotui-lyrics-viewport">
<div class="spotui-lyrics-lines"></div>
<div class="spotui-lyrics-fade spotui-lyrics-fade-bottom"></div>
</div>
</div>
<div id="spotui-playlist-panel" hidden>
    <fieldset id="spotui-playlist-list">
        <legend>Playlists</legend>
    </fieldset>
    <fieldset id="spotui-song-list">
        <legend>Songs</legend>
    </fieldset>
</div>
<div id="spotui-help-panel" hidden></div>
<div id="spotui-about-panel" hidden></div>
<div id="spotui-theme-panel" hidden></div>
<div id="spotui-onboarding-panel" hidden></div>
<div id="spotui-footer">
<span class="prompt">></span>
<input id="spotui-input" autofocus placeholder="type help for a list of commands">
</div>
`;
    document.body.appendChild(box);
    initAsciiAnimation();

    const input = document.getElementById("spotui-input");
    input.addEventListener("keydown", async (e) => {
        if (app.playlistPanelOpen || app.themePanelOpen || app.helpPanelOpen || app.aboutPanelOpen) {
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
            print("> " + cmd);
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
export function print(text) {}

export function renderResults() {
    const output = document.getElementById("spotui-output");
    output.textContent = "";
    app.results.forEach((item, idx) => {
        const line = document.createElement("div");
        line.className = "result" + (idx === app.selected ? " selected" : "");
        line.textContent = `${idx + 1}. ${item.name}${item.artist ? " - " + item.artist : ""}`;
        output.appendChild(line);
    });
}
