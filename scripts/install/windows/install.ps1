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

$SelectBg = "$Esc[48;2;255;140;66m$Esc[38;2;0;0;0m"

$White = "White"
$Gray  = "DarkGray"
$Red   = "Red"
$Green = "Green"
$Cyan  = "Cyan"

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

function Get-DefaultBranch {
    Push-Location $ThemePath
    $ref = git symbolic-ref refs/remotes/origin/HEAD 2>$null
    Pop-Location
    if ($ref) {
        $parts = $ref -split "/"
        return $parts[$parts.Count - 1]
    }
    return "main"
}

function Test-IsDetached {
    Push-Location $ThemePath
    git symbolic-ref -q HEAD | Out-Null
    $attached = $?
    Pop-Location
    return -not $attached
}

function Get-ThemeStatusDetailed {
    if (-not (Test-Path $ThemePath)) {
        return @{ Text = "Not Installed"; Color = $Red }
    }

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        return @{ Text = "Installed"; Color = $Green }
    }

    Push-Location $ThemePath
    git fetch origin --quiet 2>$null
    $localHash = (git rev-parse HEAD 2>$null)
    Pop-Location

    if (Test-IsDetached) {
        $shortHash = if ($localHash) { $localHash.Substring(0, 7) } else { "unknown" }
        return @{ Text = "Installed (custom commit $shortHash)"; Color = $Cyan }
    }

    $branch = Get-DefaultBranch
    Push-Location $ThemePath
    $remoteHash = (git rev-parse "origin/$branch" 2>$null)
    Pop-Location

    if (-not $localHash -or -not $remoteHash) {
        return @{ Text = "Installed"; Color = $Green }
    }

    if ($localHash -eq $remoteHash) {
        return @{ Text = "Installed (up to date)"; Color = $Green }
    }

    return @{ Text = "Installed (outdated)"; Color = $Red }
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

    if (Test-IsDetached) {
        $branch = Get-DefaultBranch
        Write-Host "$OrangeMid  Currently on a custom commit. Returning to $branch...$Reset"
        Push-Location $ThemePath
        git checkout $branch --quiet
        Pop-Location
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

function Read-ArrowSelection {
    param(
        [string[]]$Items,
        [int]$CurrentIndex = -1,
        [scriptblock]$HeaderRenderer
    )

    $selectedIndex = 0
    if ($CurrentIndex -ge 0) { $selectedIndex = $CurrentIndex }

    while ($true) {
        & $HeaderRenderer

        for ($i = 0; $i -lt $Items.Count; $i++) {
            $prefix = if ($i -eq $CurrentIndex) { "> " } else { "  " }
            $text = "$prefix$($Items[$i])"

            if ($i -eq $selectedIndex) {
                Write-Host "$SelectBg $text $Reset"
            }
            elseif ($i -eq $CurrentIndex) {
                Write-Host $text -ForegroundColor $Green
            }
            else {
                Write-Host $text -ForegroundColor $White
            }
        }

        Write-Host ""
        Write-Host "$OrangeDark  =============================================================$Reset"
        Write-Host "  Up/Down to move, Enter to select, Esc to go back" -ForegroundColor $Gray

        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        $code = $key.VirtualKeyCode

        if ($code -eq 38) {
            if ($selectedIndex -gt 0) { $selectedIndex-- } else { $selectedIndex = $Items.Count - 1 }
        }
        elseif ($code -eq 40) {
            if ($selectedIndex -lt $Items.Count - 1) { $selectedIndex++ } else { $selectedIndex = 0 }
        }
        elseif ($code -eq 13) {
            return $selectedIndex
        }
        elseif ($code -eq 27) {
            return -1
        }
    }
}

function Get-CommitList {
    Push-Location $ThemePath
    git fetch origin --quiet 2>$null
    $rawLog = git log --all --pretty=format:"%H|%h|%ad|%s" --date=short
    Pop-Location

    $commits = @()
    foreach ($line in $rawLog) {
        $parts = $line -split "\|", 4
        if ($parts.Count -eq 4) {
            $commits += [PSCustomObject]@{
                FullHash  = $parts[0]
                ShortHash = $parts[1]
                Date      = $parts[2]
                Subject   = $parts[3]
            }
        }
    }
    return $commits
}

function Show-CommitHistory {
    if (-not (Test-Path $ThemePath)) {
        Show-Header
        Write-Host "  $ThemeName is not installed." -ForegroundColor $Red
        Pause-Return
        return
    }

    if (-not (Test-Dependencies)) {
        Pause-Return
        return
    }

    $viewing = $true
    while ($viewing) {
        $commits = Get-CommitList
        if ($commits.Count -eq 0) {
            Show-Header
            Write-Host "  No commits found." -ForegroundColor $Red
            Pause-Return
            return
        }

        Push-Location $ThemePath
        $currentHash = (git rev-parse HEAD 2>$null)
        Pop-Location

        $currentIndex = -1
        $items = @()
        for ($i = 0; $i -lt $commits.Count; $i++) {
            $commit = $commits[$i]
            $items += "$($commit.ShortHash)  $($commit.Date)  $($commit.Subject)"
            if ($commit.FullHash -eq $currentHash) {
                $currentIndex = $i
            }
        }
        $returnLatestIndex = $items.Count
        $items += "Return to latest version"
        $backIndex = $items.Count
        $items += "Back"

        $headerRenderer = {
            Show-Header
            Write-Host "$OrangeLight  Commit History$Reset"
            Write-Host ""
        }

        $selection = Read-ArrowSelection -Items $items -CurrentIndex $currentIndex -HeaderRenderer $headerRenderer

        if ($selection -eq -1 -or $selection -eq $backIndex) {
            $viewing = $false
        }
        elseif ($selection -eq $returnLatestIndex) {
            Update-Theme
        }
        elseif ($selection -ge 0 -and $selection -lt $commits.Count) {
            Checkout-Commit $commits[$selection]
        }
    }
}

function Checkout-Commit($commit) {
    Show-Header
    Write-Host "$OrangeLight  Checking out commit $($commit.ShortHash)...$Reset"
    Write-Host "  $($commit.Date)  $($commit.Subject)" -ForegroundColor $Gray
    Write-Host ""
    Write-Host "  This will switch the theme to this specific version." -ForegroundColor $Gray
    $confirm = Read-Host "  Type Y to confirm"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "  Cancelled." -ForegroundColor $Gray
        Pause-Return
        return
    }

    Push-Location $ThemePath
    git checkout $commit.FullHash --quiet
    Pop-Location

    if (Get-Command spicetify -ErrorAction SilentlyContinue) {
        Write-Host ""
        Write-Host "$OrangeMid  Applying Spicetify...$Reset"
        spicetify apply
    }

    Write-Host ""
    Write-Host "  $ThemeName is now on commit $($commit.ShortHash)." -ForegroundColor $Green
    Pause-Return
}

