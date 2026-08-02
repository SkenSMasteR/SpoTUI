$ThemeName   = "SpoTUI"
$RepoUrl     = "https://github.com/SkenSMasteR/SpoTUI"
$ThemesDir   = Join-Path $env:APPDATA "spicetify\Themes"
$ThemePath   = Join-Path $ThemesDir $ThemeName

$Esc   = [char]27
$Reset = "$Esc[0m"
$AnsiPattern = "$Esc\[[0-9;]*m"

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
$GreenAnsi   = Get-RGBCode 140 255 140
$SelectBg    = "$Esc[48;2;255;140;66m$Esc[38;2;0;0;0m"

$White = "White"
$Gray  = "DarkGray"
$Red   = "Red"
$Green = "Green"
$Cyan  = "Cyan"

# Tracks whether we've already attempted a winget update this session,
# so Test-Dependencies doesn't re-run it on every menu action.
$script:WingetUpdateAttempted = $false

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

function Get-HeaderLines {
    $lines = @()
    $lines += ""
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
    for ($i = 0; $i -lt $templates.Count; $i++) {
        $color = Get-GradientColor $i $templates.Count
        $line = Get-AsciiArtLine $templates[$i]
        $lines += "$color$line$Reset"
    }
    $lines += ""
    $lines += "$OrangeMid                     Spicetify Theme Manager$Reset"
    $lines += "$OrangeDark  =============================================================$Reset"
    $lines += ""
    return $lines
}

function Show-Header {
    Clear-Host
    foreach ($line in (Get-HeaderLines)) {
        Write-Host $line
    }
}

function Get-VisibleLength($text) {
    $stripped = $text -replace $AnsiPattern, ""
    return $stripped.Length
}

function Write-Frame($lines) {
    try { [Console]::SetCursorPosition(0, 0) } catch {}
    $width = 80
    try { $width = $Host.UI.RawUI.WindowSize.Width } catch {}
    foreach ($line in $lines) {
        $visible = Get-VisibleLength $line
        $pad = $width - $visible - 1
        if ($pad -lt 0) { $pad = 0 }
        Write-Host ($line + (" " * $pad))
    }
}

function Get-ConsoleHeight {
    $height = 30
    try { $height = $Host.UI.RawUI.WindowSize.Height } catch {}
    return $height
}

function Refresh-Path {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

function Update-Winget {
    Write-Host "$OrangeMid  Updating winget...$Reset"

    if (Get-Command winget -ErrorAction SilentlyContinue) {
        try {
            $proc = Start-Process -FilePath "winget" -ArgumentList "upgrade","--id","Microsoft.AppInstaller","-e","--source","winget","--accept-package-agreements","--accept-source-agreements" -Wait -PassThru -WindowStyle Hidden
            Write-Host "  winget upgrade exited with code $($proc.ExitCode)" -ForegroundColor $Gray
        } catch {
            Write-Host "  winget upgrade command failed to run." -ForegroundColor $Red
        }

        try {
            winget source reset --force | Out-Null
        } catch {}

        return
    }

    Write-Host "  winget command not found. Installing App Installer from GitHub release..." -ForegroundColor $Gray
    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/microsoft/winget-cli/releases/latest"
        $asset = $release.assets | Where-Object { $_.name -like "*.msixbundle" } | Select-Object -First 1

        if (-not $asset) {
            Write-Host "  Could not find a .msixbundle asset in the latest release." -ForegroundColor $Red
            return
        }

        $downloadPath = Join-Path $env:TEMP $asset.name
        Write-Host "  Downloading $($asset.name)..." -ForegroundColor $Gray
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $downloadPath

        Write-Host "  Installing package..." -ForegroundColor $Gray
        Add-AppxPackage -Path $downloadPath -ErrorAction Stop

        Write-Host "  App Installer installed successfully." -ForegroundColor $Green
        Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
    }
    catch {
        Write-Host "  Failed to install App Installer automatically: $($_.Exception.Message)" -ForegroundColor $Red
        Write-Host "  You can install it manually from the Microsoft Store (search 'App Installer')." -ForegroundColor $Gray
    }

    Refresh-Path
}

