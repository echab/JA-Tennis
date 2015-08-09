@echo off

title Run server

@echo Start server
call http-server %~dp0 -o

if errorlevel 1 pause
