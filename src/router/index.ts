import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TradeView from '@/views/TradeView.vue'
import LendingView from '@/views/LendingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'trade',
      component: TradeView
    },
    {
      path: '/lending',
      name: 'lending',
      component: LendingView
    }
  ]
})

export default router
