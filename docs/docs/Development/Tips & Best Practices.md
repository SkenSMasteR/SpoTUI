# Tips & Best Practices

* **Contrast matters.** Test your text colors against your backgrounds. Light text on dark bg or vice versa.
* **`-border` on `-bar` is your accent.** It sets `--spotui-accent` used across the entire UI. Pick a standout color here.
* **Wallpaper opacity.** Keep it low (`0.1`–`0.3`) so text stays readable. Default `1` will obscure everything.
* **You don't need every command.** Only include what you want to change. Missing groups stay at defaults.
* **Order doesn't matter.** Commands run sequentially but are independent, any order works.
* **Use `tui restore`** to reset to defaults between testing different palettes.
* **Host wallpapers on fast CDNs.** Slow image loads mean a blank background while users wait.
* **Test with lyrics open.** Type `lyrics` to open the lyrics panel and verify your lyrics colors look good in context.

> **Important:** All settings are stored in `localStorage`. If a user clears their browser/Spotify data, they'll need to re-apply the theme.

## localStorage Keys Reference

For advanced users - these are the `localStorage` keys SpoTUI reads on startup:

| Key | Set By |
|---|---|
| `spotui:player-bar-bg` | `tui -bar -bg` |
| `spotui:player-bar-border` | `tui -bar -border` |
| `spotui:player-bar-text` | `tui -bar -text` |
| `spotui:progress-bar-bg` | `tui -progress -bg` |
| `spotui:progress-bar-fg` | `tui -progress -fg` |
| `spotui:input-bg` | `tui -inputs -bg` |
| `spotui:input-bg-hover` | `tui -inputs -bg-hover` |
| `spotui:input-text` | `tui -inputs -text` |
| `spotui:input-border` | `tui -inputs -border` |
| `spotui:lyrics-color-active` | `tui -ly -cp -active` |
| `spotui:lyrics-color-inactive` | `tui -ly -cp -inactive` |
| `spotui:lyrics-color-light-inactive` | `tui -ly -cp -near` |
| `spotui:wp-url` | `tui -wp <url>` |
| `spotui:wp-opacity` | `tui -wp -o` |
