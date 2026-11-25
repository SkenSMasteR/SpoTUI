# Actions

Actions run a command when a listener fires. Create one, then bind it:

```bash
tui actions create autolyrics
tui actions "autolyrics" "actions:spotui@pane_close>!lyrics" "lyrics on"
```

| Command | Description |
|---------|-------------|
| `tui actions create <name>` | Create a named action |
| `tui actions "<name>" "<listener>" "<command>"` | Bind an action to a listener |
| `tui actions list` | List saved actions |
| `tui actions enable <name>` | Enable an action |
| `tui actions disable <name>` | Disable an action |
| `tui actions delete <name>` | Delete an action |

## Action Targets

| Target | Description |
|--------|-------------|
| `actions:spotui@pane_close` | Fires when any pane closes |
| `actions:spotui@pane_close>help` | Fires when the help pane closes |
| `actions:spotui@pane_close>about` | Fires when the about pane closes |
| `actions:spotui@pane_close>playlist` | Fires when the playlist pane closes |
| `actions:spotui@pane_close>add2list` | Fires when the add-to-playlist pane closes |
| `actions:spotui@pane_close>queue` | Fires when the queue pane closes |
| `actions:spotui@pane_close>theme` | Fires when the theme pane closes |
| `actions:spotui@pane_close>lyrics` | Fires when the lyrics pane closes |
| `actions:spotui@pane_close>search` | Fires when the search pane closes |
| `actions:spotui@pane_close>!<pane>` | Fires when any pane except `<pane>` closes |
| `actions:spotui@pane_close><pane> \| spotui@pane_close><pane>` | Fires when any listed pane closes |
| `actions:spotui@pane_close>!<pane> \| spotui@pane_close>!<pane>` | Fires when the closed pane is none of the listed panes |
