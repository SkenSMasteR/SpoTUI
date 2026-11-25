# Custom Play Bar

When the native Spotify play bar is hidden (`tui -bar -v off`), you can enable a custom, text-based play bar (`tui -bar -c on`). This bar has a progress indicator with 14 style presets.

To set a progress style:

```bash
tui -bar -c -progress <id>
```

## Available Styles

| ID | Preview Example | Description |
|----|-----------------|-------------|
| `classic-block` | `████████░░░░░░░░` | Classic TUI block progress |
| `dark-block` | `▓▓▓▓▓▓▓▓░░░░░░░░` | Dark block progress |
| `gradient` | `██████▓▓▒▒░░░░░░` | Smooth block gradient |
| `thin` | `━━━━━━━━░░░░░░░░` | Bold thin line with empty blocks |
| `line` | `━━━━━━━━────────` | Smooth heavy and light line indicator |
| `square` | `■■■■■■■■□□□□□□□□` | Square bullet style |
| `circle` | `●●●●●●●●○○○○○○○○` | Circular bullet style |
| `diamond` | `◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇` | Diamond bullet style |
| `chevron` | `>>>>>>>>░░░░░░░░` | Arrow / Chevron progress |
| `triangle` | `▶▶▶▶▶▶▶▶▷▷▷▷▷▷▷▷` | Solid and empty play-button triangles |
| `braille` | `⣿⣿⣿⣿⣿⣿⣿⣿⣀⣀⣀⣀⣀⣀⣀⣀` | Braille dot block progress |
| `retro` | `▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱` | Retro segment blocks |
| `pixel` | `█▀█▀█▀█▀░░░░░░░░` | Checkerboard pixel progress |
| `dashed` | `━━━━━━━╸────────` | Dashed track with end handle |
