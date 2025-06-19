const mongoose = require('mongoose')
const config = require('./config')
const { spawn } = require('child_process')
const path = require('path')
const logger = require('./utils/logger')

class Database {
  constructor() {
    this.mongoProcess = null
    this.isConnected = false
    this.connectionAttempts = 0
    this.maxConnectionAttempts = 5
  }

  async startMongo() {
    return new Promise((resolve, reject) => {
      try {
        // Verifica se o MongoDB já está rodando
        if (this.mongoProcess) {
          logger.info('MongoDB já está em execução')
          resolve()
          return
        }

        // Verifica se o diretório de dados existe
        const dbPath = path.join(__dirname, '../data/db')
        if (!require('fs').existsSync(dbPath)) {
          require('fs').mkdirSync(dbPath, { recursive: true })
          logger.info('Diretório de dados do MongoDB criado')
        }

        // Inicia o processo do MongoDB
        this.mongoProcess = spawn(config.mongoPath, [
          '--dbpath', dbPath,
          '--logpath', path.join(__dirname, '../logs/mongodb.log'),
          '--fork'
        ])

        this.mongoProcess.stdout.on('data', (data) => {
          logger.info(`MongoDB: ${data}`)
        })

        this.mongoProcess.stderr.on('data', (data) => {
          logger.error(`MongoDB Error: ${data}`)
        })

        this.mongoProcess.on('close', (code) => {
          logger.info(`MongoDB process exited with code ${code}`)
          this.mongoProcess = null
        })

        // Aguarda 2 segundos para o MongoDB iniciar
        setTimeout(() => {
          logger.info('MongoDB iniciado com sucesso')
          resolve()
        }, 2000)
      } catch (error) {
        logger.error('Erro ao iniciar MongoDB:', error)
        reject(error)
      }
    })
  }

  async stopMongo() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.mongoProcess) {
          logger.info('MongoDB não está em execução')
          resolve()
          return
        }

        this.mongoProcess.kill()
        this.mongoProcess = null
        logger.info('MongoDB encerrado com sucesso')
        resolve()
      } catch (error) {
        logger.error('Erro ao encerrar MongoDB:', error)
        reject(error)
      }
    })
  }

  async connect() {
    try {
      // Inicia o MongoDB se necessário
      await this.startMongo()

      // Tenta conectar ao MongoDB com retry
      while (this.connectionAttempts < this.maxConnectionAttempts) {
        try {
          await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 5000
          })

          this.isConnected = true
          logger.info('Conectado ao MongoDB com sucesso')
          return
        } catch (error) {
          this.connectionAttempts++
          logger.warn(`Tentativa ${this.connectionAttempts} de ${this.maxConnectionAttempts} falhou`)
          
          if (this.connectionAttempts === this.maxConnectionAttempts) {
            throw new Error('Não foi possível conectar ao MongoDB após várias tentativas')
          }
          
          // Espera 2 segundos antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    } catch (error) {
      logger.error('Erro ao conectar ao MongoDB:', error)
      throw error
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect()
        this.isConnected = false
        logger.info('Desconectado do MongoDB')
      }

      // Encerra o processo do MongoDB
      await this.stopMongo()
    } catch (error) {
      logger.error('Erro ao desconectar do MongoDB:', error)
      throw error
    }
  }
}

module.exports = new Database() 