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
    printf '%s                          Installer%s\n' "$ORANGE_MID" "$RESET"
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

REPO_OWNER="SkenSMasteR"
REPO_NAME="SpoTUI"
API_LATEST="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest"

TARGET_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/spotui"
BIN_PATH="${TARGET_DIR}/spotui"
LAUNCHER_PATH="${TARGET_DIR}/spotui.sh"

get_target_asset_name() {
    local arch
    arch=$(uname -m)
    case "$arch" in
        aarch64|arm64) echo "spotui-linux-arm64" ;;
        x86_64|amd64)  echo "spotui-linux-amd64" ;;
        i386|i686)     echo "spotui-linux-386" ;;
        *)             echo "spotui-linux-amd64" ;;
    esac
}

get_asset_names() {
    printf '%s' "$RELEASE_JSON" | jq -r '.assets[].name'
}

arch_keywords() {
    local arch
    arch=$(uname -m)
    case "$arch" in
        aarch64|arm64) echo "arm64 aarch64" ;;
        x86_64|amd64)  echo "amd64 x86_64" ;;
        i386|i686)     echo "386 i686 i386" ;;
        *)             echo "" ;;
    esac
}

select_asset_name() {
    local preferred
    preferred=$(get_target_asset_name)
    local names
    names=$(get_asset_names)

    if printf '%s\n' "$names" | grep -qxF "$preferred"; then
        echo "$preferred"
        return 0
    fi

    local kw
    for kw in $(arch_keywords); do
        local match
        match=$(printf '%s\n' "$names" | grep -i 'linux' | grep -i "$kw" | head -n 1)
        if [ -n "$match" ]; then
            echo "$match"
            return 0
        fi
    done

    local linux_only
    linux_only=$(printf '%s\n' "$names" | grep -i 'linux')
    if [ "$(printf '%s\n' "$linux_only" | grep -c .)" -eq 1 ]; then
        echo "$linux_only"
        return 0
    fi

    return 1
}

need_cmd() {
    command -v "$1" >/dev/null 2>&1
}

if ! need_cmd curl; then
    echo "  ${RED_ANSI}${CROSS_MARK}${RESET}  This installer requires curl. Please install it and re-run."
    exit 1
fi
if ! need_cmd jq; then
    echo "  ${RED_ANSI}${CROSS_MARK}${RESET}  This installer requires jq. Please install it and re-run."
    exit 1
fi

OK=1
RELEASE_JSON=""
ASSET_NAME=""
ASSET_URL=""
ASSET_SIZE=""
ASSET_DIGEST=""
LATEST_TAG=""
RELEASE_BODY=""

if invoke_step "Looking up latest release" bash -c "curl -fsSL -H 'User-Agent: SpoTUI-Installer' '$API_LATEST'"; then
    RELEASE_JSON="$STEP_OUTPUT"
else
    OK=0
fi
rm -f "$STEP_FILE"

if [ "$OK" -eq 1 ]; then
    LATEST_TAG=$(printf '%s' "$RELEASE_JSON" | jq -r '.tag_name')
    RELEASE_BODY=$(printf '%s' "$RELEASE_JSON" | jq -r '.body // ""')
    ASSET_NAME=$(select_asset_name)

    if [ -z "$ASSET_NAME" ]; then
        echo ""
        echo "  ${RED_ANSI}${CROSS_MARK}${RESET}  No suitable Linux asset found in release ${LATEST_TAG}."
        echo "  ${GRAY_ANSI}   Assets published in this release:${RESET}"
        get_asset_names | sed 's/^/     - /'
        OK=0
    else
        ASSET_JSON=$(printf '%s' "$RELEASE_JSON" | jq -c --arg name "$ASSET_NAME" '.assets[] | select(.name == $name)' | head -n 1)
        ASSET_URL=$(printf '%s' "$ASSET_JSON" | jq -r '.browser_download_url')
        ASSET_SIZE=$(printf '%s' "$ASSET_JSON" | jq -r '.size')
        ASSET_DIGEST=$(printf '%s' "$ASSET_JSON" | jq -r '.digest // ""')
    fi
fi

if [ "$OK" -eq 1 ]; then
    size_mb=$(awk -v b="$ASSET_SIZE" 'BEGIN { printf "%.2f", b / 1048576 }')
    echo ""
    echo "${ORANGE_MID}  Latest version: ${LATEST_TAG}${RESET}"
    echo "${GRAY_ANSI}  Asset: ${ASSET_NAME}  (${size_mb} MB)${RESET}"
    echo ""
fi

