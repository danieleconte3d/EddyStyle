@echo off
set GH_TOKEN=%GITHUB_TOKEN%
if "%GH_TOKEN%"=="" (
    echo Errore: Variabile d'ambiente GITHUB_TOKEN non impostata
    exit /b 1
)
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
npm run publish 