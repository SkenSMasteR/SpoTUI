import { DISCORD_INVITE_URL, UPDATE_BANNER_KEY } from "./constants.js";
import { storageGet, storageSet } from "./storage.js";

// Display restart notification popup
// persistSession - to survive the reload after all settings get reset
export function showRestartPopup(message = "Wait 5 seconds and relaunch Spotify", persistSession = false) {
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
export function initUpdateBanner() {
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
