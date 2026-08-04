![SpoTUI animation](banner-gif.gif)

# SpoTUI

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
| `tui -m [cli\|cmd]`    | Switch TUI mode                |
| `playlist` / `list`    | Open playlist viewer           |
| `play` / `pause` / `p` | Toggle playback                |
| `skip`                 | Next track                     |
| `back`                 | Previous track                 |
| `v` / `volume <%>`     | Set volume (0-100)             |
| `shuffle`              | Toggle shuffle                 |
| `loop` / `superloop`   | Toggle repeat mode             |
| `lyrics`               | Toggle lyrics panel            |
| `search`               | Open Spotify's native search   |
| `clear`                | Clear the TUI output           |
| `help`                 | Show the help panel            |


## Notable forks of my project
<details>
<summary>SouRyan</summary>
SouRyan - https://github.com/SouRyan/SpoTUI-By-SouRyan
</details>



## Author

SkenS - https://github.com/SkenSMasteR
