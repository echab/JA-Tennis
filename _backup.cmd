@echo off

pushd %~dp0
cd

@echo Dependencies installation
call npm install
@if errorlevel 1 goto :theend

@echo Build with Grunt
call grunt backup

rem @echo Build with Gulp
rem call gulp backup

:theend
if errorlevel 1 pause
popd