@echo off
setlocal
title Buat Shortcut Desktop NUSV Studio

cd /d "%~dp0\.."

echo Membuat shortcut "NUSV Database Studio" di Desktop...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut($desktop + '\NUSV Database Studio.lnk'); $s.TargetPath = (Get-Location).Path + '\NUSV_Database_Studio.bat'; $s.WorkingDirectory = (Get-Location).Path; $s.Description = 'NUSV Game Database Studio'; $s.Save()"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  BERHASIL!
    echo  Shortcut "NUSV Database Studio" telah dibuat di Desktop.
    echo  Anda dapat langsung double-click shortcut tersebut untuk
    echo  membuka editor dalam jendela aplikasi mandiri (window).
    echo ========================================================
) else (
    echo [ERROR] Gagal membuat shortcut.
)

pause

