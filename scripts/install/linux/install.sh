#!/usr/bin/env bash

if [ -z "$BASH_VERSION" ]; then
    exec bash "$0" "$@"
fi

THEME_NAME="SpoTUI"
REPO_URL="https://github.com/SkenSMasteR/SpoTUI"
THEMES_DIR="$HOME/.config/spicetify/Themes"
THEME_PATH="$THEMES_DIR/$THEME_NAME"

ESC=$'\033'
RESET="$ESC[0m"

BLOCK_FULL=$'\xe2\x96\x88'
BLOCK_LOWER=$'\xe2\x96\x84'
BLOCK_UPPER=$'\xe2\x96\x80'
BLOCK_LEFT=$'\xe2\x96\x8c'

get_rgb() {
    local r=$1 g=$2 b=$3
    printf '%s[38;2;%d;%d;%dm' "$ESC" "$r" "$g" "$b"
}

ORANGE_LIGHT=$(get_rgb 255 140 66)
ORANGE_DARK=$(get_rgb 224 123 57)
ORANGE_MID=$(get_rgb 240 131 61)
GREEN_ANSI=$(get_rgb 140 255 140)
SELECT_BG="${ESC}[48;2;255;140;66m${ESC}[38;2;0;0;0m"

WHITE="$ESC[97m"
GRAY="$ESC[90m"
RED="$ESC[91m"
GREEN="$ESC[92m"
CYAN="$ESC[96m"

PKG_REFRESH_ATTEMPTED=0

get_gradient_color() {
    local index=$1 total=$2
    local r1=255 g1=140 b1=66
    local r2=224 g2=123 b2=57
    local scale=1000
    local t
    if [ "$total" -le 1 ]; then
        t=0
    else
        t=$(( index * scale / (total - 1) ))
    fi
    local r g b
    r=$(( r1 + (r2 - r1) * t / scale ))
    g=$(( g1 + (g2 - g1) * t / scale ))
    b=$(( b1 + (b2 - b1) * t / scale ))
    get_rgb "$r" "$g" "$b"
}

get_ascii_art_line() {
    local out="$1"
    out="${out//A/$BLOCK_FULL}"
    out="${out//B/$BLOCK_LOWER}"
    out="${out//C/$BLOCK_UPPER}"
    out="${out//D/$BLOCK_LEFT}"
    printf '%s' "$out"
}

