@echo off

@echo Generate tsconfig.json
call grunt tsconfig

if errorlevel 1 pause
