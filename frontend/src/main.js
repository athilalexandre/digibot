import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api'; // Ajuste se sua API estiver em outra porta

const app = createApp(App);
app.use(router);
app.config.globalProperties.$http = axios;
app.mount('#app');
