import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useOrderStore } from '@/stores/tradeOrder'
import { useExtensionStore } from '@/stores/extension'
import { useWalletConnectStore } from '@/stores/walletconnect'
import { useNodeStore } from '@/stores/node'
import type { Wallet } from '@/types'

interface Account {
  address: string
  publicKey: string
  group: number
  isConnected: boolean
  wallet?: Wallet
}

export const useAccountStore = defineStore('account', () => {
  const account = ref<Account | undefined>()
  const nodeProvider = useNodeStore()

  async function setAccount(address: string, group: number, wallet: Wallet, publicKey: string) {
    account.value = {
      group,
      publicKey,
      address,
      isConnected: true,
      wallet
    }

    await nodeProvider.getBalance(address, true)

    const orderStore = useOrderStore()
    orderStore.startNewOrder(address, group)
  }

  function disconnect() {
    if (account.value?.wallet === 'Extension') {
      const extensionStore = useExtensionStore()
      extensionStore.disconnectExtension()
    } else if (account.value?.wallet === 'WalletConnect') {
      // Walletconnect disconnect
      const wcStore = useWalletConnectStore()
      wcStore.disconnectWalletConnect()
    }
    const orderStore = useOrderStore()
    orderStore.resetOrder()
    account.value = undefined
  }

  return { account, setAccount, disconnect }
})
