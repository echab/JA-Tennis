@echo off

pushd %~dp0
cd

@echo Dependencies installation
call npm install
@if errorlevel 1 goto :theend

@echo Build with Grunt
call grunt publish

rem @echo Build with Gulp
rem call gulp publish

:theend
pause
popd