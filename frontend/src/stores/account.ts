import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useOrderStore } from '@/stores/tradeOrder'
import { useExtensionStore } from '@/stores/extension'
import { useWalletConnectStore } from '@/stores/walletconnect'
import { useNodeStore } from '@/stores/node'
import type { Wallet } from '@/types'
import { NodeProvider, ExplorerProvider, type SignerProvider } from '@alephium/web3'
import { getMarketplaceConfig } from '@/config'

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
  const nodeProvider = shallowRef<NodeProvider>(new NodeProvider(config.defaultNodeUrl))
  const signer = shallowRef<SignerProvider | undefined>()
  const _nodeProvider = useNodeStore()

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

    await _nodeProvider.getBalance(address, true)

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
    account.value = undefined
    orderStore.resetOrder()
    
  }

  return { account, explorerProvider, nodeProvider, signer, setAccount, disconnect }
})
