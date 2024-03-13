import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Token } from '@/types'
import { DUST_AMOUNT, convertAmountWithDecimals } from '@alephium/web3'
import { tradeFee } from '@/config'
import { useNodeStore } from './node'
import { useAccountStore } from './account'
import { node } from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

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

  function returnGasComponent(from:boolean) {
    if (from) {
      if (order.value?.tokenFrom?.symbol != 'ALPH') {
        return { address: order.value!.from, attoAlphAmount: DUST_AMOUNT }
      } 
    } else {
      if (order.value?.tokenTo?.symbol != 'ALPH') {
        return { address: order.value!.from, attoAlphAmount: DUST_AMOUNT }
      }
    }
  }

  async function createOrder() {
    const node = useNodeStore()
    const account = useAccountStore()

    const gasPayer = new PrivateKeyWallet({privateKey: import.meta.env.VITE_GAS_KEY, nodeProvider: node.nodeProvider})

    const offerAmount = convertAmountWithDecimals(
      order.value!.amountFrom * (1 - tradeFee),
      order.value!.tokenFrom!.decimals
    )
    const requestAmount = convertAmountWithDecimals(
      order.value!.amountTo * (1 - tradeFee),
      order.value!.tokenTo!.decimals
    )
    const feeRequester =
      convertAmountWithDecimals(order.value!.amountFrom * tradeFee, order.value!.tokenFrom!.decimals)
    const feeRecipient =
      convertAmountWithDecimals(order.value!.amountTo * tradeFee, order.value!.tokenTo!.decimals)

    const tx = {
      from: [
        // From sender to receiver for now without the fee
        {
          fromPublicKey: account.account!.publicKey,
          destinations: [
            {
              address: order.value!.to,
              attoAlphAmount: order.value!.tokenFrom!.symbol === 'ALPH' ? offerAmount!.toString() : DUST_AMOUNT,
              tokens: order.value!.tokenFrom!.symbol != 'ALPH' ?[
                { id: order.value!.tokenFrom!.contractId, amount: offerAmount!.toString() }
              ] : null
            },
            { 
              address: gasPayer.address,

              attoAlphAmount: order.value!.tokenFrom!.symbol === 'ALPH' ? feeRequester!.toString() : DUST_AMOUNT,
              tokens: order.value!.tokenFrom!.symbol != 'ALPH' ?[
                { id: order.value!.tokenFrom!.contractId, amount: feeRequester!.toString() }
              ] : null
            }
          ],
          gasAmount: 0
        },
        {
          fromPublicKey: order.value!.toPubKey,
          destinations: [
            {
              address: order.value!.from,
              attoAlphAmount: order.value!.tokenTo!.symbol === 'ALPH' ? requestAmount!.toString() : DUST_AMOUNT,
              tokens: order.value!.tokenTo!.symbol != 'ALPH' ?[
                { id: order.value!.tokenTo!.contractId, amount: requestAmount!.toString() }
              ] : null
            },
            { 
              address: gasPayer.address,

              attoAlphAmount: order.value!.tokenFrom!.symbol === 'ALPH' ? feeRecipient!.toString() : DUST_AMOUNT,
              tokens: order.value!.tokenFrom!.symbol != 'ALPH' ?[
                { id: order.value!.tokenFrom!.contractId, amount: feeRecipient!.toString() }
              ] : null
            }
          ],
          gasAmount: 0,
        },
        {
          fromPublicKey: gasPayer.publicKey,
          destinations: [
            returnGasComponent(true),
            returnGasComponent(false)
          ],
          gasAmount: 75000,
        }
      ]
    }
    const unsignedTx = await node.nodeProvider!.transactions.postTransactionsBuildMultiAddresses(
      tx as node.BuildMultiAddressesTransaction
    )
    const signedForGas = await gasPayer.signUnsignedTx({signerAddress: gasPayer.address, unsignedTx:unsignedTx.unsignedTx})
    
    return {tx: unsignedTx, sigs: [signedForGas.signature]}
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
