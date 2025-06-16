import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TammersView from '../views/TammersView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/tammers', name: 'Tammers', component: TammersView },
  { path: '/settings', name: 'Settings', component: SettingsView }
];

const router = createRouter({
  history: createWebHistory('/'), // Simplificado para não depender de process.env.BASE_URL
  routes
});

export default router;
