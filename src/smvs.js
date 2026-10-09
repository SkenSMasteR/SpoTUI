// these are hidden when spotui pane is on and shown when its off.
const SPOTUI_HIDDEN_UI = [
    "Root__main-view",
    "main-view-container",
    "Root__nav-bar",
    "bQsutxbyIOatthweRHfK",
    "main-topBar-container",
    "main-yourLibraryX-libraryRootlist",
    "main-yourLibraryX-entryPoints",
    "WWTxshVPO07BZLrdUL3h",
    "YourLibraryX",
    "main-buddy-list",
    "main-trackList-trackList",
    "main-card-card",
    "main-gridContainer-gridContainer",
    "main-entityHeader-container",
    "Zh3rQRncNEHrT9Zvp61n",
    "xg2bGi5tcuelbx14UC28",
    "Clgyk1V8iQGkU1G6m5Lo",
    "zLbWoHarv2xIIoERVTb9",
    "uf2x5WzM1lLLCLSQdMFB",
    "VcWsGHoYggFHIgkGBb63",
    "YQpukOWit96yddbc2JnI",
];

const HIDDEN_UI_MARKER = "spotui-hidden-ui";

const CLASS_MAP = {
    "ABsPxBFldURR4hbFY38Y": [], // device-picker control
    "dj-button": ["uddqO1SkevkDEtqc7mQP", "FrqTR9ccUqvGA9UZRf9H"],
    "centered-layout": [],
    "collection-collection-header": [],
    "collection-searchBar-searchBar": [],
    "DHOpYzKPUqobiHLW": ["uddqO1SkevkDEtqc7mQP"], // DJ button
    "e-10451-box--interactive": [],
    "e-10860-card-title": [],
    "encore-announcement-set": [],
    "encore-bright-accent-set": [], 
    "global-nav": [],
    "HqUgEQOPyVcDu2NW": [], // (styled with the same hover colors as tracklist rows)
    "lyrics-config-button": [],
    "lyrics-config-button-container": [],
    "lyrics-lyrics-background": [],
    "lyrics-lyrics-container": [],
    "lyrics-lyrics-contentContainer": [],
    "lyrics-lyrics-contentWrapper": [],
    "lyrics-lyricsContainer-Karaoke-WordActive": [],
    "lyrics-lyricsContainer-LyricsBackground": [],
    "lyrics-lyricsContainer-LyricsContainer": [],
    "lyrics-lyricsContainer-LyricsLine": [],
    "lyrics-lyricsContainer-LyricsLine-active": [],
    "lyrics-lyricsContainer-LyricsLine-past": [],
    "lyrics-lyricsContainer-Provider": [],
    "lyrics-lyricsContent-active": [],
    "lyrics-lyricsContent-lyric": [],
    "lyrics-lyricsContent-previous": [],
    "lyrics-lyricsContent-provider": [],
    "lyrics-lyricsContent-text": [],
    "lyrics-lyricsContent-upcoming": [],
    "main-actionBarBackground-background": [],
    "main-card-cardMetadata": [],
    "main-cardHeader-link": [],
    "main-cardHeader-text": [],
    "main-cardImage-image": [],
    "main-cardImage-imageWrapper": [],
    "main-connectBar-connectBar": [],
    "main-devicePicker-button": [],
    "main-devicePicker-controlButton": [],
    "main-devicePicker-moreButton": [],
    "main-devicePicker-tooltip": [],
    "main-entityHeader-background": [],
    "main-entityHeader-overlay": [],
    "main-globalNav-browseButtonWrapper": [],
    "main-globalNav-contentRight": ["J69QIsElFMg5kJWeEOxw"],
    "main-globalNav-historyButtons": ["ie2Qo9PCf8p3rBbip9Hv"],
    "main-globalNav-historyButtonsWrapper": ["AwxHJjdqrlr_clQipYln"],
    "main-globalNav-navLink": ["oGrojYscaY3uU8Hy86FD", "T_cPbNTFfdOMoMku2Wc_"],
    "main-globalNav-searchInputContainer": [],
    "main-globalNav-searchInputText": [],
    "main-globalNav-searchInputWrapper": [],
    "main-home-content": [],
    "main-home-home": [],
    "main-home-homeHeader": [],
    "main-lyricsCinema-container": [],
    "main-lyricsCinema-content": [],
    "main-nowPlayingBar-center": ["rSRNVahRTJPSREItfKbj"],
    "main-nowPlayingBar-container": ["main-nowPlayingBar-nowPlayingBar", "cW4mdx7MbdsSDVOh4yFl"],
    "main-nowPlayingBar-extraControls": ["oqNKUl1wM7vavZeQ2s1V"],
    "main-nowPlayingBar-left": ["hvPltcX1Of4QRX6ymIPO"],
    "main-nowPlayingBar-lyricsButton": ["Tc4NZwap8qQOlHonxDWz", "OCDVdnseqXwal5Tk2fM8"],
    "main-nowPlayingBar-nowPlayingBar": ["cW4mdx7MbdsSDVOh4yFl"],
    "main-nowPlayingBar-right": ["P7V7BLPw5oupbrDHSbT_"],
    "main-nowPlayingView-lyricsContent": [],
    "main-nowPlayingView-lyricsControls": [],
    "main-nowPlayingView-lyricsGradient": [],
    "main-nowPlayingView-lyricsTitle": [],
    "main-nowPlayingView-section": ["oA2xvck_WSZn6mRFcZ2J","RdD6POf8qaaGutBtUyMh"],
    "main-shelf-shelfGrid": [],
    "main-topBar-background": [],
    "main-topBar-overlay": [],
    "main-topBar-searchBar": [],
    "main-topBar-withBackgroundBlur": [],
    "main-trackInfo-artists": ["iQ71jAm3u73Al0XZj90v", "yPuQIWyOhCzYrdC7hhfw"],
    "main-trackInfo-container": ["main-nowPlayingWidget-nowPlaying", "XQslIrb_llPUT81TqFnT"],
    "main-trackInfo-contentContainer": ["_HN_yndimvPzsIkzzSvo", "nuY09VyDMngWeD4AGX2H"],
    "main-trackInfo-contentWrapper": ["_HN_yndimvPzsIkzzSvo", "nuY09VyDMngWeD4AGX2H"],
    "main-trackInfo-name": ["iSkZ_HES6ks1CnyZfh46", "UxJZcpiOpOv5I0B1Tjdw"],
    "main-trackList-trackListRow": [],
    "main-view-container__scroll-node": [],
    "main-yourLibraryX-libraryContainer": [],
    "main-yourLibraryX-listItem": [],
    "marketplace-card--app": [],
    "marketplace-card--extension": [],
    "marketplace-card--snippet": [],
    "marketplace-card--theme": [],
    "marketplace-card-desc": [],
    "marketplace-card-type-heading": [],
    "marketplace-cardSubHeader": [],
    "marketplace-card__author": [],
    "marketplace-card__authors": [],
    "marketplace-card__bottom-meta": [],
    "marketplace-card__tag": [],
    "marketplace-card__tags-container": [],
    "marketplace-footer": [],
    "marketplace-grid": [],
    "marketplace-header": [],
    "marketplace-header-icon-button": [],
    "marketplace-header__label": [],
    "marketplace-installButton": [],
    "marketplace-tabBar-active": [],
    "marketplace-tabBar-headerItemLink": [],
    "MZd_PqzVQOdrbpd6ircZ": [], // device-picker control (hidden)
    "n6LsTkKvpO88xeRyRTdw": [], // page header (styled like the queue page header)
    "nav-ylx": [],
    "notistack-CollapseWrapper": [],
    "notistack-Snackbar": [],
    "notistack-SnackbarContainer": [],
    "os-viewport": [],
    "playlist-playlist-playlistContent": [],
    "progress-bar": ["Nd6cUzZDlHX30QzhnExg"],
    "queue-queuePage-header": [],
    "Root": [],
    "Root__now-playing-bar": ["z0qdvwslOFVOAihShLIq", "L5dM7nzQpMJtRkvZZBZL"], // If the play/pause button clips out of the playbar, this mapping needs to be updated
    "Root__top-container": [],
    "search-modal-searchBar": [],
    "searchbar-bar": [],
    "uFQUpbITgGovaKRr6I_g": [], // page header
    "volume-bar": ["main-nowPlayingBar-volumeBar", "VIXZppPJeWhMxFseNCgy"],
    "volume-bar__icon-button": ["vM_Y7OPWespPewrOb1uN", "w1XCHDijYLIJuVCEkQID"],
    "volume-bar__slider-container": ["d2AW7kxQkljoKbqyHvHC", "GN9SlMTfgQeqy7opGRSA"],
    "x-progressBar-fillColor": ["aZtKYi6r4EG1_WHGpmn9"],
    "x-progressBar-handle": ["pKZTLhZq37S3mH2TFw4X", "GQiIgNkmZw4cDZnpvnGN"],
    "x-progressBar-progressBar": ["progress-bar", "Nd6cUzZDlHX30QzhnExg"],
    "x-progressBar-progressBarBg": ["SKxg0dANYkUKs2sk0q6e"],
    "x-progressBar-progressFillColor": [],
    "x-progressBar-sliderArea": ["PLraRYLMXymk2zPhyNnL"],
    "x-searchInput-searchInputClearButton": [],
    "x-searchInput-searchInputClearIcon": [],
    "x-searchInput-searchInputInput": [],
    "x-searchInput-searchInputSearchIcon": [],
    "x-settings-header": [],
    "x-settings-headerContainer": [],
    "XTtlZOmdtscvhPLr": [], // DJ button
    "YourLibraryX": [],
};

