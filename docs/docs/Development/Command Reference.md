# Command Reference

These are all the `tui` commands you can use in your theme's `commands` array. All color values are hex codes with the `#` prefix.

### Player Bar
```bash
tui -bar -bg <#hex> -border <#hex> -text <#hex>
```

| Flag | What it sets | CSS Variable |
|---|---|---|
| `-bg` | Bar background | `--player-bar-background` |
| `-border` | Bar border + accent color | `--player-bar-border-color` + `--spotui-accent` |
| `-text` | Bar text color | `--player-bar-text-color` |
| `-v` | Toggle bar visibility | `` |
| `-c` | Toggle custom bar | `` |
| `-c -progress` | Select progress style  | `` |

> **Note:** The `-border` color also sets `--spotui-accent`, which is used throughout the UI for highlights. This is the most impactful color in your theme.

Reset: `tui -bar off`

### Progress Bar
```bash
tui -progress -bg <#hex> -fg <#hex>
```

| Flag | What it sets | CSS Variable |
|---|---|---|
| `-bg` | Track background | `--progress-bar-background` |
| `-fg` | Filled portion | `--progress-bar-foreground` |

Reset: `tui -progress off`

### Input Fields
```bash
tui -inputs -bg <#hex> -bg-hover <#hex> -text <#hex> -border <#hex>
```

| Flag | What it sets | CSS Variable |
|---|---|---|
| `-bg` | Input background | `--input-bg-color` |
| `-bg-hover` | Hover state background | `--input-bg-hover-color` |
| `-text` | Input text | `--input-text-color` |
| `-border` | Input border | `--input-border-color` |

Reset: `tui -inputs off`

### Lyrics Colors
```bash
tui -ly -cp -active <#hex> -inactive <#hex> -near <#hex>
```

| Flag | What it sets | CSS Variable |
|---|---|---|
| `-active` | Current line | `--lyrics-color-active` |
| `-inactive` | Other lines | `--lyrics-color-inactive` |
| `-near` | Lines near current | `--lyrics-color-light-inactive` |

Reset: `tui -ly -cp off`

### Wallpaper
```bash
tui -wp <url> -o <opacity>
```

| Flag | What it sets | Notes |
|---|---|---|
| `<url>` | Background image URL | Any publicly accessible image URL |
| `-o` | Opacity | **optional** Float from `0` to `1`, defaults to `1` |

Remove: `tui -wp off`

### Logo & Animation
```bash
tui -l <on/off>          # toggle ASCII logo
tui -l -a <on/off>      # toggle ASCII animation
```
