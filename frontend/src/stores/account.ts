import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useOrderStore } from '@/stores/tradeOrder'
import { useExtensionStore } from '@/stores/extension'
import { useWalletConnectStore } from '@/stores/walletconnect'
import type { Wallet } from '@/types'
import { NodeProvider, ExplorerProvider, type SignerProvider } from '@alephium/web3'
import { getMarketplaceConfig } from '@/config'
import { useLoanStore } from './loans'

interface Account {
  address: string
  publicKey: string
  group: number
  isConnected: boolean
  wallet?: Wallet
  signerProvider?: SignerProvider
}

export const useAccountStore = defineStore('account', () => {
  const config = getMarketplaceConfig()
  const account = ref<Account | undefined>()
  const explorerProvider = shallowRef<ExplorerProvider>(new ExplorerProvider(config.defaultExplorerUrl))
  const nodeProvider = shallowRef<NodeProvider>(
    new NodeProvider(config.defaultNodeUrl, import.meta.env.VITE_ALEPHIUM_NODE_API_KEY as string)
  )
  const signer = shallowRef<SignerProvider | undefined>()

  async function setAccount(
    address: string,
    group: number,
    wallet: Wallet,
    publicKey: string,
    signerProv: SignerProvider,
    explorerProv?: ExplorerProvider,
    nodeProv?: NodeProvider
  ) {
    account.value = {
      group,
      publicKey,
      address,
      isConnected: true,
      wallet
    }
    signer.value = signerProv
    if (explorerProv) explorerProvider.value = explorerProv
    if (nodeProv) nodeProvider.value = nodeProv

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
    const loanStore = useLoanStore()
    loanStore.resetUserLoans()
    account.value = undefined
    orderStore.resetOrder()
  }

  function reconnect() {
    const wallet = account.value?.wallet
    disconnect()
    if (wallet === 'Extension') {
      const extension = useExtensionStore()
      extension.connectExtension()
    } else if (wallet === 'WalletConnect') {
      const wc = useWalletConnectStore()
      wc.connectWalletConnect()
    }
  }

  return { account, explorerProvider, nodeProvider, signer, setAccount, disconnect, reconnect }
})
