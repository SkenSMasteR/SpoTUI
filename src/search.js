import { emitPaneClose } from "./actions.js";
import { app } from "./state.js";

const SEARCH_DEBOUNCE_MS = 250;

function resolveName(data) {
    const candidates = [
        data.profile?.name,
        data.name,
        data.title,
        data.text,
        data.displayName,
        data.identity?.name,
        data.owner?.name,
    ];
    return candidates.find((value) => typeof value === "string" && value.trim()) || "";
}

function toResult(entry) {
    const data = entry?.item?.data ?? entry?.data ?? entry;
    if (!data || !data.uri) return null;
    const name = resolveName(data);
    if (!name) return null;
    return {
        type: data.__typename ?? entry?.item?.__typename ?? "",
        name,
        uri: data.uri,
        raw: data,
    };
}

function extractResults(searchV2) {
    const results = [];
    const seen = new Set();
    Object.values(searchV2 || {}).forEach((section) => {
        const list = section?.itemsV2 || section?.items;
        if (!Array.isArray(list)) return;
        list.forEach((entry) => {
            const item = toResult(entry);
            if (!item || seen.has(item.uri)) return;
            seen.add(item.uri);
            results.push(item);
        });
    });
    return results;
}

async function searchSpotify(query, limit = 20) {
    const definitions = Spicetify.GraphQL?.Definitions ?? {};
    const attempts = [];
    if (definitions.searchSuggestions) {
        attempts.push([
            definitions.searchSuggestions,
            {
                query: query,
                offset: 0,
                limit: limit,
                numberOfTopResults: limit,
                includeAuthors: true,
                includeAlbumPreReleases: true,
                includeEpisodeContentRatingsV2: true,
            },
        ]);
    }
    if (definitions.searchModalResults) {
        attempts.push([
            definitions.searchModalResults,
            {
                searchTerm: query,
                offset: 0,
                limit: limit,
                numberOfTopResults: limit,
                includeAudiobooks: true,
                includeAuthors: true,
                includePreRelease: true,
                includeArtistHasConcertsField: false,
            },
        ]);
    }
    for (const [definition, variables] of attempts) {
        try {
            const res = await Spicetify.GraphQL.Request(definition, variables);
            const results = extractResults(res?.data?.searchV2);
            if (results.length) return results;
        } catch (err) {}
    }
    return [];
}

function updateSearchBarFocus() {
    const bar = document.getElementById("spotui-search-bar");
    if (bar) bar.classList.toggle("focused", app.searchFocus === "input");
}

function scrollSearchSelectedIntoView() {
    const selected = document.querySelector("#spotui-search-results .spotui-search-item.selected");
    if (selected) selected.scrollIntoView({ block: "nearest" });
}

export function renderSearchResults() {
    const container = document.getElementById("spotui-search-results");
    if (!container) return;
    container.innerHTML = "";
    if (!app.searchResults.length) {
        const empty = document.createElement("div");
        empty.className = "spotui-search-empty";
        empty.textContent = app.searchQuery ? "No results" : "";
        container.appendChild(empty);
        return;
    }
    app.searchResults.forEach((item, idx) => {
        const row = document.createElement("div");
        row.className = "spotui-search-item" + (app.searchFocus === "results" && idx === app.searchSelected ? " selected" : "");
        const type = document.createElement("span");
        type.className = "spotui-search-type";
        type.textContent = item.type || "";
        const name = document.createElement("span");
        name.className = "spotui-search-name";
        name.textContent = item.name || "";
        row.appendChild(type);
        row.appendChild(name);
        row.addEventListener("click", () => playSearchResult(idx));
        container.appendChild(row);
    });
}

async function runSearch(query) {
    const token = ++app.searchFetchToken;
    const term = query.trim();
    app.searchQuery = term;
    if (!term) {
        app.searchResults = [];
        app.searchSelected = 0;
        renderSearchResults();
        return;
    }
    try {
        const results = await searchSpotify(term);
        if (token !== app.searchFetchToken) return;
        app.searchResults = results;
    } catch (err) {
        if (token !== app.searchFetchToken) return;
        app.searchResults = [];
    }
    if (app.searchSelected >= app.searchResults.length) {
        app.searchSelected = Math.max(0, app.searchResults.length - 1);
    }
    renderSearchResults();
    scrollSearchSelectedIntoView();
}

function scheduleSearch(query) {
    if (app.searchDebounce) clearTimeout(app.searchDebounce);
    app.searchDebounce = setTimeout(() => {
        app.searchDebounce = null;
        runSearch(query);
    }, SEARCH_DEBOUNCE_MS);
}

function setSearchFocus(mode) {
    app.searchFocus = mode;
    const input = document.getElementById("spotui-search-input");
    if (mode === "input" && input) input.focus();
    if (mode === "results" && input) input.blur();
    updateSearchBarFocus();
}

function playSearchResult(idx) {
    const item = app.searchResults[idx];
    if (!item || !item.uri) return;
    Spicetify.Player.playUri(item.uri);
    closeSearchPanel();
}

export function initSearchPanel() {
    if (app.searchBound) return;
    const input = document.getElementById("spotui-search-input");
    const bar = document.getElementById("spotui-search-bar");
    if (!input || !bar) return;
    app.searchBound = true;
    bar.addEventListener("click", () => {
        if (app.searchPanelOpen) setSearchFocus("input");
    });
    input.addEventListener("input", (e) => {
        app.searchSelected = 0;
        scheduleSearch(e.target.value);
    });
}

export function handleSearchPanelKeydown(e) {
    if (!app.searchPanelOpen) return;
    if (e.key === "Escape") {
        e.preventDefault();
        closeSearchPanel();
        return;
    }
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!app.searchResults.length) return;
        if (app.searchFocus === "input") {
            setSearchFocus("results");
            app.searchSelected = 0;
        } else {
            app.searchSelected = Math.min(app.searchSelected + 1, app.searchResults.length - 1);
        }
        renderSearchResults();
        scrollSearchSelectedIntoView();
        return;
    }
    if (e.key === "ArrowUp") {
        if (app.searchFocus !== "results") return;
        e.preventDefault();
        if (app.searchSelected <= 0) {
            setSearchFocus("input");
        } else {
            app.searchSelected -= 1;
        }
        renderSearchResults();
        scrollSearchSelectedIntoView();
        return;
    }
    if (e.key === "Enter" && app.searchFocus === "results") {
        e.preventDefault();
        playSearchResult(app.searchSelected);
    }
}

export function closeSearchPanel() {
    const wasOpen = app.searchPanelOpen;
    app.searchPanelOpen = false;
    document.body.classList.remove("spotui-search-panel");
    const panel = document.getElementById("spotui-search-panel");
    if (panel) panel.hidden = true;
    document.removeEventListener("keydown", handleSearchPanelKeydown, true);
    if (app.searchDebounce) {
        clearTimeout(app.searchDebounce);
        app.searchDebounce = null;
    }
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
    if (wasOpen) emitPaneClose("search");
}

export function openSearchPanel(query = "") {
    app.searchPanelOpen = true;
    app.searchResults = [];
    app.searchSelected = 0;
    app.searchFetchToken += 1;
    document.body.classList.add("spotui-search-panel");
    const panel = document.getElementById("spotui-search-panel");
    if (panel) panel.hidden = false;
    const input = document.getElementById("spotui-search-input");
    if (input) {
        input.value = query;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
    setSearchFocus("input");
    document.addEventListener("keydown", handleSearchPanelKeydown, true);
    runSearch(query);
}