get_header_lines() {
    local templates=(
        "   BAAAAAAAA    BAAAAAAAB  BAAAAAAAB      AAA     AAA    AB   BA  "
        "  AAA    AAA   AAA    AAA AAA    AAA CAAAAAAAAAB AAA    AAA AAA  "
        "  AAA    AC    AAA    AAA AAA    AAA    CAAACCAA AAA    AAA AAAD "
        "  AAA          AAA    AAA AAA    AAA     AAA   C AAA    AAA AAAD "
        "CAAAAAAAAAAA CAAAAAAAAAC  AAA    AAA     AAA     AAA    AAA AAAD "
        "         AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  "
        "   BA    AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  "
        " BAAAAAAAAC   BAAAAC       CAAAAAAC     BAAAAC   AAAAAAAAC  AC   "
    )
    HEADER_LINES=()
    HEADER_LINES+=("")
    local total=${#templates[@]}
    local i line color
    for ((i = 0; i < total; i++)); do
        color=$(get_gradient_color "$i" "$total")
        line=$(get_ascii_art_line "${templates[$i]}")
        HEADER_LINES+=("${color}${line}${RESET}")
    done
    HEADER_LINES+=("")
    HEADER_LINES+=("${ORANGE_MID}                     Spicetify Theme Manager${RESET}")
    HEADER_LINES+=("${ORANGE_DARK}  =============================================================${RESET}")
    HEADER_LINES+=("")
}

show_header() {
    clear
    get_header_lines
    local line
    for line in "${HEADER_LINES[@]}"; do
        printf '%s\n' "$line"
    done
}

get_visible_length() {
    local text="$1"
    local stripped
    stripped=$(printf '%s' "$text" | sed -E "s/${ESC}\[[0-9;]*m//g")
    printf '%d' "${#stripped}"
}

write_frame() {
    local -n frame_lines=$1
    printf '%s[H' "$ESC"
    local width
    width=$(tput cols 2>/dev/null)
    [ -z "$width" ] && width=80
    local line visible pad
    for line in "${frame_lines[@]}"; do
        visible=$(get_visible_length "$line")
        pad=$((width - visible - 1))
        [ "$pad" -lt 0 ] && pad=0
        printf '%s%*s\n' "$line" "$pad" ""
    done
}

get_console_height() {
    local height
    height=$(tput lines 2>/dev/null)
    [ -z "$height" ] && height=30
    printf '%d' "$height"
}

refresh_path() {
    local candidate
    for candidate in "$HOME/.local/bin" "$HOME/.spicetify" "/usr/local/bin"; do
        if [[ ":$PATH:" != *":$candidate:"* ]] && [ -d "$candidate" ]; then
            PATH="$candidate:$PATH"
        fi
    done
    export PATH
}

detect_pkg_manager() {
    if command -v apt-get >/dev/null 2>&1; then echo "apt"
    elif command -v dnf >/dev/null 2>&1; then echo "dnf"
    elif command -v pacman >/dev/null 2>&1; then echo "pacman"
    elif command -v zypper >/dev/null 2>&1; then echo "zypper"
    elif command -v apk >/dev/null 2>&1; then echo "apk"
    else echo ""
    fi
}

refresh_pkg_manager() {
    local mgr
    mgr=$(detect_pkg_manager)
    printf '%s  Refreshing package lists...%s\n' "$ORANGE_MID" "$RESET"
    case "$mgr" in
        apt)     sudo apt-get update -y ;;
        dnf)     sudo dnf check-update -y || true ;;
        pacman)  sudo pacman -Sy --noconfirm ;;
        zypper)  sudo zypper refresh ;;
        apk)     sudo apk update ;;
        *)
            printf '  No supported package manager found (looked for apt, dnf, pacman, zypper, apk).%s\n' "" \
                2>/dev/null
            printf '%s  No supported package manager found. Install git manually.%s\n' "$RED" "$RESET"
            ;;
    esac
}

install_dependency() {
    local name="$1"
    if [ "$name" = "git" ]; then
        local mgr
        mgr=$(detect_pkg_manager)
        if [ -n "$mgr" ]; then
            printf '%s  Installing git via %s...%s\n' "$GRAY" "$mgr" "$RESET"
            case "$mgr" in
                apt)     sudo apt-get install -y git ;;
                dnf)     sudo dnf install -y git ;;
                pacman)  sudo pacman -S --noconfirm git ;;
                zypper)  sudo zypper install -y git ;;
                apk)     sudo apk add git ;;
            esac
            local exit_code=$?
            printf '  package manager exited with code %d\n' "$exit_code"

            if [ "$exit_code" -ne 0 ] && [ "$PKG_REFRESH_ATTEMPTED" -eq 0 ]; then
                printf '%s  Install failed. Refreshing package lists and retrying...%s\n' "$RED" "$RESET"
                PKG_REFRESH_ATTEMPTED=1
                refresh_pkg_manager

                printf '%s  Retrying git install...%s\n' "$GRAY" "$RESET"
                case "$mgr" in
                    apt)     sudo apt-get install -y git ;;
                    dnf)     sudo dnf install -y git ;;
                    pacman)  sudo pacman -S --noconfirm git ;;
                    zypper)  sudo zypper install -y git ;;
                    apk)     sudo apk add git ;;
                esac
            fi

            refresh_path
        else
            printf '%s  No supported package manager was found. Install git manually for your distro.%s\n' "$RED" "$RESET"
        fi
    elif [ "$name" = "spicetify" ]; then
        printf '%s  Installing Spicetify...%s\n' "$GRAY" "$RESET"
        curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
        printf '%s  Spicetify installer finished.%s\n' "$GRAY" "$RESET"
        refresh_path
    fi
}

