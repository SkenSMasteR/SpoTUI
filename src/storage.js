export function storageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

export function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {}
}

export function storageRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {}
}

export function storageClear() {
    try {
        localStorage.clear();
    } catch (e) {}
}
