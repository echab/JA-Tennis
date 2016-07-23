@echo off

title Run server

call nodevars.bat

call gulp watch

rem @echo Start server (without cache)
rem call http-server %~dp0 -o -c-1

if errorlevel 1 pause