test_dependencies() {
    local missing=()
    command -v git >/dev/null 2>&1 || missing+=("git")
    command -v spicetify >/dev/null 2>&1 || missing+=("spicetify")

    if [ ${#missing[@]} -eq 0 ]; then
        return 0
    fi

    printf '%s  Missing dependencies: %s%s\n' "$RED" "$(IFS=', '; echo "${missing[*]}")" "$RESET"
    echo ""
    read -rp "  Press I to install them now, or any other key to cancel: " confirm
    if [ "$confirm" != "I" ] && [ "$confirm" != "i" ]; then
        return 1
    fi

    local dep
    for dep in "${missing[@]}"; do
        echo ""
        printf '%s  Installing %s...%s\n' "$ORANGE_MID" "$dep" "$RESET"
        install_dependency "$dep"
    done

    echo ""
    printf '%s  Refreshing environment PATH...%s\n' "$ORANGE_MID" "$RESET"
    refresh_path

    local still_missing=()
    command -v git >/dev/null 2>&1 || still_missing+=("git")
    command -v spicetify >/dev/null 2>&1 || still_missing+=("spicetify")

    if [ ${#still_missing[@]} -gt 0 ]; then
        echo ""
        printf '%s  Still missing: %s. You may need to restart your terminal.%s\n' "$RED" "$(IFS=', '; echo "${still_missing[*]}")" "$RESET"
        return 1
    fi

    echo ""
    printf '%s  All dependencies installed successfully.%s\n' "$GREEN" "$RESET"
    return 0
}

get_default_branch() {
    local ref
    ref=$(git -C "$THEME_PATH" symbolic-ref refs/remotes/origin/HEAD 2>/dev/null)
    if [ -n "$ref" ]; then
        printf '%s' "${ref##*/}"
    else
        printf 'main'
    fi
}

test_is_detached() {
    if git -C "$THEME_PATH" symbolic-ref -q HEAD >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

get_theme_status_text=""
get_theme_status_color=""

get_theme_status_detailed() {
    if [ ! -d "$THEME_PATH" ]; then
        get_theme_status_text="Not Installed"
        get_theme_status_color="$RED"
        return
    fi

    if ! command -v git >/dev/null 2>&1; then
        get_theme_status_text="Installed"
        get_theme_status_color="$GREEN"
        return
    fi

    git -C "$THEME_PATH" fetch origin --quiet 2>/dev/null
    local local_hash
    local_hash=$(git -C "$THEME_PATH" rev-parse HEAD 2>/dev/null)

    if test_is_detached; then
        local short_hash="unknown"
        [ -n "$local_hash" ] && short_hash="${local_hash:0:7}"
        get_theme_status_text="Installed (custom commit $short_hash)"
        get_theme_status_color="$CYAN"
        return
    fi

    local branch remote_hash
    branch=$(get_default_branch)
    remote_hash=$(git -C "$THEME_PATH" rev-parse "origin/$branch" 2>/dev/null)

    if [ -z "$local_hash" ] || [ -z "$remote_hash" ]; then
        get_theme_status_text="Installed"
        get_theme_status_color="$GREEN"
        return
    fi

    if [ "$local_hash" = "$remote_hash" ]; then
        get_theme_status_text="Installed (up to date)"
        get_theme_status_color="$GREEN"
    else
        get_theme_status_text="Installed (outdated)"
        get_theme_status_color="$RED"
    fi
}

install_theme() {
    show_header
    printf '%s  Installing %s...%s\n' "$ORANGE_LIGHT" "$THEME_NAME" "$RESET"
    echo ""

    if ! test_dependencies; then
        pause_return
        return
    fi

    mkdir -p "$THEMES_DIR"

    if [ -d "$THEME_PATH" ]; then
        printf '%s  Theme already exists locally. Pulling latest changes...%s\n' "$ORANGE_MID" "$RESET"
        git -C "$THEME_PATH" pull
    else
        (cd "$THEMES_DIR" && git clone "$REPO_URL" "$THEME_NAME")
    fi

    if [ -d "$THEME_PATH" ]; then
        echo ""
        printf '%s  Setting current theme to %s...%s\n' "$ORANGE_MID" "$THEME_NAME" "$RESET"
        spicetify config current_theme "$THEME_NAME"

        printf '%s  Applying Spicetify...%s\n' "$ORANGE_MID" "$RESET"
        spicetify apply

        echo ""
        printf '%s  %s installed and applied successfully.%s\n' "$GREEN" "$THEME_NAME" "$RESET"
    else
        echo ""
        printf '%s  Installation failed. Check the errors above.%s\n' "$RED" "$RESET"
    fi

    pause_return
}

update_theme() {
    show_header
    printf '%s  Updating %s...%s\n' "$ORANGE_LIGHT" "$THEME_NAME" "$RESET"
    echo ""

    if [ ! -d "$THEME_PATH" ]; then
        printf '%s  %s is not installed. Use Install instead.%s\n' "$RED" "$THEME_NAME" "$RESET"
        pause_return
        return
    fi

    if ! test_dependencies; then
        pause_return
        return
    fi

    if test_is_detached; then
        local branch
        branch=$(get_default_branch)
        printf '%s  Currently on a custom commit. Returning to %s...%s\n' "$ORANGE_MID" "$branch" "$RESET"
        git -C "$THEME_PATH" checkout "$branch" --quiet
    fi

    git -C "$THEME_PATH" pull

    echo ""
    printf '%s  Re-applying Spicetify...%s\n' "$ORANGE_MID" "$RESET"
    spicetify apply

    echo ""
    printf '%s  %s updated successfully.%s\n' "$GREEN" "$THEME_NAME" "$RESET"
    pause_return
}

uninstall_theme() {
    show_header
    printf '%s  Uninstalling %s...%s\n' "$ORANGE_LIGHT" "$THEME_NAME" "$RESET"
    echo ""

    if [ ! -d "$THEME_PATH" ]; then
        printf '%s  %s is not installed.%s\n' "$RED" "$THEME_NAME" "$RESET"
        pause_return
        return
    fi

    printf '%s  This will remove the theme folder and switch to Marketplace.%s\n' "$GRAY" "$RESET"
    read -rp "  Type Y to confirm: " confirm
    if [ "$confirm" != "Y" ] && [ "$confirm" != "y" ]; then
        printf '%s  Cancelled.%s\n' "$GRAY" "$RESET"
        pause_return
        return
    fi

    if command -v spicetify >/dev/null 2>&1; then
        printf '%s  Switching Spicetify theme...%s\n' "$ORANGE_MID" "$RESET"
        spicetify config current_theme "SpoTUI-"
        spicetify config current_theme marketplace
        spicetify apply
    fi

    rm -rf "$THEME_PATH"

    echo ""
    printf '%s  %s has been uninstalled.%s\n' "$GREEN" "$THEME_NAME" "$RESET"
    pause_return
}

read_key() {
    local key rest
    IFS= read -rsn1 key
    if [ "$key" = "$ESC" ]; then
        read -rsn2 -t 0.01 rest
        case "$rest" in
            "[A") echo "UP" ;;
            "[B") echo "DOWN" ;;
            *)    echo "ESC" ;;
        esac
    elif [ -z "$key" ]; then
        echo "ENTER"
    else
        echo "OTHER"
    fi
}

read_arrow_selection() {
    local -n out_result=$1
    local -n _ras_items=$2
    local current_index=$3
    local -n _ras_title_lines=$4

    local selected_index=0
    [ "$current_index" -ge 0 ] && selected_index=$current_index

    get_header_lines
    local overhead=$(( ${#HEADER_LINES[@]} + ${#_ras_title_lines[@]} + 4 ))

    local page_size
    page_size=$(( $(get_console_height) - overhead ))
    [ "$page_size" -gt "${#_ras_items[@]}" ] && page_size=${#_ras_items[@]}
    [ "$page_size" -lt 1 ] && page_size=1

    clear
    printf '%s[?25l' "$ESC"

    while true; do
        local total_pages=$(( (${#_ras_items[@]} + page_size - 1) / page_size ))
        [ "$total_pages" -lt 1 ] && total_pages=1
        local current_page=$(( selected_index / page_size ))
        local page_start=$(( current_page * page_size ))
        local page_end=$(( page_start + page_size - 1 ))
        [ "$page_end" -gt $((${#_ras_items[@]} - 1)) ] && page_end=$((${#_ras_items[@]} - 1))

        local frame=()
        frame+=("${HEADER_LINES[@]}")
        frame+=("${_ras_title_lines[@]}")

        local i prefix text
        for ((i = page_start; i <= page_end; i++)); do
            if [ "$i" -eq "$current_index" ]; then
                prefix="> "
            else
                prefix="  "
            fi
            text="${prefix}${_ras_items[$i]}"
            if [ "$i" -eq "$selected_index" ]; then
                frame+=("${SELECT_BG}${text}${RESET}")
            elif [ "$i" -eq "$current_index" ]; then
                frame+=("${GREEN_ANSI}${text}${RESET}")
            else
                frame+=("$text")
            fi
        done

        local lines_used=$(( page_end - page_start + 1 ))
        local p
        for ((p = lines_used; p < page_size; p++)); do
            frame+=("")
        done

        frame+=("")
        frame+=("${ORANGE_DARK}  =============================================================${RESET}")
        frame+=("  Up/Down to move, Enter to select, Esc to go back   Page $((current_page + 1)) of $total_pages")

        write_frame frame

        local key
        key=$(read_key)

        case "$key" in
            UP)
                if [ "$selected_index" -gt 0 ]; then
                    selected_index=$((selected_index - 1))
                else
                    selected_index=$((${#_ras_items[@]} - 1))
                fi
                ;;
            DOWN)
                if [ "$selected_index" -lt $((${#_ras_items[@]} - 1)) ]; then
                    selected_index=$((selected_index + 1))
                else
                    selected_index=0
                fi
                ;;
            ENTER)
                printf '%s[?25h' "$ESC"
                out_result=$selected_index
                return
                ;;
            ESC)
                printf '%s[?25h' "$ESC"
                out_result=-1
                return
                ;;
        esac
    done
}

get_commit_list() {
    git -C "$THEME_PATH" fetch origin --quiet 2>/dev/null
    COMMIT_FULL=()
    COMMIT_SHORT=()
    COMMIT_DATE=()
    COMMIT_SUBJECT=()
    local line full short date subject
    while IFS='|' read -r full short date subject; do
        [ -z "$full" ] && continue
        COMMIT_FULL+=("$full")
        COMMIT_SHORT+=("$short")
        COMMIT_DATE+=("$date")
        COMMIT_SUBJECT+=("$subject")
    done < <(git -C "$THEME_PATH" log --all --pretty=format:"%H|%h|%ad|%s" --date=short)
}

show_commit_history() {
    if [ ! -d "$THEME_PATH" ]; then
        show_header
        printf '%s  %s is not installed.%s\n' "$RED" "$THEME_NAME" "$RESET"
        pause_return
        return
    fi

    if ! test_dependencies; then
        pause_return
        return
    fi

    local viewing=1
    while [ "$viewing" -eq 1 ]; do
        get_commit_list
        if [ ${#COMMIT_FULL[@]} -eq 0 ]; then
            show_header
            printf '%s  No commits found.%s\n' "$RED" "$RESET"
            pause_return
            return
        fi

        local current_hash
        current_hash=$(git -C "$THEME_PATH" rev-parse HEAD 2>/dev/null)

        local current_index=-1
        local items=()
        local i
        for ((i = 0; i < ${#COMMIT_FULL[@]}; i++)); do
            items+=("${COMMIT_SHORT[$i]}  ${COMMIT_DATE[$i]}  ${COMMIT_SUBJECT[$i]}")
            if [ "${COMMIT_FULL[$i]}" = "$current_hash" ]; then
                current_index=$i
            fi
        done
        local return_latest_index=${#items[@]}
        items+=("Return to latest version")
        local back_index=${#items[@]}
        items+=("Back")

        local title_lines=("${ORANGE_LIGHT}  Commit History${RESET}" "")

        local selection
        read_arrow_selection selection items "$current_index" title_lines

        if [ "$selection" -eq -1 ] || [ "$selection" -eq "$back_index" ]; then
            viewing=0
        elif [ "$selection" -eq "$return_latest_index" ]; then
            update_theme
        elif [ "$selection" -ge 0 ] && [ "$selection" -lt ${#COMMIT_FULL[@]} ]; then
            checkout_commit "${COMMIT_FULL[$selection]}" "${COMMIT_SHORT[$selection]}" "${COMMIT_DATE[$selection]}" "${COMMIT_SUBJECT[$selection]}"
        fi
    done
}

checkout_commit() {
    local full="$1" short="$2" date="$3" subject="$4"
    show_header
    printf '%s  Checking out commit %s...%s\n' "$ORANGE_LIGHT" "$short" "$RESET"
    printf '%s  %s  %s%s\n' "$GRAY" "$date" "$subject" "$RESET"
    echo ""
    printf '%s  This will switch the theme to this specific version.%s\n' "$GRAY" "$RESET"
    read -rp "  Type Y to confirm: " confirm
    if [ "$confirm" != "Y" ] && [ "$confirm" != "y" ]; then
        printf '%s  Cancelled.%s\n' "$GRAY" "$RESET"
        pause_return
        return
    fi

    git -C "$THEME_PATH" checkout "$full" --quiet

    if command -v spicetify >/dev/null 2>&1; then
        echo ""
        printf '%s  Applying Spicetify...%s\n' "$ORANGE_MID" "$RESET"
        spicetify apply
    fi

    echo ""
    printf '%s  %s is now on commit %s.%s\n' "$GREEN" "$THEME_NAME" "$short" "$RESET"
    pause_return
}

check_for_updates() {
    show_header
    printf '%s  Checking for updates...%s\n' "$ORANGE_LIGHT" "$RESET"
    echo ""

    if [ ! -d "$THEME_PATH" ]; then
        printf '%s  %s is not installed.%s\n' "$RED" "$THEME_NAME" "$RESET"
        pause_return
        return
    fi

    if ! test_dependencies; then
        pause_return
        return
    fi

    get_theme_status_detailed
    printf '%s  Status: %s%s%s\n' "$WHITE" "$get_theme_status_color" "$get_theme_status_text" "$RESET"

    if [ "$get_theme_status_text" = "Installed (outdated)" ]; then
        echo ""
        printf '%s  A newer version is available.%s\n' "$GRAY" "$RESET"
        read -rp "  Type Y to update now: " confirm
        if [ "$confirm" = "Y" ] || [ "$confirm" = "y" ]; then
            update_theme
            return
        fi
    fi

    pause_return
}

pause_return() {
    echo ""
    printf '%s  Press any key to return to the menu...%s\n' "$GRAY" "$RESET"
    IFS= read -rsn1
}

show_menu() {
    show_header
    get_theme_status_detailed

    printf '%s  Status: %s%s%s\n' "$WHITE" "$get_theme_status_color" "$get_theme_status_text" "$RESET"
    echo ""
    printf '%s  [1] Install %s%s\n' "$WHITE" "$THEME_NAME" "$RESET"
    printf '%s  [2] Update %s%s\n' "$WHITE" "$THEME_NAME" "$RESET"
    printf '%s  [3] Uninstall %s%s\n' "$WHITE" "$THEME_NAME" "$RESET"
    printf '%s  [4] Commit History / Downgrade%s\n' "$WHITE" "$RESET"
    printf '%s  [5] Check for Updates%s\n' "$WHITE" "$RESET"
    printf '%s  [6] Exit%s\n' "$WHITE" "$RESET"
    echo ""
    printf '%s  =============================================================%s\n' "$ORANGE_DARK" "$RESET"
    echo ""
    read -rp "  Select an option: " choice
    MENU_CHOICE="$choice"
}

running=1
while [ "$running" -eq 1 ]; do
    show_menu
    choice="$MENU_CHOICE"
    case "$choice" in
        1) install_theme ;;
        2) update_theme ;;
        3) uninstall_theme ;;
        4) show_commit_history ;;
        5) check_for_updates ;;
        6) running=0 ;;
        *)
            show_header
            printf '%s  Invalid option.%s\n' "$RED" "$RESET"
            pause_return
            ;;
    esac
done

clear