export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
