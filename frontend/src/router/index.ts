import { createRouter, createWebHistory } from 'vue-router'
import TradeView from '@/views/TradeView.vue'
import LendingView from '@/views/LendingView.vue'
import DashboardView from '@/views/DashboardView.vue'
import HomeView from '@/views/HomeView.vue'
import FaqView from '@/views/FaqView.vue'
import ManageTrade from '@/views/ManageTrade.vue'
import ManageLoanOffer from '@/views/ManageLoanOffer.vue'
import CreateLoan from '@/views/CreateLoan.vue'
import ActivityView from '@/views/ActivityView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: getRoutes()
})

function getRoutes() {
  const routes = [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/activity',
      name: 'activity',
      component: ActivityView
    },
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

  import.meta.env.VITE_P2P_LENDING_ENABLED === 'true' && routes.push(...getLendingRoutes())
  import.meta.env.VITE_P2P_TRADING_ENABLED === 'true' && routes.push(...getTradeRoutes())

  return routes
}

function getLendingRoutes() {
  return [
    {
      path: '/lending',
      name: 'lending',
      component: LendingView
    },
    {
      path: '/lending/create',
      name: 'create_loan',
      component: CreateLoan
    },
    {
      path: '/lending/:loan',
      name: 'manage_loan',
      component: ManageLoanOffer
    }
  ]
}

function getTradeRoutes() {
  return [
    {
      path: '/trading',
      name: 'trading',
      component: TradeView
    },
    {
      path: '/trading/:trade',
      name: 'complete_trade',
      component: ManageTrade
    }
  ]
}

export default router
