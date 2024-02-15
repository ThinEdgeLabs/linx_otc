import { createRouter, createWebHistory } from 'vue-router'
import TradeView from '@/views/TradeView.vue'
import LendingView from '@/views/LendingView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/trading',
      name: 'trading',
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
