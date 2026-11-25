# Usage

Type `help` in the SpoTUI command bar to see a list of available commands.

In panels with directional navigation, `h`, `j`, `k`, and `l` act as Left, Down, Up, and Right when a text field or dropdown is unfocused. In Help, use Up and Down, Page Up and Page Down, or Home and End to scroll. In the theme browser, use the arrow keys to highlight a card and Enter to activate it.

## Commands

| Command | Description |
|---------|-------------|
| `tui -l <on/off>` | Toggle ASCII logo visibility |
| `tui -l -a <on/off>` | Toggle ASCII animation |
| `tui -wp <url> [-o <opacity>]` | Set wallpaper (opacity 0-1) |
| `tui -t pull <theme_id> [-live]` | Apply a theme using its Base64-encoded name. Use `-live` to look it up in the live feed. The default is Stable. |
| `tui bind "<Letter>" "<command>"` | Binds Alt+`<Letter>` to run a TUI command |
| `tui unbind "<Letter>"` | Remove the Alt+`<Letter>` keybind |
| `tui bind clear` / `tui unbind all` | Remove all keybinds |
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
| `tui -ly -spacing <value>` | Set vertical spacing between lyric lines. A bare number is interpreted as pixels. |
| `tui -ly -spacing off` | Resets line spacing in lyrics |
| `tui -viz -color <#hex>` | Set visualizer bar color |
| `tui -viz -gap <0-100>` | Set the gap between visualizer bars in pixels (0 = touching) |
| `tui -viz -gap off` | Reset visualizer bar gap |
| `tui -viz -bars <1-256>` | Set how many visualizer bars to show |
| `tui -viz -bars off` | Reset visualizer bar count |
| `tui -viz -smooth <1-100>` | Set visualizer bar smoothing |
| `tui -viz -smooth off` | Reset visualizer bar smoothing |
| `tui -viz -mode <adaptive/global>` | Set visualizer reaction mode |
| `tui -viz -mode off` | Reset visualizer reaction mode |
| `tui -viz off` | Reset visualizer bar color |
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
| `tui -panel -bg <#hex> -border <#hex> -text <#hex>` | Set help/playlist/theme/about panel colors |
| `tui -panel off` | Reset panel colors |
| `playlist` / `list` `[playlist-name]` | Open the playlist viewer or play a playlist if the name matches exactly one entry |
| `add2list` | Add the current song to a playlist |
| `queue` | View and reorder the play queue |
| `play` / `pause` / `p` | Resume, pause, or toggle playback, respectively |
| `skip` | Next track |
| `back` | Previous track |
| `s` / `seek <mm:ss>` | Jump to a specific time |
| `v` / `volume <%>` | Set volume (0-100) |
| `shuffle` | Toggle shuffle |
| `loop [on/off]` / `superloop [on/off]` | Control repeat context or repeat track, respectively. Omit the argument to toggle. |
| `like` | Like/unlike current song |
| `lyrics [on/off]` | Show or hide the lyrics panel. Omit the argument to toggle. |
| `visualizer [on/off]` | Show or hide the audio visualizer. Omit the argument to toggle. Showing it requires a running SpoSync connection. |
| `dj` | Play the DJ playlist |
| `echo <text>` | Display a message |
| `search [query]` | Open Spotify search, optionally with an initial query |
| `about` | Show about panel |
| `theme` | Browse and apply themes |
| `discord` | Show the Discord update banner and re-enable it on boot |
| `standby` | Enter standby mode (any key to exit) |
| `jam create` | Start a listening jam and get a PIN |
| `jam join <pin>` | Join a jam by PIN. Guests can use volume, lyrics, visualizer, and jam commands. |
| `jam leave` | Leave the current jam |
| `help` | Show the help panel |

For listeners, see **Actions**. For custom play bar styles, see **Custom Play Bar**.
