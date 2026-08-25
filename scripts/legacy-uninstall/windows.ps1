$Esc   = [char]27
$Reset = "$Esc[0m"

$BlockFull  = [char]0x2588
$BlockLower = [char]0x2584
$BlockUpper = [char]0x2580
$BlockLeft  = [char]0x258C

function Enable-VTMode {
    $sig = @"
using System;
using System.Runtime.InteropServices;
public static class SpoTUIUninstallerNative {
    [DllImport("kernel32.dll")]
    public static extern IntPtr GetStdHandle(int nStdHandle);
    [DllImport("kernel32.dll")]
    public static extern bool GetConsoleMode(IntPtr hConsoleHandle, out uint lpMode);
    [DllImport("kernel32.dll")]
    public static extern bool SetConsoleMode(IntPtr hConsoleHandle, uint dwMode);
}
"@
    try {
        Add-Type -TypeDefinition $sig -ErrorAction SilentlyContinue
        $handle = [SpoTUIUninstallerNative]::GetStdHandle(-11)
        $mode = 0
        [SpoTUIUninstallerNative]::GetConsoleMode($handle, [ref]$mode) | Out-Null
        [SpoTUIUninstallerNative]::SetConsoleMode($handle, $mode -bor 0x0004) | Out-Null
    } catch {}
}
Enable-VTMode

try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

$ProgressPreference = 'SilentlyContinue'

function Get-RGBCode($r, $g, $b) {
    return "$Esc[38;2;$r;$g;${b}m"
}

$OrangeLight = Get-RGBCode 255 140 66
$OrangeDark  = Get-RGBCode 224 123 57
$OrangeMid   = Get-RGBCode 240 131 61
$GreenAnsi   = Get-RGBCode 140 255 140
$RedAnsi     = Get-RGBCode 255 110 110
$GrayAnsi    = Get-RGBCode 130 130 130

function Get-GradientColor($index, $total) {
    $r1 = 255; $g1 = 140; $b1 = 66
    $r2 = 224; $g2 = 123; $b2 = 57
    $t = if ($total -le 1) { 0 } else { $index / ($total - 1) }
    $r = [int]($r1 + ($r2 - $r1) * $t)
    $g = [int]($g1 + ($g2 - $g1) * $t)
    $b = [int]($b1 + ($b2 - $b1) * $t)
    return Get-RGBCode $r $g $b
}

function Get-AsciiArtLine($template) {
    $out = $template
    $out = $out.Replace("A", $BlockFull)
    $out = $out.Replace("B", $BlockLower)
    $out = $out.Replace("C", $BlockUpper)
    $out = $out.Replace("D", $BlockLeft)
    return $out
}

function Show-Header {
    Clear-Host
    $templates = @(
        "   BAAAAAAAA    BAAAAAAAB  BAAAAAAAB      AAA    AAA    AB   BA  ",
        "  AAA    AAA   AAA    AAA AAA    AAA CAAAAAAAAAB AAA    AAA AAA  ",
        "  AAA    AC    AAA    AAA AAA    AAA    CAAACCAA AAA    AAA AAAD ",
        "  AAA          AAA    AAA AAA    AAA     AAA   C AAA    AAA AAAD ",
        "CAAAAAAAAAAA CAAAAAAAAAC  AAA    AAA     AAA     AAA    AAA AAAD ",
        "         AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  ",
        "   BA    AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  ",
        " BAAAAAAAAC   BAAAAC       CAAAAAAC     BAAAAC   AAAAAAAAC  AC   "
    )
    Write-Host ""
    for ($i = 0; $i -lt $templates.Count; $i++) {
        $color = Get-GradientColor $i $templates.Count
        $line = Get-AsciiArtLine $templates[$i]
        Write-Host "$color$line$Reset"
    }
    Write-Host ""
    Write-Host "$OrangeMid                         Uninstaller$Reset"
    Write-Host "$OrangeDark  =============================================================$Reset"
    Write-Host ""
}

$SpinnerCodes = @(0x280B,0x2819,0x2839,0x2838,0x283C,0x2834,0x2826,0x2827,0x2807,0x280F)
$SpinnerFrames = $SpinnerCodes | ForEach-Object { [char]$_ }
$CheckMark = [char]0x2713
$CrossMark = [char]0x2715
$CR = [char]13

function Invoke-Step {
    param(
        [string]$Label,
        [scriptblock]$Work
    )

    try { [Console]::CursorVisible = $false } catch {}

    $job = Start-Job -ScriptBlock $Work
    $frameIndex = 0

    while ($job.State -eq "Running") {
        $frame = $SpinnerFrames[$frameIndex % $SpinnerFrames.Count]
        $color = Get-GradientColor ($frameIndex % 8) 8
        Write-Host ($CR + "  " + $color + $frame + $Reset + "  " + $Label) -NoNewline
        Start-Sleep -Milliseconds 80
        $frameIndex++
    }

    Receive-Job -Job $job | Out-Null
    $failed = $job.State -eq "Failed" -or ($job.ChildJobs[0].Error.Count -gt 0)
    Remove-Job -Job $job -Force | Out-Null

    $pad = " " * 40
    if ($failed) {
        Write-Host ($CR + "  " + $RedAnsi + $CrossMark + $Reset + "  " + $Label + $pad)
    }
    else {
        Write-Host ($CR + "  " + $GreenAnsi + $CheckMark + $Reset + "  " + $Label + $pad)
    }

    try { [Console]::CursorVisible = $true } catch {}
    return -not $failed
}

Show-Header

$targetDirs = @("$env:APPDATA\spotui", "$env:APPDATA\spotui-cli")

$ok = $true

foreach ($dir in $targetDirs) {
    $ok = (Invoke-Step ("Removing " + $dir) {
        if (Test-Path $using:dir) {
            Remove-Item -Path $using:dir -Recurse -Force
        }
    }) -and $ok
}

$ok = (Invoke-Step "Cleaning user PATH" {
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $entries = $userPath -split ';' | Where-Object { $_ -and ($using:targetDirs -notcontains $_) }
    $userPath = $entries -join ';'
    [Environment]::SetEnvironmentVariable("Path", $userPath, "User")
}) -and $ok

$env:Path = ($env:Path -split ';' | Where-Object { $_ -and ($targetDirs -notcontains $_) }) -join ';'

Write-Host ""
Write-Host "$OrangeDark  =============================================================$Reset"
Write-Host ""

if ($ok) {
    Write-Host ("  " + $GreenAnsi + $CheckMark + "  SpoTUI has been uninstalled." + $Reset)
    Write-Host ("  " + $GrayAnsi + "   Restart your terminal for PATH changes to take full effect." + $Reset)
}
else {
    Write-Host ("  " + $RedAnsi + $CrossMark + "  Uninstall finished with errors. See above." + $Reset)
}

Write-Host ""