import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TokenData } from './node';


export const useRequesterBalanceStore = defineStore('requesterBalance', () => {
    const balance = ref<Array<TokenData>>([])

    function setBalance(balanceData : Array<TokenData>) {
      balance.value = balanceData
    }
    
  return { balance, setBalance }
})
