@echo off

title Build TS

@echo Build from typescript
call tsc.cmd

if errorlevel 1 pause
