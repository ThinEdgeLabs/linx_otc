import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { useAccountStore } from '@/stores/account'
import { useLoginStore } from '@/stores/login'

export const useExtensionStore = defineStore('extension', () => {
  const extensionIsConnected = ref(false)

  const accountStore = useAccountStore()
  const loginStore = useLoginStore()

  async function connectExtension() {
    console.log('connecting to extension')
    try {
      const windowAlephium = await getDefaultAlephiumWallet()
      if (!windowAlephium) {
        throw new Error('Extension not installed')
      }
      windowAlephium
        ?.enable({ networkId: import.meta.env.VITE_NETWORK_ID, onDisconnected() {
          extensionIsConnected.value = false
        }})
        .then((res) => {
          extensionIsConnected.value = true
          accountStore.setAccount(res.address, res.group, 'Extension', res.publicKey)
          loginStore.toggleModal()
        })
        .catch((err) => {
          loginStore.toggleModal()
          alert(err)
        })
    } catch (error) {
      loginStore.toggleModal()
      alert(error)
    }
  }

  async function silentConnectExtension() {
    const alephium = await getDefaultAlephiumWallet()
    if (alephium === undefined) {
      return undefined
    }
    alephium?.enableIfConnected({ onDisconnected() {
      extensionIsConnected.value = false
    }, networkId: import.meta.env.VITE_NETWORK_ID })
    .then((res) => {
      if (res === undefined) {
        extensionIsConnected.value = false
      } else {
        extensionIsConnected.value = true
        accountStore.setAccount(res.address, res.group, 'Extension', res.publicKey)
      }
    })
    .catch((error: any) => {
      console.error(error)
      return undefined
    })
  }

  async function disconnectExtension() {
    try {
      const windowAlephium = await getDefaultAlephiumWallet()
      windowAlephium?.disconnect()
    } catch (error) {
      console.log(error)
    }
    loginStore.toggleModal()
  }

  return { extensionIsConnected, connectExtension, disconnectExtension, silentConnectExtension }
})