get_expected_hash() {
    local digest="$1" name="$2" body="$3"
    if [[ "$digest" =~ ^sha256:([a-fA-F0-9]{64})$ ]]; then
        echo "${BASH_REMATCH[1],,}"
        return 0
    fi
    if [ -z "$body" ]; then
        return 1
    fi
    local escaped
    escaped=$(printf '%s' "$name" | sed 's/[.[\*^$/]/\\&/g')
    local match
    match=$(printf '%s' "$body" | grep -Pzo "(?s)${escaped}.{0,200}?\\b([a-fA-F0-9]{64})\\b" 2>/dev/null | grep -Pao '[a-fA-F0-9]{64}' | head -n 1)
    if [ -n "$match" ]; then
        echo "${match,,}"
        return 0
    fi
    return 1
}

DOWNLOAD_PATH=""

if [ "$OK" -eq 1 ]; then
    if invoke_step "Creating install directory" mkdir -p "$TARGET_DIR"; then
        :
    else
        OK=0
    fi
    rm -f "$STEP_FILE"
fi

if [ "$OK" -eq 1 ]; then
    DOWNLOAD_PATH="${TARGET_DIR}/${ASSET_NAME}"
    if invoke_step "Downloading ${ASSET_NAME}" curl -fsSL -o "$DOWNLOAD_PATH" "$ASSET_URL"; then
        :
    else
        OK=0
    fi
    rm -f "$STEP_FILE"
fi

if [ "$OK" -eq 1 ]; then
    EXPECTED_HASH=$(get_expected_hash "$ASSET_DIGEST" "$ASSET_NAME" "$RELEASE_BODY") || EXPECTED_HASH=""
    if [ -n "$EXPECTED_HASH" ]; then
        if invoke_step "Verifying SHA256 checksum" bash -c "
            actual=\$(sha256sum '$DOWNLOAD_PATH' | awk '{print \$1}')
            actual=\$(printf '%s' \"\$actual\" | tr '[:upper:]' '[:lower:]')
            if [ \"\$actual\" != '$EXPECTED_HASH' ]; then
                echo \"Checksum mismatch. Expected $EXPECTED_HASH but got \$actual. Aborting - file was not installed.\" >&2
                exit 1
            fi
        "; then
            echo "${GRAY_ANSI}  SHA256: ${EXPECTED_HASH}${RESET}"
            echo ""
        else
            OK=0
        fi
        rm -f "$STEP_FILE"
    else
        echo ""
        echo "  ${RED_ANSI}!${RESET}  No published checksum found for this asset in the release notes."
        echo "     ${GRAY_ANSI}You can verify it manually at:${RESET}"
        echo "     ${GRAY_ANSI}https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${LATEST_TAG}${RESET}"
        read -r -p "  Type Y to continue installing anyway, or anything else to cancel: " CONFIRM
        if [ "$CONFIRM" != "Y" ] && [ "$CONFIRM" != "y" ]; then
            OK=0
        fi
    fi
fi

if [ "$OK" -eq 1 ]; then
    if invoke_step "Installing spotui" bash -c "cp -f '$DOWNLOAD_PATH' '$BIN_PATH' && chmod +x '$BIN_PATH' && rm -f '$DOWNLOAD_PATH'"; then
        :
    else
        OK=0
    fi
    rm -f "$STEP_FILE"
fi

if [ "$OK" -eq 1 ]; then
    if invoke_step "Updating PATH" bash -c "
        for rc in \"\$HOME/.bashrc\" \"\$HOME/.profile\" \"\$HOME/.zshrc\"; do
            if [ -f \"\$rc\" ] && ! grep -qF '$TARGET_DIR' \"\$rc\" 2>/dev/null; then
                printf '\n# Added by SpoTUI installer\nexport PATH=\"\$PATH:$TARGET_DIR\"\n' >> \"\$rc\"
            fi
        done
    "; then
        :
    else
        OK=0
    fi
    rm -f "$STEP_FILE"
    export PATH="$PATH:$TARGET_DIR"
fi

if [ "$OK" -eq 1 ]; then
    if invoke_step "Creating launcher" bash -c "
        printf '#!/usr/bin/env bash\nexec \"$BIN_PATH\" \"\$@\"\n' > '$LAUNCHER_PATH'
        chmod +x '$LAUNCHER_PATH'
    "; then
        :
    else
        OK=0
    fi
    rm -f "$STEP_FILE"
fi

echo ""
echo "${ORANGE_DARK}  =============================================================${RESET}"
echo ""

if [ "$OK" -eq 1 ]; then
    echo "  ${GREEN_ANSI}${CHECK_MARK}  SpoTUI ${LATEST_TAG} installed successfully.${RESET}"
    echo "  ${GRAY_ANSI}   Open a new terminal and run: spotui${RESET}"
else
    echo "  ${RED_ANSI}${CROSS_MARK}  Installation finished with errors. See above.${RESET}"
fi

echo ""