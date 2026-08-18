# How Themes Work

A SpoTUI theme is **a list of `tui` commands** that run sequentially to customize colors and wallpaper. When a user applies your theme, SpoTUI:

1. Resets all current customizations to defaults
2. Executes each command in your theme's `commands` array, one by one (120ms apart)
3. Saves every setting to `localStorage` so it persists across sessions

There's no special file format or build step. If you can type it in the SpoTUI terminal, you can put it in a theme.
