import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RecipesView from '../views/RecipesView.vue'
import AboutView from '../views/AboutView.vue'
import TipsView from '../views/TipsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/recepty',
      name: 'recepty',
      component: RecipesView,
    },
    {
      path: '/o-nas',
      name: 'o-nas',
      component: AboutView,
    },
    {
      path: '/tipy',
      name: 'tipy',
      component: TipsView,
    },
  ],
})

export default router
