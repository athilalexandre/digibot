@echo off
echo Iniciando MongoDB...

set CONFIG_FILE=config\mongodb-config.json
set DEFAULT_PATH="C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"

if exist %CONFIG_FILE% (
    for /f "tokens=*" %%a in ('type %CONFIG_FILE% ^| findstr "mongodbPath"') do (
        set MONGODB_PATH=%%a
        set MONGODB_PATH=!MONGODB_PATH:"mongodbPath": "=!
        set MONGODB_PATH=!MONGODB_PATH:",=!
        set MONGODB_PATH=!MONGODB_PATH:"=!
    )
) else (
    set MONGODB_PATH=%DEFAULT_PATH%
)

if exist %MONGODB_PATH% (
    %MONGODB_PATH% --dbpath="C:\data\db"
) else (
    echo MongoDB nao encontrado em: %MONGODB_PATH%
    echo Por favor, instale o MongoDB em: C:\Program Files\MongoDB\Server\7.0\
    echo Ou configure o caminho correto no arquivo: %CONFIG_FILE%
    pause
) 