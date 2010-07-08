@echo off

SETLOCAL
set http_proxy=us0-pxy02:8080

set JATREPO=echab/JA-Tennis.git

set GIT="C:\Program Files\Git\cmd\git.cmd"


rem goto :clone


ENDLOCAL
pause
goto eof:


:clone
rem To create a new local git repository in the current directory, cloning github repository:
rem OK
%GIT% clone http://github.com/%JATREPO%
goto eof:

:clonessh
rem http://blog.codeslower.com/2008/8/Using-PuTTY-and-SSL-to-securely-access-GitHub-repositories-via-SSH
rem http://skim.la/2010/02/22/how-to-make-github-and-proxy-play-nicely-with-ssh/
%GIT% clone ssh://git@github.com:443/%JATREPO%
goto eof:



rem To launch git gui:
rem "C:\Program Files\Git\cmd\git.cmd" gui
