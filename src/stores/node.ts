import { ref } from 'vue'
import { defineStore } from 'pinia'
import { NodeProvider } from '@alephium/web3'

export const useNodeStore = defineStore('nodeProvider', () => {
    const nodeProvider = ref<NodeProvider | undefined>()

    function init() {
      nodeProvider.value = new NodeProvider(import.meta.env.VITE_ALPH_NODE)
    }   

    async function getBalance(address : string) {
      if (nodeProvider.value === undefined) {
        init()
      }
      const balance = await nodeProvider.value!.addresses.getAddressesAddressBalance(address);
      return balance
    }
    
  return { nodeProvider, getBalance }
})