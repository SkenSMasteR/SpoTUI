export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function playFresh(uri, context) {
    if (!uri && !context) return;
    try {
        await Spicetify.Platform.PlayerAPI.clearQueue();
    } catch {}
    if (context) Spicetify.Player.playUri(context, {}, { skipTo: { uri } });
    else Spicetify.Player.playUri(uri);
}

// randomizing animation sequences - fisher-yates
export function shuffleArray(array) {
    for (let index = array.length - 1; index > 0; index -= 1) {
        const j = Math.floor(Math.random() * (index + 1));
        [array[index], array[j]] = [array[j], array[index]];
    }
    return array;
}
export function createButton(id, className, text, onClick) {
    const btn = document.createElement("button");
    btn.id = id;
    btn.className = className;
    btn.textContent = text;
    btn.addEventListener("click", onClick);
    return btn;
}
