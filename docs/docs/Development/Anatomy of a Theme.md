# Anatomy of a Theme

Each theme in the feed is a JSON object with this shape:

```json
{
  "name": "My Cool Theme",
  "screenshot_url": "https://...",       // preview image
  "commands": [                            // array of tui commands
    "tui -bar -bg #1a1b26 -border #7aa2f7 -text #c0caf5",
    "tui -progress -bg #1a1b26 -fg #7aa2f7",
    "tui -inputs -bg #1a1b26 -bg-hover #24283b -text #c0caf5 -border #7aa2f7",
    "tui -ly -cp -active #7aa2f7 -inactive #565f89 -near #a9b1d6",
    "tui -wp https://example.com/bg.jpg -o 0.3"
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `name` | string | **required** Display name shown in the theme browser |
| `id` | string | **auto-generated** |
| `screenshot_url` | string | **required** URL to a preview screenshot |
| `commands` | string[] | **required** Array of `tui` commands to execute |
