@echo off

title Karma test

karma start "%~dp0karma.config.js"

if errorlevel 1 pause
pause