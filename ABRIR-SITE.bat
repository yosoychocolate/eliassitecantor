@echo off
chcp 65001 >nul
title Ministério Elias Silva — Portal Local
cd /d "%~dp0"

echo.
echo  Portal Oficial — Ministério Elias Silva
echo  ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  [ERRO] Node.js nao esta instalado.
  echo.
  echo  Baixe em: https://nodejs.org
  echo  Instale, reinicie o PC e tente novamente.
  echo.
  pause
  exit /b 1
)

echo  Liberando porta 3456...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3456" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)

echo  Iniciando servidor em http://localhost:3456
echo  Na primeira vez pode demorar ^(baixando dependencias^).
echo  O navegador abrira quando o servidor estiver pronto.
echo.
echo  Para encerrar o site: feche esta janela ou pressione Ctrl+C
echo.

start "" /MIN powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\aguardar-servidor.ps1"

npx --yes serve -l 3456 --no-port-switching --no-clipboard

if errorlevel 1 (
  echo.
  echo  [ERRO] Servidor nao iniciou na porta 3456.
  echo  Feche outros programas que usem essa porta e tente novamente.
  echo.
  pause
)
