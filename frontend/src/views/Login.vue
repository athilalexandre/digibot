<template>
  <div class="login-page">
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
        <div class="register-link">
          Não tem uma conta?
          <a href="#" class="register">Registre-se</a>
        </div>
      </div>
    </div>
    <footer class="login-footer">
      DigiBot © 2025 – Desenvolvido com <span class="heart">♥</span> por
      <a href="https://github.com/athilalexandre" target="_blank" class="author">Athila Alexandre</a>
    </footer>
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
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #18191c;
}
.login-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  background: #232428;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  width: 100%;
  max-width: 370px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo img {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
}
h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}
.subtitle {
  color: #bdbdbd;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.form-group {
  width: 100%;
}
.input-group {
  display: flex;
  align-items: center;
  background: #18191c;
  border-radius: 6px;
  border: 1px solid #33343a;
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
}
.input-group i {
  color: #888;
  font-size: 1rem;
}
.input-group input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1rem;
  flex: 1;
}
.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  font-size: 1rem;
  padding: 0 0.25rem;
}
.remember-me {
  margin-bottom: 0.5rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
  color: #bdbdbd;
}
.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}
.checkbox-label span {
  font-size: 0.95rem;
  color: #bdbdbd;
}
.login-button {
  width: 100%;
  background: linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}
.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error-message {
  color: #ff4d4f;
  background: #2a1a1a;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  font-size: 0.98rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.register-link {
  margin-top: 1.5rem;
  color: #bdbdbd;
  font-size: 0.98rem;
  text-align: center;
}
.register-link .register {
  color: #7b2ff2;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: color 0.2s;
}
.register-link .register:hover {
  color: #f357a8;
}
.login-footer {
  width: 100%;
  background: #232428;
  color: #bdbdbd;
  text-align: center;
  padding: 1rem 0 0.5rem 0;
  font-size: 1rem;
  letter-spacing: 0.01em;
  border-top: 1px solid #222;
  margin-top: 2rem;
}
.login-footer .heart {
  color: #f357a8;
  font-size: 1.1em;
  margin: 0 0.15em;
}
.login-footer .author {
  color: #7b2ff2;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.2em;
  transition: color 0.2s;
}
.login-footer .author:hover {
  color: #f357a8;
}
</style> 