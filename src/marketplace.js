export function initMarketplaceTabs() {
    new MutationObserver(() => {
        const h = document.querySelector(".marketplace-header");
        if (!h || document.getElementById("mp-tabs")) return;
        let f = h[Object.keys(h).find((k) => k.startsWith("__reactFiber$"))];
        while (f && !(f.stateNode?.switchTo && f.stateNode.state?.tabs)) f = f.return;
        const g = f?.stateNode;
        if (!g) return;
        const bar = document.createElement("div");
        bar.id = "mp-tabs";
        const tabs = g.state.tabs.filter((t) => t.enabled);
        const activeName = g.state.currentTab?.value ?? g.state.currentTab ?? tabs[0]?.name;
        const buttons = tabs.map((t) => {
            const b = document.createElement("button");
            b.textContent = t.name;
            if (t.name === activeName) b.classList.add("active");
            b.onclick = () => {
                g.switchTo({ value: t.name });
                buttons.forEach((o) => o.classList.toggle("active", o === b));
            };
            bar.append(b);
            return b;
        });
        h.before(bar);
    }).observe(document.body, { childList: true, subtree: true });
}
