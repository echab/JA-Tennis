@echo off

title Build w/ grunt

pushd %~dp0
cd

@echo Dependencies installation
call npm install
@if errorlevel 1 goto :theend

call _build.cmd

@echo Build with Grunt
call grunt %*

rem @echo Build with Gulp
rem call gulp %*

:theend
rem if errorlevel 1 pause
pause
popd