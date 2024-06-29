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
    const priceData = await fetch('https://api.linxotc.com/price/alephium')
    const res = await priceData.json()
    stats.value = {
      price: res.price as number
    }
  }

  return { stats, getPrice }
})