function Check-ForUpdates {
    Show-Header
    Write-Host "$OrangeLight  Checking for updates...$Reset"
    Write-Host ""

    if (-not (Test-Path $ThemePath)) {
        Write-Host "  $ThemeName is not installed." -ForegroundColor $Red
        Pause-Return
        return
    }

    if (-not (Test-Dependencies)) {
        Pause-Return
        return
    }

    $status = Get-ThemeStatusDetailed
    Write-Host "  Status: " -NoNewline -ForegroundColor $White
    Write-Host $status.Text -ForegroundColor $status.Color

    if ($status.Text -eq "Installed (outdated)") {
        Write-Host ""
        Write-Host "  A newer version is available." -ForegroundColor $Gray
        $confirm = Read-Host "  Type Y to update now"
        if ($confirm -eq "Y" -or $confirm -eq "y") {
            Update-Theme
            return
        }
    }

    Pause-Return
}

function Pause-Return {
    Write-Host ""
    Write-Host "  Press any key to return to the menu..." -ForegroundColor $Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-Menu {
    Show-Header
    $status = Get-ThemeStatusDetailed

    Write-Host "  Status: " -NoNewline -ForegroundColor $White
    Write-Host $status.Text -ForegroundColor $status.Color
    Write-Host ""
    Write-Host "  [1] Install $ThemeName"       -ForegroundColor $White
    Write-Host "  [2] Update $ThemeName"        -ForegroundColor $White
    Write-Host "  [3] Uninstall $ThemeName"     -ForegroundColor $White
    Write-Host "  [4] Commit History / Downgrade" -ForegroundColor $White
    Write-Host "  [5] Check for Updates"        -ForegroundColor $White
    Write-Host "  [6] Exit"                     -ForegroundColor $White
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
        "4" { Show-CommitHistory }
        "5" { Check-ForUpdates }
        "6" { $running = $false }
        default {
            Show-Header
            Write-Host "  Invalid option." -ForegroundColor $Red
            Pause-Return
        }
    }
}

Clear-Host