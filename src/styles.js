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

#spotui-visualizer {
    display: none;
    flex: 1 1 auto;
    min-height: 0;
    position: relative;
    z-index: 0;
    margin: 0 0 8px;
    overflow: hidden;
    background: var(--visualizer-bg-color, transparent);
    align-items: center;
}

body.spotui-visualizer-panel #spotui-visualizer {
    display: flex;
}

#spotui-visualizer-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

#spotui-visualizer-status {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: var(--visualizer-bar-color, #ff8c42);
    opacity: 0.8;
    pointer-events: none;
    white-space: nowrap;
}

body.spotui-visualizer-ready #spotui-visualizer-status {
    display: none;
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
export function injectStyle() {
    const s = document.createElement("style");
    s.textContent = style;
    document.head.appendChild(s);
}
