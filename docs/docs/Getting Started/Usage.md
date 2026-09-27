# Usage

Type `help` in the SpoTUI command bar to see a list of available commands.

## Commands

| Command | Description |
|---------|-------------|
| `tui -l <on/off>` | Toggle ASCII logo visibility |
| `tui -l -a <on/off>` | Toggle ASCII animation |
| `tui -wp <url> [-o <opacity>]` | Set wallpaper (opacity 0–1) |
| `tui -t pull <theme_id>` | Apply a theme by its ID (find the ID on [spotui.root.sx](https://spotui.root.sx/)) |
| `tui bind "<Letter>" "<command>"` | Bind Alt+`<Letter>` to run a TUI command |
| `tui unbind "<Letter>"` | Remove the Alt+`<Letter>` keybind |
| `tui bind clear` | Remove all keybinds |
| `tui actions create <name>` | Create a named action |
| `tui actions "<name>" "<listener>" "<command>"` | Bind an action to a listener |
| `tui actions list` | List saved actions |
| `tui actions enable <name>` | Enable an action |
| `tui actions disable <name>` | Disable an action |
| `tui actions delete <name>` | Delete an action |
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
| `playlist` / `list` `<playlist-name>` | Open playlist viewer or play a specific playlist |
| `play` / `pause` / `p` | Toggle playback |
| `skip` | Next track |
| `s` / `seek <mm:ss>` | Jump to a specific time |
| `v` / `volume <%>` | Set volume (0–100) |
| `shuffle` | Toggle shuffle |
| `loop` / `superloop` | Toggle repeat mode |
| `lyrics` | Toggle lyrics panel |
| `dj` | Play the DJ playlist |
| `echo <text>` | Display a message |
| `search <query>` | Search Spotify |
| `theme` | Browse and apply themes |
| `discord` | Show the Discord update banner and re-enable it on boot |
| `standby` | Enter standby mode (any key to exit) |
| `help` | Show the help panel |

For listeners, see **Actions**. For custom play bar styles, see **Custom Play Bar**.
