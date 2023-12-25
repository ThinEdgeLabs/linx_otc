import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Account {
  address: string
  isConnected: boolean
}

export const useAccountStore = defineStore('account', () => {
    const account = ref<Account | undefined>()
    
  return { account }
})
