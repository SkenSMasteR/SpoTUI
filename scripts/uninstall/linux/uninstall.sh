#!/usr/bin/env bash

set -u

ESC=$'\033'
RESET="${ESC}[0m"

BLOCK_FULL=$'\xe2\x96\x88'   # U+2588
BLOCK_LOWER=$'\xe2\x96\x84'  # U+2584
BLOCK_UPPER=$'\xe2\x96\x80'  # U+2580
BLOCK_LEFT=$'\xe2\x96\x8c'   # U+258C

rgb() {
    printf '%s[38;2;%d;%d;%dm' "$ESC" "$1" "$2" "$3"
}

ORANGE_LIGHT=$(rgb 255 140 66)
ORANGE_DARK=$(rgb 224 123 57)
ORANGE_MID=$(rgb 240 131 61)
GREEN_ANSI=$(rgb 140 255 140)
RED_ANSI=$(rgb 255 110 110)
GRAY_ANSI=$(rgb 130 130 130)

gradient_color() {
    local index=$1 total=$2
    local r1=255 g1=140 b1=66
    local r2=224 g2=123 b2=57
    local t_num=$index t_den=$((total - 1))
    if [ "$t_den" -le 0 ]; then t_den=1; t_num=0; fi
    local r=$(( r1 + (r2 - r1) * t_num / t_den ))
    local g=$(( g1 + (g2 - g1) * t_num / t_den ))
    local b=$(( b1 + (b2 - b1) * t_num / t_den ))
    rgb "$r" "$g" "$b"
}

ascii_art_line() {
    local line="$1"
    line="${line//A/$BLOCK_FULL}"
    line="${line//B/$BLOCK_LOWER}"
    line="${line//C/$BLOCK_UPPER}"
    line="${line//D/$BLOCK_LEFT}"
    printf '%s' "$line"
}

show_header() {
    clear
    local templates=(
        "   BAAAAAAAA    BAAAAAAAB  BAAAAAAAB      AAA    AAA    AB   BA  "
        "  AAA    AAA   AAA    AAA AAA    AAA CAAAAAAAAAB AAA    AAA AAA  "
        "  AAA    AC    AAA    AAA AAA    AAA    CAAACCAA AAA    AAA AAAD "
        "  AAA          AAA    AAA AAA    AAA     AAA   C AAA    AAA AAAD "
        "CAAAAAAAAAAA CAAAAAAAAAC  AAA    AAA     AAA     AAA    AAA AAAD "
        "         AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  "
        "   BA    AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  "
        " BAAAAAAAAC   BAAAAC       CAAAAAAC     BAAAAC   AAAAAAAAC  AC   "
    )
    local count=${#templates[@]}
    echo ""
    local i
    for ((i = 0; i < count; i++)); do
        local color
        color=$(gradient_color "$i" "$count")
        local line
        line=$(ascii_art_line "${templates[$i]}")
        printf '%s%s%s\n' "$color" "$line" "$RESET"
    done
    echo ""
    printf '%s                          Uninstaller%s\n' "$ORANGE_MID" "$RESET"
    printf '%s  =============================================================%s\n' "$ORANGE_DARK" "$RESET"
    echo ""
}

SPINNER_CODES=(0x280B 0x2819 0x2839 0x2838 0x283C 0x2834 0x2826 0x2827 0x2807 0x280F)
SPINNER_FRAMES=()
for code in "${SPINNER_CODES[@]}"; do
    SPINNER_FRAMES+=("$(printf "\\U$(printf '%08x' "$code")")")
done
CHECK_MARK=$'\xe2\x9c\x93'  # U+2713
CROSS_MARK=$'\xe2\x9c\x95'  # U+2715
CR=$'\r'

STEP_OUTPUT=""
STEP_FILE=""

invoke_step() {
    local label="$1"; shift
    local out_file err_file
    out_file=$(mktemp)
    err_file=$(mktemp)

    ("$@") >"$out_file" 2>"$err_file" &
    local job_pid=$!

    local frame_index=0
    tput civis 2>/dev/null

    while kill -0 "$job_pid" 2>/dev/null; do
        local frame="${SPINNER_FRAMES[$((frame_index % ${#SPINNER_FRAMES[@]}))]}"
        local color
        color=$(gradient_color $((frame_index % 8)) 8)
        printf '%s  %s%s%s  %s' "$CR" "$color" "$frame" "$RESET" "$label"
        sleep 0.08
        frame_index=$((frame_index + 1))
    done

    wait "$job_pid"
    local exit_code=$?
    local failed=0
    if [ "$exit_code" -ne 0 ]; then failed=1; fi

    local pad
    pad=$(printf ' %.0s' {1..40})
    if [ "$failed" -eq 1 ]; then
        printf '%s  %s%s%s  %s%s\n' "$CR" "$RED_ANSI" "$CROSS_MARK" "$RESET" "$label" "$pad"
        if [ -s "$err_file" ]; then
            printf '      %s%s%s\n' "$RED_ANSI" "$(cat "$err_file")" "$RESET"
        fi
    else
        printf '%s  %s%s%s  %s%s\n' "$CR" "$GREEN_ANSI" "$CHECK_MARK" "$RESET" "$label" "$pad"
    fi

    tput cnorm 2>/dev/null

    STEP_OUTPUT=$(cat "$out_file")
    STEP_FILE="$out_file"
    rm -f "$err_file"
    return "$failed"
}

show_header

XDG_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
TARGET_DIRS=("${XDG_HOME}/spotui" "${XDG_HOME}/spotui-cli")

clean_user_path() {
    local rc tmp pat
    for rc in "$HOME/.bashrc" "$HOME/.profile" "$HOME/.zshrc"; do
        [ -f "$rc" ] || continue
        tmp=$(mktemp)
        cp "$rc" "$tmp"
        for pat in '# Added by SpoTUI installer' "${TARGET_DIRS[@]}"; do
            grep -vF -- "$pat" "$tmp" > "$tmp.tmp" 2>/dev/null || true
            mv "$tmp.tmp" "$tmp"
        done
        mv "$tmp" "$rc"
        rm -f "$tmp.tmp"
    done
}

filter_path() {
    local path_str="$1"
    local keep="" entry dir
    while IFS= read -r entry; do
        [ -z "$entry" ] && continue
        entry="${entry%/}"
        for dir in "${TARGET_DIRS[@]}"; do
            if [ "$entry" = "${dir%/}" ]; then
                continue 2
            fi
        done
        keep="${keep:+$keep:}$entry"
    done <<< "$(printf '%s' "$path_str" | tr ':' '\n')"
    printf '%s' "$keep"
}

OK=1

for dir in "${TARGET_DIRS[@]}"; do
    if invoke_step "Removing $dir" bash -c "rm -rf -- '$dir'"; then
        :
    else
        OK=0
    fi
    rm -f "$STEP_FILE"
done

if invoke_step "Cleaning user PATH" clean_user_path; then
    :
else
    OK=0
fi
rm -f "$STEP_FILE"

PATH=$(filter_path "$PATH")

echo ""
echo "${ORANGE_DARK}  =============================================================${RESET}"
echo ""

if [ "$OK" -eq 1 ]; then
    echo "  ${GREEN_ANSI}${CHECK_MARK}  SpoTUI has been uninstalled.${RESET}"
    echo "  ${GRAY_ANSI}   Restart your terminal for PATH changes to take full effect.${RESET}"
else
    echo "  ${RED_ANSI}${CROSS_MARK}  Uninstall finished with errors. See above.${RESET}"
fi

echo ""
