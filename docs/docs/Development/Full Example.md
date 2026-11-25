# Full Example

Here's a complete "Tokyo Night" inspired theme:

<div class="swatch-row" style="margin-bottom: 2.5rem;">
  <div class="swatch" style="background: #1a1b26;" data-hex="#1a1b26"></div>
  <div class="swatch" style="background: #24283b;" data-hex="#24283b"></div>
  <div class="swatch" style="background: #7aa2f7;" data-hex="#7aa2f7"></div>
  <div class="swatch" style="background: #c0caf5;" data-hex="#c0caf5"></div>
  <div class="swatch" style="background: #a9b1d6;" data-hex="#a9b1d6"></div>
  <div class="swatch" style="background: #565f89;" data-hex="#565f89"></div>
</div>

```json
{
  "name": "Tokyo Night",
  "screenshot_url": "https://example.com/tokyo-night.png",
  "commands": [
    "tui -bar -bg #1a1b26 -border #7aa2f7 -text #c0caf5",
    "tui -progress -bg #1a1b26 -fg #7aa2f7",
    "tui -inputs -bg #1a1b26 -bg-hover #24283b -text #c0caf5 -border #7aa2f7",
    "tui -ly -cp -active #7aa2f7 -inactive #565f89 -near #a9b1d6",
    "tui -wp https://example.com/tokyo-bg.jpg -o 0.2"
  ]
}
```
