import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useExtensionStore } from '@/stores/extension'
import { useWalletConnectStore } from '@/stores/walletconnect'
import { useNodeStore } from '@/stores/node'
import type { Wallet } from '@/types/types'


interface Account {
  address: string,
  publicKey: string,
  group: number,
  isConnected: boolean,
  wallet?: Wallet
}

export const useAccountStore = defineStore('account', () => {
    const account = ref<Account | undefined>()
    const nodeProvider = useNodeStore();

    function setAccount(acc: string, grp: number, wallet: Wallet, publicKey: string ) {
      account.value = {
        group: grp,
        publicKey: publicKey,
        address: acc,
        isConnected: true,
        wallet: wallet
      }
      const orderStore = useOrderStore()
      orderStore.startNewOrder(acc, grp)

      getBalance(acc)
    }

    async function getBalance(address : string) {
      const balance = await nodeProvider.getBalance(address);
      console.log(balance)
    }

    function disconnect() {
      if (account.value?.wallet === "Extension") {
        const extensionStore = useExtensionStore();
        extensionStore.disconnectExtension()
      } else if (account.value?.wallet === "WalletConnect"){
        // Walletconnect disconnect
        const wcStore = useWalletConnectStore();
        wcStore.disconnectWalletConnect();
      }
      account.value = undefined
    }
    
  return { account, setAccount, disconnect, getBalance }
})
