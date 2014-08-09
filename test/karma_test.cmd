@echo off

karma start "%~dp0karma.config.js"

if errorlevel 1 pause
pause