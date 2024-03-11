import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Token } from '@/types'
import { convertAmountWithDecimals, addressFromPublicKey } from '@alephium/web3'
import { tradeFee } from '@/config'
import { useNodeStore } from './node'
import { useAccountStore } from './account'

interface Order {
  from: string
  groupFrom: number
  to: string | undefined
  toPubKey: string | undefined
  groupTo: number | undefined
  tokenFrom: Token | undefined
  amountFrom: number
  tokenTo: Token | undefined
  amountTo: number
}

export const useOrderStore = defineStore('order', () => {
  const order = ref<Order | undefined>()

  function setFromToken(token: Token) {
    order.value!.tokenFrom = token
  }

  function setToToken(token: Token) {
    order.value!.tokenTo = token
  }

  function setFromAmount(amount: number) {
    order.value!.amountFrom = amount
  }

  function setAmountTo(amount: number) {
    order.value!.amountTo = amount
  }

  function setReceiver(address: string, group: number, pubKey: string) {
    order.value!.to = address
    order.value!.groupTo = group
    order.value!.toPubKey = pubKey
  }

  function startNewOrder(receiver: string, group: number) {
    order.value = {
      from: receiver,
      groupFrom: group,
      to: undefined,
      toPubKey: undefined,
      groupTo: undefined,
      tokenFrom: undefined,
      amountFrom: 0.0,
      tokenTo: undefined,
      amountTo: 0.0
    }
  }

  function resetOrder() {
    order.value = undefined
  }

  async function createOrder() {
    const node = useNodeStore()
    const account = useAccountStore()

    const offerAmount = convertAmountWithDecimals(order.value!.amountFrom * (1 -tradeFee), order.value!.tokenFrom!.decimals)
    const requestAmount = convertAmountWithDecimals(order.value!.amountTo * (1 - tradeFee), order.value!.tokenTo!.decimals)
    const feeRequester = convertAmountWithDecimals(order.value!.amountFrom, order.value!.tokenFrom!.decimals) - offerAmount
    const feeRecipient = convertAmountWithDecimals(order.value!.amountTo, order.value!.tokenTo!.decimals) - requestAmount

    const tx = {
      from: [
        // From sender to receiver for now without the fee
        { fromPublicKey: account.account!.publicKey,
        destinations: [
          {
            address: order.value!.to,
            attoAlphAmount: order.value!.tokenFrom!.symbol === 'ALPH' ? offerAmount!.toString() : null,
            // tokens: order.value.tokenFrom.symbol != 'ALPH' ?[
            //   { id: order.value.tokenFrom!.contractId, amount: offerAmount.toString() }
            // ] : null
          }
        ]
        },
        {
          fromPublicKey: order.value!.toPubKey,
          destinations: [
            {
              address: order.value!.from,
              attoAlphAmount: order.value!.tokenTo!.symbol === 'ALPH' ? requestAmount!.toString() : null,
              // tokens: order.value.tokenTo.symbol != 'ALPH' ?[
              //   { id: order.value.tokenTo!.contractId, amount: requestAmount.toString() }
              // ] : null
            }
          ]
        
        }
        ]}
        const unsignedTx = await node.nodeProvider!.transactions.postTransactionsBuildMultiAddresses(tx)
        return unsignedTx
    }

  return { order, setFromToken, setToToken, setFromAmount, setAmountTo, setReceiver, startNewOrder, resetOrder, createOrder }
})
