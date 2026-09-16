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

function isAutocompleteEntry(entry, data) {
    const types = [entry?.item?.__typename, data?.__typename, entry?.__typename];
    return types.some((type) => typeof type === "string" && /autocomplete/i.test(type));
}

function extractResults(searchV2) {
    const results = [];
    const seen = new Set();
    let autocomplete = "";
    Object.values(searchV2 || {}).forEach((section) => {
        const list = section?.itemsV2 || section?.items;
        if (!Array.isArray(list)) return;
        list.forEach((entry) => {
            const data = entry?.item?.data ?? entry?.data ?? entry;
            const name = resolveName(data);
            if (isAutocompleteEntry(entry, data)) {
                if (!autocomplete && name) autocomplete = name;
                return;
            }
            const item = toResult(entry);
            if (!item || seen.has(item.uri)) return;
            seen.add(item.uri);
            results.push(item);
        });
    });
    return { results, autocomplete };
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
            const parsed = extractResults(res?.data?.searchV2);
            if (parsed.results.length || parsed.autocomplete) return parsed;
        } catch (err) {}
    }
    return { results: [], autocomplete: "" };
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

function renderSearchAutocomplete() {
    const input = document.getElementById("spotui-search-input");
    const ghost = document.getElementById("spotui-search-ghost");
    if (!input || !ghost) return;
    const value = input.value;
    const completion = app.searchAutocomplete || "";
    const matches = completion.length > value.length && completion.toLowerCase().startsWith(value.toLowerCase());
    if (!matches) {
        ghost.hidden = true;
        ghost.textContent = "";
        return;
    }
    ghost.hidden = false;
    ghost.style.left = `${input.offsetLeft}px`;
    ghost.style.top = `${input.offsetTop}px`;
    ghost.style.width = `${input.offsetWidth}px`;
    ghost.style.height = `${input.offsetHeight}px`;
    ghost.innerHTML = "";
    const typed = document.createElement("span");
    typed.style.visibility = "hidden";
    typed.textContent = value;
    const rest = document.createElement("span");
    rest.textContent = completion.slice(value.length);
    ghost.appendChild(typed);
    ghost.appendChild(rest);
}

async function runSearch(query) {
    const token = ++app.searchFetchToken;
    const term = query.trim();
    app.searchQuery = term;
    if (!term) {
        app.searchResults = [];
        app.searchSelected = 0;
        app.searchAutocomplete = "";
        renderSearchResults();
        renderSearchAutocomplete();
        return;
    }
    try {
        const { results, autocomplete } = await searchSpotify(term);
        if (token !== app.searchFetchToken) return;
        app.searchResults = results;
        app.searchAutocomplete = autocomplete;
    } catch (err) {
        if (token !== app.searchFetchToken) return;
        app.searchResults = [];
        app.searchAutocomplete = "";
    }
    if (app.searchSelected >= app.searchResults.length) {
        app.searchSelected = Math.max(0, app.searchResults.length - 1);
    }
    renderSearchResults();
    renderSearchAutocomplete();
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
    if (!document.getElementById("spotui-search-ghost")) {
        const ghost = document.createElement("div");
        ghost.id = "spotui-search-ghost";
        ghost.hidden = true;
        bar.appendChild(ghost);
    }
    bar.addEventListener("click", () => {
        if (app.searchPanelOpen) setSearchFocus("input");
    });
    input.addEventListener("input", (e) => {
        app.searchSelected = 0;
        app.searchAutocomplete = "";
        renderSearchAutocomplete();
        scheduleSearch(e.target.value);
    });
    input.addEventListener("scroll", () => {
        if (app.searchAutocomplete) renderSearchAutocomplete();
    });
}

export function handleSearchPanelKeydown(e) {
    if (!app.searchPanelOpen) return;
    if (e.key === "Escape") {
        e.preventDefault();
        closeSearchPanel();
        return;
    }
    if (e.key === "Tab") {
        const input = document.getElementById("spotui-search-input");
        const completion = app.searchAutocomplete || "";
        const value = input ? input.value : "";
        const canComplete = input && completion.length > value.length && completion.toLowerCase().startsWith(value.toLowerCase());
        if (!canComplete) return;
        e.preventDefault();
        input.value = completion;
        input.setSelectionRange(completion.length, completion.length);
        app.searchAutocomplete = "";
        renderSearchAutocomplete();
        runSearch(completion);
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
    app.searchAutocomplete = "";
    const ghost = document.getElementById("spotui-search-ghost");
    if (ghost) {
        ghost.hidden = true;
        ghost.textContent = "";
    }
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
    app.searchAutocomplete = "";
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
