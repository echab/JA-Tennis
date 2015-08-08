@echo off

@echo Build typescript
call tsc.cmd

if errorlevel 1 pause
