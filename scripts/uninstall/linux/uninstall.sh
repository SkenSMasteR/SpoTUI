#!/usr/bin/env bash
grep -q $'\r' "$0" 2>/dev/null && tr -d '\r' < "$0" > "$0.lf" && chmod +x "$0.lf" && exec bash "$0.lf" "$@"

Esc=$'\033'
Reset="${Esc}[0m"

BlockFull=$'\u2588'
BlockLower=$'\u2584'
BlockUpper=$'\u2580'
BlockLeft=$'\u258C'

get_rgb() {
    local r=$1 g=$2 b=$3
    echo "${Esc}[38;2;${r};${g};${b}m"
}

OrangeLight=$(get_rgb 255 140 66)
OrangeDark=$(get_rgb 224 123 57)
OrangeMid=$(get_rgb 240 131 61)
GreenAnsi=$(get_rgb 140 255 140)
RedAnsi=$(get_rgb 255 110 110)
GrayAnsi=$(get_rgb 130 130 130)

get_gradient_color() {
    local index=$1 total=$2
    local r1=255 g1=140 b1=66
    local r2=224 g2=123 b2=57
    local t=0
    if [ "$total" -gt 1 ]; then
        t=$(awk -v i="$index" -v t="$total" 'BEGIN { printf "%.6f", i/(t-1) }')
    fi
    local r g b
    r=$(awk -v r1="$r1" -v r2="$r2" -v t="$t" 'BEGIN { printf "%d", r1+(r2-r1)*t }')
    g=$(awk -v g1="$g1" -v g2="$g2" -v t="$t" 'BEGIN { printf "%d", g1+(g2-g1)*t }')
    b=$(awk -v b1="$b1" -v b2="$b2" -v t="$t" 'BEGIN { printf "%d", b1+(b2-b1)*t }')
    get_rgb "$r" "$g" "$b"
}

get_ascii_art_line() {
    local out="$1"
    out="${out//A/$BlockFull}"
    out="${out//B/$BlockLower}"
    out="${out//C/$BlockUpper}"
    out="${out//D/$BlockLeft}"
    echo "$out"
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
    echo ""
    local total=${#templates[@]}
    local i=0
    for tmpl in "${templates[@]}"; do
        local color
        color=$(get_gradient_color "$i" "$total")
        local line
        line=$(get_ascii_art_line "$tmpl")
        echo "${color}${line}${Reset}"
        i=$((i + 1))
    done
    echo ""
    echo "${OrangeMid}                         Uninstaller${Reset}"
    echo "${OrangeDark}  =============================================================${Reset}"
    echo ""
}

SpinnerFrames=($'\u280B' $'\u2819' $'\u2839' $'\u2838' $'\u283C' $'\u2834' $'\u2826' $'\u2827' $'\u2807' $'\u280F')
CheckMark=$'\u2713'
CrossMark=$'\u2715'
CR=$'\r'

invoke_step() {
    local label="$1"
    local workfn="$2"

    tput civis 2>/dev/null

    local tmpfile
    tmpfile=$(mktemp)
    "$workfn" >"$tmpfile" 2>&1 &
    local pid=$!

    local frameIndex=0
    while kill -0 "$pid" 2>/dev/null; do
        local frame="${SpinnerFrames[$((frameIndex % ${#SpinnerFrames[@]}))]}"
        local color
        color=$(get_gradient_color $((frameIndex % 8)) 8)
        printf "%s  %s%s%s  %s" "$CR" "$color" "$frame" "$Reset" "$label"
        sleep 0.08
        frameIndex=$((frameIndex + 1))
    done

    wait "$pid"
    local status=$?
    rm -f "$tmpfile"

    local pad
    pad=$(printf ' %.0s' {1..40})
    if [ "$status" -ne 0 ]; then
        printf "%s  %s%s%s  %s%s\n" "$CR" "$RedAnsi" "$CrossMark" "$Reset" "$label" "$pad"
    else
        printf "%s  %s%s%s  %s%s\n" "$CR" "$GreenAnsi" "$CheckMark" "$Reset" "$label" "$pad"
    fi

    tput cnorm 2>/dev/null
    return $status
}

show_header

targetDirs=("$HOME/.local/share/spotui" "$HOME/.local/share/spotui-cli")
binPath="$HOME/.local/bin/spotui"

ok=true

for dir in "${targetDirs[@]}"; do
    remove_dir() {
        if [ -d "$dir" ]; then
            rm -rf "$dir"
        fi
    }
    invoke_step "Removing $dir" remove_dir || ok=false
done

remove_bin() {
    if [ -f "$binPath" ]; then
        rm -f "$binPath"
    fi
}
invoke_step "Removing $binPath" remove_bin || ok=false

clean_path() {
    local profileFile
    for profileFile in "$HOME/.bashrc" "$HOME/.zshrc"; do
        if [ -f "$profileFile" ]; then
            for dir in "${targetDirs[@]}" "$HOME/.local/bin"; do
                sed -i "\#export PATH=\"\$PATH:$dir\"#d" "$profileFile"
            done
        fi
    done
}
invoke_step "Cleaning PATH" clean_path || ok=false

echo ""
echo "${OrangeDark}  =============================================================${Reset}"
echo ""

if $ok; then
    echo "  ${GreenAnsi}${CheckMark}  SpoTUI has been uninstalled.${Reset}"
    echo "  ${GrayAnsi}   Restart your terminal for PATH changes to take full effect.${Reset}"
else
    echo "  ${RedAnsi}${CrossMark}  Uninstall finished with errors. See above.${Reset}"
fi

echo ""