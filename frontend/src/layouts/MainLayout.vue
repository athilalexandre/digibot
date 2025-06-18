<template>
  <div class="layout-wrapper">
    <div class="layout">
      <nav class="sidebar">
        <div class="logo">
          <img src="@/assets/img/logo.svg" alt="DigiBot Logo" class="logo">
          <h1>DigiBot</h1>
        </div>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link" exact>
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
          </router-link>
          
          <router-link to="/chat" class="nav-link">
            <i class="fas fa-comments"></i>
            <span>Chat</span>
          </router-link>
          
          <router-link to="/commands" class="nav-link">
            <i class="fas fa-terminal"></i>
            <span>Comandos</span>
          </router-link>
          
          <router-link to="/config" class="nav-link">
            <i class="fas fa-cog"></i>
            <span>Configurações</span>
          </router-link>
        </div>
        
        <div class="sidebar-footer">
          <div class="bot-status" :class="{ 'online': botStatus }">
            <i class="fas fa-circle"></i>
            <span>{{ botStatus ? 'Online' : 'Offline' }}</span>
          </div>
          <div class="sidebar-info">
            DigiBot &copy; 2025 – Desenvolvido com <span class="heart">♥</span> por
            <a href="https://github.com/athilalexandre" target="_blank" class="author">Athila Alexandre</a>
          </div>
        </div>
      </nav>
      
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'MainLayout',
  data() {
    return {
      botStatus: false,
      statusInterval: null
    }
  },
  methods: {
    async fetchStatus() {
      try {
        const res = await api.get('/health')
        this.botStatus = res.data.botOnline ?? false
      } catch (err) {
        this.botStatus = false
      }
    }
  },
  mounted() {
    this.fetchStatus()
    this.statusInterval = setInterval(this.fetchStatus, 10000)
  },
  beforeDestroy() {
    clearInterval(this.statusInterval)
  }
}
</script>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  flex: 1 1 auto;
}
.sidebar {
  background-color: var(--sidebar-color);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}
.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.logo img {
  width: 40px;
  height: 40px;
}
.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--primary-color);
}
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.nav-link:hover {
  background-color: rgba(145, 70, 255, 0.1);
}
.nav-link.router-link-active {
  background-color: var(--primary-color);
  color: white;
}
.nav-link i {
  width: 20px;
  text-align: center;
}
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}
.bot-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.bot-status i {
  font-size: 0.8rem;
}
.bot-status.online i {
  color: var(--secondary-color);
}
.bot-status:not(.online) i {
  color: #ff4444;
}
.sidebar-info {
  width: 100%;
  background: none;
  color: #bdbdbd;
  text-align: center;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  margin-top: 0.5rem;
}
.sidebar-info .heart {
  color: #f357a8;
  font-size: 1.1em;
  margin: 0 0.15em;
}
.sidebar-info .author {
  color: #7b2ff2;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.2em;
  transition: color 0.2s;
}
.sidebar-info .author:hover {
  color: #f357a8;
}
.main-content {
  padding: 2rem;
  min-height: 0;
}
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    left: -250px;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transition: left 0.3s ease;
  }
  .sidebar.active {
    left: 0;
  }
  .main-content {
    padding: 1rem;
  }
}
</style> 