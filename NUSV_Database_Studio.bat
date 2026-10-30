@echo off
setlocal
title NUSV Database Studio Launcher

cd /d "%~dp0"

:: Check for pythonw (windowless) or standard python
where pythonw >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start "" pythonw tools\launch_studio.py
    exit /b 0
)

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python tools\launch_studio.py
    exit /b 0
)

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    py tools\launch_studio.py
    exit /b 0
)

echo [ERROR] Python tidak ditemukan di sistem ini!
echo Silakan unduh dan install Python dari https://www.python.org/
echo Pastikan opsi "Add Python to PATH" dicentang saat menginstall.
pause
exit /b 1

