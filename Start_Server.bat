@echo off
title OnePlus Premium Earbuds Server
color 0C
echo ===================================================================
echo     ANTIGRAVITY PREMIUM ONEPLUS EARBUDS DEVELOPMENT ENGINE
echo ===================================================================
echo.
echo  [✓] Preparing server environment...
echo  [✓] Opening browser at http://localhost:5173 ...
echo.
echo  * KEEP THIS WINDOW OPEN while previewing the e-commerce website.
echo  * You can minimize it to your taskbar.
echo  * To stop the server, press Ctrl+C in this window or close it.
echo.
echo ===================================================================
echo.
start "" "http://localhost:5173"
npm run dev
