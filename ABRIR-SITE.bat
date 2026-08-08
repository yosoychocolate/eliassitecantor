@echo off
title Ministério Elias Silva — Portal Local
cd /d "%~dp0"

echo.
echo  Portal Oficial — Ministério Elias Silva
echo  ========================================
echo  Iniciando servidor em http://localhost:3456
echo  Aguarde... o navegador abrira automaticamente.
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3456"

npx --yes serve -l 3456