function Install-Dependency($name) {
    if ($name -eq "git") {
        if (Get-Command winget -ErrorAction SilentlyContinue) {
            Write-Host "  Launching winget to install Git..." -ForegroundColor $Gray
            $proc = Start-Process -FilePath "winget" -ArgumentList "install","--id","Git.Git","-e","--source","winget","--accept-package-agreements","--accept-source-agreements" -Wait -PassThru
            Write-Host "  winget exited with code $($proc.ExitCode)" -ForegroundColor $Gray

            # 0xC0000005 = access violation / winget crash. Update winget once and retry.
            if ($proc.ExitCode -eq -1073741819 -and -not $script:WingetUpdateAttempted) {
                Write-Host "  winget crashed. Attempting to update winget and retry..." -ForegroundColor $Red
                $script:WingetUpdateAttempted = $true
                Update-Winget

                Write-Host "  Retrying Git install..." -ForegroundColor $Gray
                $proc = Start-Process -FilePath "winget" -ArgumentList "install","--id","Git.Git","-e","--source","winget","--accept-package-agreements","--accept-source-agreements" -Wait -PassThru
                Write-Host "  winget exited with code $($proc.ExitCode)" -ForegroundColor $Gray
            }

            Refresh-Path
            $tries = 0
            while (-not (Get-Command git -ErrorAction SilentlyContinue) -and $tries -lt 10) {
                Start-Sleep -Seconds 1
                Refresh-Path
                $tries++
            }
        }
        else {
            Write-Host "  winget was not found. Install Git manually from https://git-scm.com/download/win" -ForegroundColor $Red
        }
    }
    elseif ($name -eq "spicetify") {
        $installCommand = "iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex"
        Write-Host "  Opening a new window to install Spicetify. Waiting for it to finish..." -ForegroundColor $Gray
        Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $installCommand -Wait
        Write-Host "  Spicetify installer window closed." -ForegroundColor $Gray
        Refresh-Path
    }
}

function Test-Dependencies {
    $missing = @()
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { $missing += "git" }
    if (-not (Get-Command spicetify -ErrorAction SilentlyContinue)) { $missing += "spicetify" }

    if ($missing.Count -eq 0) {
        return $true
    }

    Write-Host "  Missing dependencies: $($missing -join ', ')" -ForegroundColor $Red
    Write-Host ""
    $confirm = Read-Host "  Press I to install them now, or any other key to cancel"
    if ($confirm -ne "I" -and $confirm -ne "i") {
        return $false
    }

    foreach ($dep in $missing) {
        Write-Host ""
        Write-Host "$OrangeMid  Installing $dep...$Reset"
        Install-Dependency $dep
    }

    Write-Host ""
    Write-Host "$OrangeMid  Refreshing environment PATH...$Reset"
    Refresh-Path

    $stillMissing = @()
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { $stillMissing += "git" }
    if (-not (Get-Command spicetify -ErrorAction SilentlyContinue)) { $stillMissing += "spicetify" }

    if ($stillMissing.Count -gt 0) {
        Write-Host ""
        Write-Host "  Still missing: $($stillMissing -join ', '). You may need to restart your terminal." -ForegroundColor $Red
        return $false
    }

    Write-Host ""
    Write-Host "  All dependencies installed successfully." -ForegroundColor $Green
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
        [string[]]$TitleLines
    )

    $selectedIndex = 0
    if ($CurrentIndex -ge 0) { $selectedIndex = $CurrentIndex }

    $headerLines = Get-HeaderLines
    $overheadLines = $headerLines.Count + $TitleLines.Count + 4

    $pageSize = (Get-ConsoleHeight) - $overheadLines
    if ($pageSize -gt $Items.Count) { $pageSize = $Items.Count }
    if ($pageSize -lt 1) { $pageSize = 1 }

    Clear-Host
    try { [Console]::CursorVisible = $false } catch {}

    while ($true) {
        $totalPages = [Math]::Ceiling($Items.Count / $pageSize)
        if ($totalPages -lt 1) { $totalPages = 1 }
        $currentPage = [Math]::Floor($selectedIndex / $pageSize)
        $pageStart = $currentPage * $pageSize
        $pageEnd = $pageStart + $pageSize - 1
        if ($pageEnd -gt ($Items.Count - 1)) { $pageEnd = $Items.Count - 1 }

        $frame = @()
        $frame += $headerLines
        $frame += $TitleLines

        for ($i = $pageStart; $i -le $pageEnd; $i++) {
            $prefix = if ($i -eq $CurrentIndex) { "> " } else { "  " }
            $text = "$prefix$($Items[$i])"
            if ($i -eq $selectedIndex) {
                $frame += "$SelectBg$text$Reset"
            }
            elseif ($i -eq $CurrentIndex) {
                $frame += "$GreenAnsi$text$Reset"
            }
            else {
                $frame += $text
            }
        }

        $linesUsed = $pageEnd - $pageStart + 1
        for ($p = $linesUsed; $p -lt $pageSize; $p++) {
            $frame += ""
        }

        $frame += ""
        $frame += "$OrangeDark  =============================================================$Reset"
        $frame += "  Up/Down to move, Enter to select, Esc to go back   Page $($currentPage + 1) of $totalPages"

        Write-Frame $frame

        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        $code = $key.VirtualKeyCode

        if ($code -eq 38) {
            if ($selectedIndex -gt 0) { $selectedIndex-- } else { $selectedIndex = $Items.Count - 1 }
        }
        elseif ($code -eq 40) {
            if ($selectedIndex -lt $Items.Count - 1) { $selectedIndex++ } else { $selectedIndex = 0 }
        }
        elseif ($code -eq 13) {
            try { [Console]::CursorVisible = $true } catch {}
            return $selectedIndex
        }
        elseif ($code -eq 27) {
            try { [Console]::CursorVisible = $true } catch {}
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

        $titleLines = @("$OrangeLight  Commit History$Reset", "")

        $selection = Read-ArrowSelection -Items $items -CurrentIndex $currentIndex -TitleLines $titleLines

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