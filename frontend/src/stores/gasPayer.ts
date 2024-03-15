import { ref } from 'vue'
import { defineStore } from 'pinia'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { useNodeStore } from './node'

export const useGasPayerStore = defineStore('gasPayer', () => {
  const gasPayer = ref<PrivateKeyWallet | undefined>()
  const nodeStore = useNodeStore()

  if (gasPayer.value === undefined) {
    // Init gaspayer account
    const wallet = new PrivateKeyWallet({
      privateKey: import.meta.env.VITE_GAS_KEY,
      nodeProvider: nodeStore.nodeProvider
    })
    gasPayer.value = wallet
  }

  return { gasPayer }
})
