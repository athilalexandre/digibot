import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

// Importa Font Awesome
import '@fortawesome/fontawesome-free/css/all.css'

// Importa fontes
import '@fontsource/roboto'
import '@fontsource/poppins'
import '@fontsource/fira-code'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
