@echo off

title Generate tsconfig.json

call grunt tsconfig

if errorlevel 1 pause
