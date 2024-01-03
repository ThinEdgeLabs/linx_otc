import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useOrderStore } from '@/stores/order'

interface Account {
  address: string,
  group: number,
  isConnected: boolean
}

export const useAccountStore = defineStore('account', () => {
    const account = ref<Account | undefined>()

    function setAccount(acc: string, grp: number ) {
      account.value = {
        group: grp,
        address: acc,
        isConnected: true
      }
      const orderStore = useOrderStore()
      orderStore.startNewOrder(acc, grp)
    }
    
  return { account, setAccount }
})
