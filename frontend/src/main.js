import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './services/api'
import './assets/css/main.css'
import '@fortawesome/fontawesome-free/css/all.css'

// Importa fontes
import '@fontsource/roboto'
import '@fontsource/poppins'
import '@fontsource/fira-code'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
