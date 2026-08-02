$ThemeName   = "SpoTUI"
$RepoUrl     = "https://github.com/SkenSMasteR/SpoTUI"
$ThemesDir   = Join-Path $env:APPDATA "spicetify\Themes"
$ThemePath   = Join-Path $ThemesDir $ThemeName

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
public static class SpoTUINative {
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
        $handle = [SpoTUINative]::GetStdHandle(-11)
        $mode = 0
        [SpoTUINative]::GetConsoleMode($handle, [ref]$mode) | Out-Null
        [SpoTUINative]::SetConsoleMode($handle, $mode -bor 0x0004) | Out-Null
    } catch {}
}
Enable-VTMode

try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

function Get-RGBCode($r, $g, $b) {
    return "$Esc[38;2;$r;$g;${b}m"
}

$OrangeLight = Get-RGBCode 255 140 66
$OrangeDark  = Get-RGBCode 224 123 57
$OrangeMid   = Get-RGBCode 240 131 61

$White = "White"
$Gray  = "DarkGray"
$Red   = "Red"
$Green = "Green"

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
    Write-Host ""
    $templates = @(
        "   BAAAAAAAA    BAAAAAAAB  BAAAAAAAB      AAA     AAA    AB   BA  ",
        "  AAA    AAA   AAA    AAA AAA    AAA CAAAAAAAAAB AAA    AAA AAA  ",
        "  AAA    AC    AAA    AAA AAA    AAA    CAAACCAA AAA    AAA AAAD ",
        "  AAA          AAA    AAA AAA    AAA     AAA   C AAA    AAA AAAD ",
        "CAAAAAAAAAAA CAAAAAAAAAC  AAA    AAA     AAA     AAA    AAA AAAD ",
        "         AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  ",
        "   BA    AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  ",
        " BAAAAAAAAC   BAAAAC       CAAAAAAC     BAAAAC   AAAAAAAAC  AC   "
    )
    for ($i = 0; $i -lt $templates.Count; $i++) {
        $color = Get-GradientColor $i $templates.Count
        $line = Get-AsciiArtLine $templates[$i]
        Write-Host "$color$line$Reset"
    }
    Write-Host ""
    Write-Host "$OrangeMid                     Spicetify Theme Manager$Reset"
    Write-Host "$OrangeDark  =============================================================$Reset"
    Write-Host ""
}

function Test-Dependencies {
    $missing = @()
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { $missing += "git" }
    if (-not (Get-Command spicetify -ErrorAction SilentlyContinue)) { $missing += "spicetify" }
    if ($missing.Count -gt 0) {
        Write-Host "  Missing dependencies: $($missing -join ', ')" -ForegroundColor $Red
        Write-Host "  Please install them before continuing." -ForegroundColor $Gray
        return $false
    }
    return $true
}

function Get-ThemeStatus {
    if (Test-Path $ThemePath) {
        return "Installed"
    }
    return "Not Installed"
}

function Install-Theme {
    Show-Header
    Write-Host "$OrangeLight  Installing $ThemeName...$Reset"
    Write-Host ""

    if (-not (Test-Dependencies)) {
        Pause-Return
        return
    }

    if (-not (Test-Path $ThemesDir)) {
        New-Item -ItemType Directory -Path $ThemesDir -Force | Out-Null
    }

    if (Test-Path $ThemePath) {
        Write-Host "$OrangeMid  Theme already exists locally. Pulling latest changes...$Reset"
        Push-Location $ThemePath
        git pull
        Pop-Location
    }
    else {
        Push-Location $ThemesDir
        git clone $RepoUrl $ThemeName
        Pop-Location
    }

    if (Test-Path $ThemePath) {
        Write-Host ""
        Write-Host "$OrangeMid  Setting current theme to $ThemeName...$Reset"
        spicetify config current_theme $ThemeName

        Write-Host "$OrangeMid  Applying Spicetify...$Reset"
        spicetify apply

        Write-Host ""
        Write-Host "  $ThemeName installed and applied successfully." -ForegroundColor $Green
    }
    else {
        Write-Host ""
        Write-Host "  Installation failed. Check the errors above." -ForegroundColor $Red
    }

    Pause-Return
}

function Update-Theme {
    Show-Header
    Write-Host "$OrangeLight  Updating $ThemeName...$Reset"
    Write-Host ""

    if (-not (Test-Path $ThemePath)) {
        Write-Host "  $ThemeName is not installed. Use Install instead." -ForegroundColor $Red
        Pause-Return
        return
    }

    if (-not (Test-Dependencies)) {
        Pause-Return
        return
    }

    Push-Location $ThemePath
    git pull
    Pop-Location

    Write-Host ""
    Write-Host "$OrangeMid  Re-applying Spicetify...$Reset"
    spicetify apply

    Write-Host ""
    Write-Host "  $ThemeName updated successfully." -ForegroundColor $Green
    Pause-Return
}

function Uninstall-Theme {
    Show-Header
    Write-Host "$OrangeLight  Uninstalling $ThemeName...$Reset"
    Write-Host ""

    if (-not (Test-Path $ThemePath)) {
        Write-Host "  $ThemeName is not installed." -ForegroundColor $Red
        Pause-Return
        return
    }

    Write-Host "  This will remove the theme folder and switch to Marketplace." -ForegroundColor $Gray
    $confirm = Read-Host "  Type Y to confirm"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "  Cancelled." -ForegroundColor $Gray
        Pause-Return
        return
    }

    if (Get-Command spicetify -ErrorAction SilentlyContinue) {
        Write-Host "$OrangeMid  Switching Spicetify theme...$Reset"
        spicetify config current_theme SpoTUI-
        spicetify config current_theme marketplace
        spicetify apply
    }

    Remove-Item -Path $ThemePath -Recurse -Force

    Write-Host ""
    Write-Host "  $ThemeName has been uninstalled." -ForegroundColor $Green
    Pause-Return
}

function Pause-Return {
    Write-Host ""
    Write-Host "  Press any key to return to the menu..." -ForegroundColor $Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-Menu {
    Show-Header
    $status = Get-ThemeStatus
    $statusColor = if ($status -eq "Installed") { $Green } else { $Red }

    Write-Host "  Status: " -NoNewline -ForegroundColor $White
    Write-Host $status -ForegroundColor $statusColor
    Write-Host ""
    Write-Host "  [1] Install $ThemeName"   -ForegroundColor $White
    Write-Host "  [2] Update $ThemeName"    -ForegroundColor $White
    Write-Host "  [3] Uninstall $ThemeName" -ForegroundColor $White
    Write-Host "  [4] Exit"                 -ForegroundColor $White
    Write-Host ""
    Write-Host "$OrangeDark  =============================================================$Reset"
    Write-Host ""
    $choice = Read-Host "  Select an option"
    return $choice
}

$running = $true
while ($running) {
    $choice = Show-Menu
    switch ($choice) {
        "1" { Install-Theme }
        "2" { Update-Theme }
        "3" { Uninstall-Theme }
        "4" { $running = $false }
        default {
            Show-Header
            Write-Host "  Invalid option." -ForegroundColor $Red
            Pause-Return
        }
    }
}

Clear-Host