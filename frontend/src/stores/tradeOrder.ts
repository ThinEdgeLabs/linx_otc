import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Token } from '@/types'
import { DUST_AMOUNT, convertAmountWithDecimals } from '@alephium/web3'
import { feeAddress, tradeFee } from '@/config'
import { useNodeStore } from './node'
import { useAccountStore } from './account'
import { node } from '@alephium/web3'
import { useGasPayerStore } from './gasPayer'

export interface Order {
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

  async function createOrder(useGasPayer: boolean) {
    const node = useNodeStore()
    const account = useAccountStore()
    const gasPayer = useGasPayerStore()

    const offerAmount = convertAmountWithDecimals(
      order.value!.amountFrom * (1 - tradeFee),
      order.value!.tokenFrom!.decimals
    )
    const requestAmount = convertAmountWithDecimals(
      order.value!.amountTo * (1 - tradeFee),
      order.value!.tokenTo!.decimals
    )
    const feeRequester = convertAmountWithDecimals(order.value!.amountFrom * tradeFee, order.value!.tokenFrom!.decimals)
    const feeRecipient = convertAmountWithDecimals(order.value!.amountTo * tradeFee, order.value!.tokenTo!.decimals)

    const tx = {
      from: [
        // From sender to receiver for now without the fee
        {
          fromPublicKey: account.account!.publicKey,
          destinations: [
            {
              address: order.value!.to,
              ...(order.value!.tokenFrom!.symbol === 'ALPH' && { attoAlphAmount: offerAmount!.toString() }),
              ...(order.value!.tokenFrom!.symbol != 'ALPH' && { attoAlphAmount: DUST_AMOUNT }),
              ...(order.value!.tokenFrom!.symbol != 'ALPH' && {
                tokens: [{ id: order.value!.tokenFrom!.contractId, amount: offerAmount!.toString() }]
              })
            },
            {
              address: feeAddress,
              ...(order.value!.tokenFrom!.symbol === 'ALPH' && { attoAlphAmount: feeRequester!.toString() }),
              ...(order.value!.tokenFrom!.symbol != 'ALPH' && { attoAlphAmount: '0' }),
              ...(order.value!.tokenFrom!.symbol != 'ALPH' && {
                tokens: [{ id: order.value!.tokenFrom!.contractId, amount: feeRequester!.toString() }]
              })
            }
          ],
          ...(useGasPayer && { gasAmount: 0 })
        },
        {
          fromPublicKey: order.value!.toPubKey,
          destinations: [
            {
              address: order.value!.from,
              ...(order.value!.tokenTo!.symbol === 'ALPH' && { attoAlphAmount: requestAmount!.toString() }),
              ...(order.value!.tokenTo!.symbol != 'ALPH' && { attoAlphAmount: DUST_AMOUNT }),
              ...(order.value!.tokenTo!.symbol != 'ALPH' && {
                tokens: [{ id: order.value!.tokenTo!.contractId, amount: requestAmount!.toString() }]
              })
            },
            {
              address: feeAddress,
              ...(order.value!.tokenTo!.symbol === 'ALPH' && { attoAlphAmount: feeRecipient!.toString() }),
              ...(order.value!.tokenTo!.symbol != 'ALPH' && { attoAlphAmount: '0' }),
              ...(order.value!.tokenTo!.symbol != 'ALPH' && {
                tokens: [{ id: order.value!.tokenTo!.contractId, amount: feeRecipient!.toString() }]
              })
            }
          ],
          ...(useGasPayer && { gasAmount: 0 })
        }
      ]
    }
    if (useGasPayer) {
      tx.from.unshift({
        fromPublicKey: gasPayer.gasPayer?.publicKey,
        destinations: [
          {
            address: gasPayer.gasPayer!.address,
            attoAlphAmount: DUST_AMOUNT
          }
        ],
        gasAmount: 75000
      })
    }
    console.log(tx)
    const unsignedTx = await node.nodeProvider!.transactions.postTransactionsBuildMultiAddresses(
      tx as node.BuildMultiAddressesTransaction
    )

    return unsignedTx
  }

  return {
    order,
    setFromToken,
    setToToken,
    setFromAmount,
    setAmountTo,
    setReceiver,
    startNewOrder,
    resetOrder,
    createOrder
  }
})
