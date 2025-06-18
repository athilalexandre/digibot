const Command = require('../models/command')
const logger = require('../utils/logger').createModuleLogger('CommandController')

// Listar comandos
exports.listCommands = async (req, res) => {
  try {
    const { category, enabled } = req.query
    const query = {}

    if (category) {
      query.category = category
    }

    if (enabled !== undefined) {
      query.isEnabled = enabled === 'true'
    }

    const commands = await Command.find(query)
      .sort({ name: 1 })
      .select('-__v')

    res.json(commands)
  } catch (error) {
    logger.error('Erro ao listar comandos:', error)
    res.status(500).json({ message: 'Erro ao listar comandos' })
  }
}

// Obter comando
exports.getCommand = async (req, res) => {
  try {
    const command = await Command.findOne({ name: req.params.name })
    
    if (!command) {
      return res.status(404).json({ message: 'Comando não encontrado' })
    }

    res.json(command)
  } catch (error) {
    logger.error('Erro ao obter comando:', error)
    res.status(500).json({ message: 'Erro ao obter comando' })
  }
}

// Criar comando
exports.createCommand = async (req, res) => {
  try {
    const command = new Command({
      ...req.body,
      createdBy: req.user._id
    })

    await command.save()
    res.status(201).json(command)
  } catch (error) {
    logger.error('Erro ao criar comando:', error)
    res.status(500).json({ message: 'Erro ao criar comando' })
  }
}

// Atualizar comando
exports.updateCommand = async (req, res) => {
  try {
    const command = await Command.findOne({ name: req.params.name })
    
    if (!command) {
      return res.status(404).json({ message: 'Comando não encontrado' })
    }

    const updates = Object.keys(req.body)
    const allowedUpdates = [
      'description',
      'usage',
      'examples',
      'cooldown',
      'cost',
      'isModOnly',
      'isEnabled',
      'category',
      'aliases'
    ]
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Atualizações inválidas' })
    }

    updates.forEach(update => command[update] = req.body[update])
    await command.save()

    res.json(command)
  } catch (error) {
    logger.error('Erro ao atualizar comando:', error)
    res.status(500).json({ message: 'Erro ao atualizar comando' })
  }
}

// Deletar comando
exports.deleteCommand = async (req, res) => {
  try {
    const command = await Command.findOneAndDelete({ name: req.params.name })
    
    if (!command) {
      return res.status(404).json({ message: 'Comando não encontrado' })
    }

    res.json({ message: 'Comando deletado com sucesso' })
  } catch (error) {
    logger.error('Erro ao deletar comando:', error)
    res.status(500).json({ message: 'Erro ao deletar comando' })
  }
}

// Executar comando
exports.executeCommand = async (req, res) => {
  try {
    const { name, args } = req.body
    const command = await Command.findOne({ name })
    
    if (!command) {
      return res.status(404).json({ message: 'Comando não encontrado' })
    }

    if (!command.canUse(req.user)) {
      return res.status(403).json({ message: 'Comando não pode ser usado' })
    }

    // Registra o uso do comando
    await command.use()

    // TODO: Implementar lógica de execução do comando
    const response = `Comando ${name} executado com sucesso!`

    res.json({ response })
  } catch (error) {
    logger.error('Erro ao executar comando:', error)
    res.status(500).json({ message: 'Erro ao executar comando' })
  }
} 