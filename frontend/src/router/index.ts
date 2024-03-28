import { createRouter, createWebHistory } from 'vue-router'
import TradeView from '@/views/TradeView.vue'
import LendingView from '@/views/LendingView.vue'
import DashboardView from '@/views/DashboardView.vue'
import HomeView from '@/views/HomeView.vue'
import FaqView from '@/views/FaqView.vue'
import ManageTrade from '@/views/ManageTrade.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // {
    //   path: '/dashboard',
    //   name: 'dashboard',
    //   component: DashboardView
    // },
    {
      path: '/trading',
      name: 'trading',
      component: TradeView
    },
    {
      path: '/trading/:trade',
      name: 'complete_trade',
      component: ManageTrade
    },
    // {
    //   path: '/lending',
    //   name: 'lending',
    //   component: LendingView
    // },
    {
      path: '/faq',
      name: 'faq',
      component: FaqView
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('@/views/AboutView.vue')
    // },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/ContactView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

export default router
