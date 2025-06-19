@echo off
echo ===================================
echo Iniciando MongoDB para o DigiBot...
echo ===================================

set CONFIG_FILE=config\mongodb-config.json
set DEFAULT_PATH="C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
set DB_PATH="C:\data\db"

:: Verifica se o diretório de dados existe
if not exist %DB_PATH% (
    echo Criando diretório de dados do MongoDB...
    mkdir %DB_PATH%
)

:: Carrega o caminho do MongoDB do arquivo de configuração
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

:: Verifica se o MongoDB está instalado
if exist %MONGODB_PATH% (
    echo MongoDB encontrado em: %MONGODB_PATH%
    echo Iniciando MongoDB...
    %MONGODB_PATH% --dbpath=%DB_PATH% --logpath=logs\mongodb.log --fork
    echo MongoDB iniciado com sucesso!
    echo ===================================
) else (
    echo [ERRO] MongoDB não encontrado em: %MONGODB_PATH%
    echo Por favor, instale o MongoDB em: C:\Program Files\MongoDB\Server\7.0\
    echo Ou configure o caminho correto no arquivo: %CONFIG_FILE%
    echo ===================================
    pause
    exit /b 1
) 