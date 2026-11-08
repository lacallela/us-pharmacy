@echo off
echo ========================================================
echo       Starting Cloudflare Tunnel for RxMatch US
echo ========================================================
echo Target Local Server: http://localhost:3005
echo.
"%~dp0cloudflared.exe" tunnel --url http://localhost:3005
pause
