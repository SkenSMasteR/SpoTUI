# Building Your Theme

### Step 1: Pick Your Palette
You need hex colors for these groups. Not all are required - only include commands for what you want to change. Unset values stay at defaults (black background, `#ff8c42` accent).

| Group | Colors Needed |
|---|---|
| Player Bar | background, border/accent, text |
| Progress Bar | background, foreground |
| Inputs | background, hover-bg, text, border |
| Lyrics | active, inactive, near-active |

### Step 2: Test In the Terminal
Open SpoTUI and type each command directly to see the result live:

```bash
tui -bar -bg #1a1b26 -border #7aa2f7 -text #c0caf5
tui -progress -bg #1a1b26 -fg #7aa2f7
tui -inputs -bg #1a1b26 -bg-hover #24283b -text #c0caf5 -border #7aa2f7
tui -ly -cp -active #7aa2f7 -inactive #565f89 -near #a9b1d6
```

> **💡 Tip:** Use `tui restore` to reset all settings to their defaults during testing.  
> *After running the command, wait 5 seconds, then restart Spotify for the changes to take effect.*

### Step 3: Assemble Your Commands Array
Once happy, collect every command you ran into a JSON array:

```json
[
  "tui -bar -bg #1a1b26 -border #7aa2f7 -text #c0caf5",
  "tui -progress -bg #1a1b26 -fg #7aa2f7",
  "tui -inputs -bg #1a1b26 -bg-hover #24283b -text #c0caf5 -border #7aa2f7",
  "tui -ly -cp -active #7aa2f7 -inactive #565f89 -near #a9b1d6"
]
```

### Step 4: Take a Screenshot
With your theme applied, take a screenshot of SpoTUI. This becomes the preview image in the theme browser. Host it anywhere publicly accessible (Imgur, GitHub, your own server).
