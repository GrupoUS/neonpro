@echo off
REM PNPM Workaround for NeonPro Healthcare Project
REM This batch file allows using 'pnpm' command via pnpm dlx
pnpm dlx pnpm@latest %*
