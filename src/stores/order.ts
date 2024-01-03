import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Order {
  from: string,
  groupFrom: number,
  to: string,
  groupTo: number | undefined,
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

    function setReceiver(receiver: string, group: number) {
        order.value!.to = receiver
        order.value!.groupTo = group
    }

    function startNewOrder(receiver: string, group: number) {
            order.value = {
                from: receiver,
                groupFrom: group,
                to: "",
                groupTo: undefined,
                tokenFrom: "Alephium",
                amountFrom: 0,
                tokenTo: "",
                amountTo: 0
            }
    }
    
  return { order, setFromToken, setToToken, setFromAmount, setAmountTo, setReceiver, startNewOrder}
})
