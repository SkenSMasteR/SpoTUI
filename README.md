<div align="center">
  <table>
    <tr>
      <td>
        <img src="assets/logo.png" alt="SpoTUI Logo" width="200"/>
      </td>
      <td>
        <img src="banner-gif.gif" alt="SpoTUI Banner"/>
      </td>
    </tr>
  </table>

  <h1>SpoTUI</h1>

  <p>
    SpoTUI is a terminal-inspired theme for Spotify that overlays a custom,<br>
    keyboard-driven interface directly inside the Spotify client.<br>
    It is built for <a href="https://spicetify.app/">Spicetify</a>.
  </p>
</div>

![SpoTUI preview](https://img.ge/i/OJuvD46.png)

<table>
  <tr>
    <td align="center" width="50%">
      <img src="https://img.ge/i/aZzwF75.png" alt="Installation">
    </td>
    <td align="center" width="50%">
      <a href="#linux">Linux</a><br><br>
      <a href="#windows">Windows</a><br><br>
      <a href="#marketplace">Marketplace</a>
    </td>
  </tr>
</table>

## Usage

Type `help` in the SpoTUI command bar to see a list of available commands.

| Command | Description |
|---------|-------------|
| `tui -l <on/off>` | Toggle ASCII logo visibility |
| `tui -l -a <on/off>` | Toggle ASCII animation |
| `tui -wp <url> [-o <opacity>]` | Set wallpaper (opacity 0-1) |
| `tui -t pull <theme_id>` | Apply a theme by its ID (you can find the id on our website) |
| `tui bind "<Letter>" "<command>"` | Binds Alt+`<Letter>` to run a TUI command |
| `tui unbind "<Letter>"` | Remove the Alt+<Letter> keybind |
| `tui bind clear` | Remove all keybinds |
| `tui -wp off` | Remove wallpaper |
| `tui -ly -cp -active <#hex> -inactive <#hex> -near <#hex>` | Set lyrics colors |
| `tui -ly -cp off` | Reset lyrics colors |
| `tui -ly -animation <on/off>` | Toggle lyrics loader animation |
| `tui -bar -bg <#hex> -border <#hex> -text <#hex>` | Set player bar colors |
| `tui -bar -v <on/off>` | Toggle native play bar visibility |
| `tui -bar -c <on/off>` | Toggle custom TUI play bar |
| `tui -bar -c -progress <id>` | Set custom play bar progress style |
| `tui -bar off` | Reset player bar colors |
| `tui -progress -bg <#hex> -fg <#hex>` | Set progress bar colors |
| `tui -progress off` | Reset progress bar colors |
| `tui -inputs -bg <#hex> -bg-hover <#hex> -text <#hex> -border <#hex>` | Set input colors |
| `tui -inputs -buttons <on/off>` | Toggle bottom right buttons visibility |
| `tui -inputs off` | Reset input colors |
| `playlist` / `list` | Open playlist viewer |
| `play` / `pause` / `p` | Toggle playback |
| `skip` | Next track |
| `s` / `seek <mm:ss>` | Jump to a specific time |
| `v` / `volume <%>` | Set volume (0-100) |
| `shuffle` | Toggle shuffle |
| `loop` / `superloop` | Toggle repeat mode |
| `lyrics` | Toggle lyrics panel |
| `search` | Open Spotify's native search |
| `theme` | Browse and apply themes |
| `discord` | Show the Discord update banner and re-enable it on boot |
| `help` | Show the help panel |

## Custom Play Bar Progress Styles

When the native Spotify play bar is hidden (`tui -bar -v off`), you can enable a custom, text-based TUI play bar (`tui -bar -c on`). This bar has a progress indicator with 14 different style presets.

To set a progress style, use the command: `tui -bar -c -progress <id>`

### Available Styles

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

## Bundling from Source

The theme's JavaScript lives as ES modules in `src/` and must be bundled into a single `theme.js` before it can be loaded by Spicetify.

From the theme root, run:

```bash
npx rollup src/main.js --file theme.js --format iife
```

This bundles `src/main.js` and outputs `theme.js` in the theme root (next to `manifest.json` and `user.css`).

## Contributing

You can add your own theme to the theme browser by visiting [spotui.root.sx](https://spotui.root.sx/).

**Note:** To help prevent broken themes and spam, you must sign in with GitHub to submit a theme.

**Note:** Do not commit the bundled `theme.js`. All PRs with the bundled JS will be closed.

---

<div align="center">

## Author

SkenS - https://github.com/SkenSMasteR

</div>

<div align="center">
  <img src="https://img.ge/i/tYsJn12.png" alt="End of file" width="45%" height="400px">
  <img src="https://img.ge/i/tYsJn12.png" alt="End of file" width="45%" height="400px">
</div>

---

<br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br>

<div align="center">
  <img src="https://img.ge/i/J1uPn48.png" alt="Install"/>
</div>

## Linux

<details>
  <summary>Linux</summary>

  <table>
    <tr>
      <td align="center" width="50%">
        <img src="https://img.ge/i/38eEU30.png" alt="Linux Installation" width="100%">
      </td>
      <td width="50%">
        1. Go in the <a href="https://spotui.root.sx/">SpoTUI Docs</a>.<br>
        2. Select <strong>"Getting Started"</strong>.<br>
        3. Follow the guide.
      </td>
    </tr>
  </table>
  > Note: If you are using Spicetify v3, follow the guide in the "spotui@&lt;version&gt;" release.
</details>

## Windows

<details>
  <summary>Windows</summary>

  <table>
    <tr>
      <td align="center" width="50%">
        <img src="https://img.ge/i/MgChs45.png" alt="Windows Installation" width="100%">
      </td>
      <td width="50%">
        1. Go in the <a href="https://spotui.root.sx/">SpoTUI Docs</a>.<br>
        2. Select <strong>"Getting Started"</strong>.<br>
        3. Follow the guide.
      </td>
    </tr>
  </table>
  > Note: If you are using Spicetify v3, follow the guide in the "spotui@&lt;version&gt;" release.
</details>

## Marketplace

<details>
  <summary>Marketplace</summary>

  <table>
    <tr>
      <td align="center" width="50%">
        <img src="https://img.ge/i/xMjX154.png" alt="Marketplace Installation" width="100%">
      </td>
      <td width="50%">
        1. In Spotify, go to the <strong>Spicetify Marketplace</strong>.<br>
        2. Select <strong>"Themes"</strong> and search for <code>SpoTUI</code>.<br>
        3. Install the theme.
      </td>
    </tr>
  </table>
  > Note: If you are using Spicetify v3, follow the guide in the "spotui@&lt;version&gt;" release.
</details>
