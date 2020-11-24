@echo off
set psscript=%~dpn0.ps1
REM echo %psscript%
powershell Set-ExecutionPolicy ByPass -Scope Process; %psscript%
REM pause