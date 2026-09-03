import { WP_OPACITY_KEY, WP_URL_KEY } from "./constants.js";
import { storageSet } from "./storage.js";

// Check if URL points to video file
export function isVideoWallpaperUrl(url) {
    try {
        const clean = String(url).split("?")[0].split("#")[0];
        return /\.(mp4|webm)$/i.test(clean);
    } catch (e) {
        return false;
    }
}

// Set background wallpaper (image or video)
export function setWallpaper(url, opacity, save = true) {
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
