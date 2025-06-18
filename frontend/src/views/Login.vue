<template>
  <div class="login">
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <img src="@/assets/img/logo.svg" alt="DigiBot Logo" />
        </div>
        <h1>DigiBot</h1>
        <p class="subtitle">Seu bot Digimon para Twitch</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Usuário</label>
            <div class="input-group">
              <i class="fas fa-user"></i>
              <input
                type="text"
                id="username"
                v-model="username"
                placeholder="Digite seu usuário"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group remember-me">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span>Lembrar minhas credenciais</span>
            </label>
          </div>

          <button type="submit" class="login-button" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <span v-else>Entrar</span>
          </button>
        </form>

        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>
      </div>
      
      <div class="login-footer">
        <p>Não tem uma conta? <a href="#" @click.prevent="register">Registre-se</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null,
      rememberMe: false
    }
  },
  created() {
    // Carregar credenciais salvas se existirem
    const savedCredentials = localStorage.getItem('digibot_credentials')
    if (savedCredentials) {
      const { username, password } = JSON.parse(savedCredentials)
      this.username = username
      this.password = password
      this.rememberMe = true
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = null

      try {
        // Simular login com credenciais padrão
        if (this.username === 'admin' && this.password === '123') {
          // Salvar credenciais se a opção estiver marcada
          if (this.rememberMe) {
            localStorage.setItem('digibot_credentials', JSON.stringify({
              username: this.username,
              password: this.password
            }))
          } else {
            localStorage.removeItem('digibot_credentials')
          }

          // Simular token de autenticação
          const token = 'fake-jwt-token'
          localStorage.setItem('token', token)

          // Redirecionar para o dashboard
          this.$router.push('/')
        } else {
          throw new Error('Usuário ou senha inválidos')
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    register() {
      // Implementar registro
      console.log('Registro')
    }
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  padding: 1rem;
}

.login-container {
  background-color: var(--sidebar-color);
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.logo img {
  width: 48px;
  height: 48px;
}

.logo h1 {
  font-size: 2rem;
  color: var(--primary-color);
  margin: 0;
}

.login-form {
  margin-bottom: 2rem;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-login:hover {
  background-color: #7c3cff;
}

.btn-login:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  border-radius: 4px;
  color: #ff4444;
  text-align: center;
}

.login-footer {
  text-align: center;
  color: var(--text-color);
}

.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.remember-me {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style> 