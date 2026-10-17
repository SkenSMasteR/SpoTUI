@echo off
setlocal
cd /d "%~dp0.."

python -m pip install --upgrade pip
python -m pip install -r sposync/requirements.txt pyinstaller
if errorlevel 1 exit /b 1

python -m PyInstaller --noconfirm --onefile --name sposync-win64 ^
  --collect-all textual --collect-all rich --collect-all soundcard ^
  --collect-all numpy --collect-all websockets --collect-all pystray --collect-all PIL ^
  sposync/app.py
if errorlevel 1 exit /b 1

if not exist sposync\bin mkdir sposync\bin
move /y dist\sposync-win64.exe sposync\bin\sposync-win64.exe

endlocal
