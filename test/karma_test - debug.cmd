@echo off

karma start "%~dp0karma.config.js" --browsers Chrome

if errorlevel 1 pause
pause