<div align="center">
  <img src="assets/logo.png" alt="SpoTUI Logo" width="200"/>
  <h1>SpoTUI</h1>
  <img src="banner-gif.gif"/>
</div>

# SpoTUI


[![Live Preview](https://img.shields.io/badge/Live%20Preview-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://skensmaster.github.io/SpoTUI-Docs/)

SpoTUI is a terminal-inspired theme for Spotify that overlays a custom, keyboard-driven interface directly inside the Spotify client. It is built for [Spicetify](https://spicetify.app/).

## How It Works

SpoTUI is a self-contained Spicetify theme that uses:
- **`theme.js`**: A vanilla JavaScript component that creates and manages the entire TUI, including panels, commands, and Spotify API interactions.
- **`user.css`**: CSS overrides to hide the default Spotify UI and style the SpoTUI interface.
- **`color.ini`**: Standard Spicetify color definitions.

## Features

- **Terminal Interface**: A command-driven overlay with a familiar feel.
- **Multiple Panels**:
    - **Lyrics**: Synced, auto-scrolling lyrics view.
    - **Playlists**: A two-pane view to browse playlists and their tracks.
    - **Help**: A quick reference for all available commands.
- **Keyboard Navigation**: Control everything without touching the mouse.
- **Built-in Commands**: Manage playback, volume, playlists, and more.
- **Spotify Native Fallback**: Seamlessly switch back to the standard Spotify UI when needed.

## Screenshots


![SpoTUI preview](assets/preview.png)

### Lyrics View
![SpoTUI preview](assets/lyrics.png)

## Installation

<details>
<summary>Linux</summary>

1.  Open a terminal.
2.  Run the installer:
    ```bash
    curl -fsSL -o install.sh https://raw.githubusercontent.com/SkenSMasteR/SpoTUI/refs/heads/master/scripts/install/linux/install.sh && chmod +x install.sh && ./install.sh
    ```
3.  Select "Install" from the menu.

</details>

<details>
<summary>Windows</summary>

1.  Open PowerShell.
2.  Run the installer:
    ```powershell
    iwr -useb https://raw.githubusercontent.com/SkenSMasteR/SpoTUI/refs/heads/master/scripts/install/windows/install.ps1 | iex
    ```
3.  Select "Install" from the menu.
</details>

<details>
<summary>Marketplace</summary>

1.  In Spotify, go to the Spicetify Marketplace.
2.  Select "Themes" and search for `SpoTUI`.
3.  Install the theme.

</details>

## Usage

Type `help` in the SpoTUI command bar to see a list of available commands.

| Command                | Description                    |
| -----------------------| -------------------------------|
| `tui -l <on/off>`      | Toggle ASCII logo visibility   |
| `tui -l -a <on/off>`   | Toggle ASCII animation         |
| `tui -wp <url> [-o <opacity>]` | Set wallpaper (opacity 0-1) |
| `tui -t pull <theme_id>` | Apply a theme by its ID (you can find the id on our website) |
| `tui bind "<Letter>" "<command>"` | Binds Alt+`<Letter>` to run a TUI command |
| `tui unbind "<Letter>"` | Remove the Alt+<Letter> keybind |
| `tui bind clear` | Remove all keybinds |
| `tui -wp off`          | Remove wallpaper               |
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
| `tui -inputs -buttons <on/off>` | Toggle bottom right buttons visibility  |
| `tui -inputs off` | Reset input colors |
| `playlist` / `list`    | Open playlist viewer           |
| `play` / `pause` / `p` | Toggle playback                |
| `skip`                 | Next track                     |
| `s` / `seek <mm:ss>`      | Jump to a specific time        |
| `v` / `volume <%>`     | Set volume (0-100)             |
| `shuffle`              | Toggle shuffle                 |
| `loop` / `superloop`   | Toggle repeat mode             |
| `lyrics`               | Toggle lyrics panel            |
| `search`               | Open Spotify's native search   |
| `theme`                | Browse and apply themes        |
| `discord`              | Show the Discord update banner and re-enable it on boot |
| `help`                 | Show the help panel            |

## Custom Play Bar Progress Styles

When the native Spotify play bar is hidden (`tui -bar -v off`), you can enable a custom, text-based TUI play bar (`tui -bar -c on`). This bar has a progress indicator with 14 different style presets.

To set a progress style, use the command: `tui -bar -c -progress <id>`

### Available Styles

| ID | Preview Example | Description |
|---|---|---|
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

## Contributing

You can add your own theme to the theme browser by visiting [spotui.root.sx](https://spotui.root.sx/).

**Note:** To help prevent broken themes and spam, you must sign in with GitHub to submit a theme.

## Author

SkenS - https://github.com/SkenSMasteR
