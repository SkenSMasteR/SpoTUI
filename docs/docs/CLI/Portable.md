## Dont want to install the CLI? No problem <3

All you need to do is choose your operating system below to run the portable version of the SpoTUI CLI.

### Windows
Run the following command in PowerShell:

```powershell
iwr -useb https://raw.githubusercontent.com/SkenSMasteR/SpoTUI/master/scripts/install/windows-portable.ps1 | iex
```

### Linux
Run the following command in your terminal:

```bash
curl -fsSL -o portable.sh https://raw.githubusercontent.com/SkenSMasteR/SpoTUI/master/scripts/install/linux-portable.sh && chmod +x portable.sh && ./portable.sh
```