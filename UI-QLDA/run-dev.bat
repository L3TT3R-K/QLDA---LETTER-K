@echo off
chcp 65001>nul
REM Move to script directory
cd /d "%~dp0"

REM Prefer pnpm if available, otherwise fallback to npx next
where pnpm >nul 2>&1
if %ERRORLEVEL%==0 (
  echo Found pnpm, running pnpm dev...
  pnpm.cmd dev
) else (
  echo pnpm not found, running npx next dev...
  npx next dev
)

pause
