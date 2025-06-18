const mongoose = require('mongoose')
const config = require('./config')
const { spawn } = require('child_process')
const path = require('path')

class Database {
  constructor() {
    this.mongoProcess = null
    this.isConnected = false
  }

  async startMongo() {
    return new Promise((resolve, reject) => {
      try {
        // Verifica se o MongoDB já está rodando
        if (this.mongoProcess) {
          console.log('MongoDB já está em execução')
          resolve()
          return
        }

        // Inicia o processo do MongoDB
        this.mongoProcess = spawn(config.mongoPath, [
          '--dbpath', path.join(__dirname, '../data/db'),
          '--logpath', path.join(__dirname, '../logs/mongodb.log'),
          '--fork'
        ])

        this.mongoProcess.stdout.on('data', (data) => {
          console.log(`MongoDB: ${data}`)
        })

        this.mongoProcess.stderr.on('data', (data) => {
          console.error(`MongoDB Error: ${data}`)
        })

        this.mongoProcess.on('close', (code) => {
          console.log(`MongoDB process exited with code ${code}`)
          this.mongoProcess = null
        })

        // Aguarda 2 segundos para o MongoDB iniciar
        setTimeout(() => {
          console.log('MongoDB iniciado com sucesso')
          resolve()
        }, 2000)
      } catch (error) {
        console.error('Erro ao iniciar MongoDB:', error)
        reject(error)
      }
    })
  }

  async stopMongo() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.mongoProcess) {
          console.log('MongoDB não está em execução')
          resolve()
          return
        }

        this.mongoProcess.kill()
        this.mongoProcess = null
        console.log('MongoDB encerrado com sucesso')
        resolve()
      } catch (error) {
        console.error('Erro ao encerrar MongoDB:', error)
        reject(error)
      }
    })
  }

  async connect() {
    try {
      // Inicia o MongoDB se necessário
      await this.startMongo()

      // Conecta ao MongoDB
      await mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })

      this.isConnected = true
      console.log('Conectado ao MongoDB')
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error)
      throw error
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect()
        this.isConnected = false
        console.log('Desconectado do MongoDB')
      }

      // Encerra o processo do MongoDB
      await this.stopMongo()
    } catch (error) {
      console.error('Erro ao desconectar do MongoDB:', error)
      throw error
    }
  }
}

module.exports = new Database() 