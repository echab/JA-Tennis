@echo off

title Run server

@echo Start server (without cache)
call http-server %~dp0 -o -c-1

if errorlevel 1 pause
