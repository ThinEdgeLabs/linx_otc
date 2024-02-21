import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TokenData } from './node';


export const useReceiverBalanceStore = defineStore('receiverBalance', () => {
    const balance = ref<Array<TokenData>>([])

    function setBalance(balanceData : Array<TokenData>) {
      balance.value = balanceData
    }
    
  return { balance, setBalance }
})