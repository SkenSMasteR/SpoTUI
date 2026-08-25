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
public static class SpoTUIInstallerNative {
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
        $handle = [SpoTUIInstallerNative]::GetStdHandle(-11)
        $mode = 0
        [SpoTUIInstallerNative]::GetConsoleMode($handle, [ref]$mode) | Out-Null
        [SpoTUIInstallerNative]::SetConsoleMode($handle, $mode -bor 0x0004) | Out-Null
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
    Write-Host "$OrangeMid                          Installer$Reset"
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

    $jobError  = $null
    $jobOutput = $null
    try {
        $jobOutput = Receive-Job -Job $job -ErrorAction Stop
    } catch {
        $jobError = $_
    }
    $failed = $job.State -eq "Failed" -or ($job.ChildJobs[0].Error.Count -gt 0) -or ($null -ne $jobError)
    Remove-Job -Job $job -Force | Out-Null

    $pad = " " * 40
    if ($failed) {
        Write-Host ($CR + "  " + $RedAnsi + $CrossMark + $Reset + "  " + $Label + $pad)
        if ($jobError) {
            Write-Host ("      " + $RedAnsi + $jobError.Exception.Message + $Reset)
        }
    }
    else {
        Write-Host ($CR + "  " + $GreenAnsi + $CheckMark + $Reset + "  " + $Label + $pad)
    }

    try { [Console]::CursorVisible = $true } catch {}
    return [PSCustomObject]@{ Success = (-not $failed); Output = $jobOutput }
}

Show-Header

$RepoOwner  = "SkenSMasteR"
$RepoName   = "SpoTUI"
$ApiLatest  = "https://api.github.com/repos/$RepoOwner/$RepoName/releases/latest"

$targetDir = "$env:APPDATA\spotui"
$exePath   = "$targetDir\spotui.exe"
$batchPath = "$targetDir\spotui.bat"
function Get-TargetAssetName {
    $arch = [System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture
    switch ($arch) {
        "Arm64" { return "spotui-winarm64.exe" }
        "X64"   { return "spotui-win64.exe" }
        "X86"   { return "spotui-win32.exe" }
        default { return "spotui-win64.exe" }
    }
}

$ok = $true
$releaseInfo   = $null
$selectedAsset = $null
$latestTag     = $null

$stepResult = Invoke-Step "Looking up latest release" {
    $ProgressPreference = 'SilentlyContinue'
    $headers = @{ "User-Agent" = "SpoTUI-Installer" }
    return Invoke-RestMethod -Uri $using:ApiLatest -Headers $headers
}
$ok = $stepResult.Success -and $ok

if ($ok) {
    $releaseInfo = $stepResult.Output
    $latestTag   = $releaseInfo.tag_name
    $assetName   = Get-TargetAssetName
    $selectedAsset = $releaseInfo.assets | Where-Object { $_.name -eq $assetName } | Select-Object -First 1

    if (-not $selectedAsset) {
        Write-Host ""
        Write-Host "  $RedAnsi$CrossMark$Reset  No '$assetName' asset found in release $latestTag."
        $ok = $false
    }
}

if ($ok) {
    Write-Host ""
    Write-Host "$OrangeMid  Latest version: $latestTag$Reset"
    Write-Host "$GrayAnsi  Asset: $($selectedAsset.name)  ($([Math]::Round($selectedAsset.size / 1MB, 2)) MB)$Reset"
    Write-Host ""
}
function Get-ExpectedHash($asset, $releaseBody) {
    if ($asset.digest -and $asset.digest -match '^sha256:([a-fA-F0-9]{64})$') {
        return $Matches[1].ToLower()
    }

    if (-not $releaseBody) { return $null }
    $pattern = [regex]::Escape($asset.name) + '[\s\S]{0,200}?\b([a-fA-F0-9]{64})\b'
    $m = [regex]::Match($releaseBody, $pattern)
    if ($m.Success) { return $m.Groups[1].Value.ToLower() }
    return $null
}

$downloadPath = $null

if ($ok) {
    $stepResult = Invoke-Step "Creating install directory" {
        if (-not (Test-Path $using:targetDir)) {
            New-Item -ItemType Directory -Path $using:targetDir -Force | Out-Null
        }
    }
    $ok = $stepResult.Success -and $ok
}

if ($ok) {
    $downloadPath = Join-Path $targetDir $selectedAsset.name
    $stepResult = Invoke-Step "Downloading $($selectedAsset.name)" {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $using:selectedAsset.browser_download_url -OutFile $using:downloadPath -UseBasicParsing
    }
    $ok = $stepResult.Success -and $ok
}

if ($ok) {
    $expectedHash = Get-ExpectedHash $selectedAsset $releaseInfo.body
    if ($expectedHash) {
        $stepResult = Invoke-Step "Verifying SHA256 checksum" {
            $actual = (Get-FileHash -Path $using:downloadPath -Algorithm SHA256).Hash.ToLower()
            if ($actual -ne $using:expectedHash) {
                throw "Checksum mismatch. Expected $using:expectedHash but got $actual. Aborting - file was not installed."
            }
        }
        $ok = $stepResult.Success -and $ok

        if ($stepResult.Success) {
            Write-Host "$GrayAnsi  SHA256: $expectedHash$Reset"
            Write-Host ""
        }
    }
    else {
        Write-Host ""
        Write-Host "  $RedAnsi!$Reset  No published checksum found for this asset in the release notes."
        Write-Host "     ${GrayAnsi}You can verify it manually at:$Reset"
        Write-Host "     ${GrayAnsi}https://github.com/$RepoOwner/$RepoName/releases/tag/$latestTag$Reset"
        $confirm = Read-Host "  Type Y to continue installing anyway, or anything else to cancel"
        if ($confirm -ne "Y" -and $confirm -ne "y") {
            $ok = $false
        }
    }
}

if ($ok) {
    $stepResult = Invoke-Step "Installing spotui.exe" {
        Copy-Item -Path $using:downloadPath -Destination $using:exePath -Force
        Remove-Item -Path $using:downloadPath -Force -ErrorAction SilentlyContinue
    }
    $ok = $stepResult.Success -and $ok
}

if ($ok) {
    $stepResult = Invoke-Step "Updating PATH" {
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*$using:targetDir*") {
            [Environment]::SetEnvironmentVariable("Path", "$userPath;$using:targetDir", "User")
        }
    }
    $ok = $stepResult.Success -and $ok

    $env:Path = "$env:Path;$targetDir"
}

if ($ok) {
    $stepResult = Invoke-Step "Creating launcher" {
        $batchContent = '@echo off' + [Environment]::NewLine + '"' + $using:exePath + '" %*'
        Set-Content -Path $using:batchPath -Value $batchContent
    }
    $ok = $stepResult.Success -and $ok
}

Write-Host ""
Write-Host "$OrangeDark  =============================================================$Reset"
Write-Host ""

if ($ok) {
    Write-Host ("  " + $GreenAnsi + $CheckMark + "  SpoTUI $latestTag installed successfully." + $Reset)
    Write-Host ("  " + $GrayAnsi + "   Open a new terminal and run: spotui" + $Reset)
}
else {
    Write-Host ("  " + $RedAnsi + $CrossMark + "  Installation finished with errors. See above." + $Reset)
}

Write-Host ""s