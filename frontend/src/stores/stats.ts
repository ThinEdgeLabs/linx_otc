import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Statistics {
  price: number
  totalValue?: number | undefined
  totalTrades?: number | undefined
  totalLoans?: number | undefined
}

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<Statistics | undefined>()

  async function getPrice() {
    const cgPriceData = await fetch('https://api.mobula.io/api/1/market/pair?blockchain=alephium&asset=alephium   ')
    const res = await cgPriceData.json()
    console.log()
    stats.value = {
      price: res.data.price as number
    }
  }

  return { stats, getPrice }
})