const HIDDEN_UI_SET = new Set(SPOTUI_HIDDEN_UI);

function injectHiddenUiCss() {
    if (document.getElementById("spotui-hidden-ui-style")) return;
    const style = document.createElement("style");
    style.id = "spotui-hidden-ui-style";
    style.textContent = `body:not(.spotui-spotify-enabled) .${HIDDEN_UI_MARKER} { display: none !important; }`;
    (document.head || document.documentElement).appendChild(style);
}

function tagElement(el, aliases) {
    const names = el.getAttribute("class");
    if (!names) return;
    const tokens = names.split(/\s+/);
    let add;
    for (const token of tokens) {
        const canonical = aliases.get(token);
        if (!canonical) continue;
        for (const name of canonical) {
            if (name === token || el.classList.contains(name)) continue;
            (add || (add = [])).push(name);
        }
    }
    if (add) el.classList.add(...add);
    if (!el.classList.contains(HIDDEN_UI_MARKER)) {
        for (const token of tokens) {
            if (HIDDEN_UI_SET.has(token)) {
                el.classList.add(HIDDEN_UI_MARKER);
                break;
            }
        }
    }
}

function scanTree(root, aliases) {
    if (root.hasAttribute && root.hasAttribute("class")) tagElement(root, aliases);
    for (const el of root.querySelectorAll("[class]")) tagElement(el, aliases);
}

export function initClassMap() {
    const aliases = new Map();
    for (const [canonical, names] of Object.entries(CLASS_MAP)) {
        for (const name of names) {
            if (aliases.has(name)) aliases.get(name).push(canonical);
            else aliases.set(name, [canonical]);
        }
    }

    const start = () => {
        injectHiddenUiCss();
        scanTree(document.body, aliases);
        new MutationObserver((records) => {
            for (const record of records) {
                if (record.type === "attributes") tagElement(record.target, aliases);
                else
                    for (const node of record.addedNodes)
                        if (node.nodeType === 1) scanTree(node, aliases);
            }
        }).observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    };

    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start, { once: true });
}
