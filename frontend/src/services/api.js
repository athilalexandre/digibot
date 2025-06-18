import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requisições
api.interceptors.request.use(
  config => {
    // Adiciona token de autenticação se existir
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptor para respostas
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Erro do servidor
      switch (error.response.status) {
        case 401:
          // Não autorizado - limpa token e redireciona para login
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          // Proibido
          console.error('Acesso proibido')
          break
        case 404:
          // Não encontrado
          console.error('Recurso não encontrado')
          break
        case 500:
          // Erro interno do servidor
          console.error('Erro interno do servidor')
          break
        default:
          console.error('Erro na requisição:', error.response.data)
      }
    } else if (error.request) {
      // Erro na requisição
      console.error('Erro na requisição:', error.request)
    } else {
      // Erro na configuração da requisição
      console.error('Erro:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api 