import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Order {
  from: string,
  to: string,
  tokenFrom: string,
  amountFrom: number,
  tokenTo: string,
  amountTo: number,
}

export const useOrderStore = defineStore('order', () => {
    const order = ref<Order | undefined>()

    function setFromToken(token: string) {
        order.value!.tokenFrom = token
    }

    function setToToken(token: string) {
        order.value!.tokenTo = token
    }

    function setFromAmount(amount: number) {
        order.value!.amountFrom = amount
    }
    
    function setAmountTo(amount: number) {
        order.value!.amountTo = amount
    }

    function setReceiver(receiver: string) {
        order.value!.to = receiver
    }
    
  return { order, setFromToken, setToToken, setFromAmount, setAmountTo, setReceiver }
})
