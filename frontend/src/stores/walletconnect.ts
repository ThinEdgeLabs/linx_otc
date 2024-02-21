import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAccountStore } from '@/stores/account'
import { useLoginStore } from '@/stores/login'
import { WalletConnectProvider } from '@alephium/walletconnect-provider'
import { WalletConnectModal } from '@walletconnect/modal'

export const useWalletConnectStore = defineStore('walletconnect', () => {
  const wcIsConnected = ref(false)
  const wcProvider = ref<WalletConnectProvider | undefined>(undefined)

  const accountStore = useAccountStore()
  const loginStore = useLoginStore()

  const projectID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

  const modal = new WalletConnectModal({
    projectId: projectID
  })

  async function connectWalletConnect() {
    await initWC()
    try {
      connect()
      wcProvider.value!.on('displayUri', async (e) => {
        // Show QR Code to user
        await modal.openModal({ uri: e })
        loginStore.toggleModal()
      })
    } catch (error) {
      console.log('connection: ', error)
    }
  }

  async function connect() {
    await wcProvider
      .value!.connect()
      .then(async () => {
        modal.closeModal()
        await setAccount()
      })
      .catch((error) => {
        console.log('WalletConnect connection error: ', error)
      })
  }

  async function checkExistingWCConnection() {
    if (wcProvider.value === undefined) {
      await initWC()
    }
    if (wcProvider.value!.session?.acknowledged) {
      connect()
    }
  }

  async function initWC() {
    wcProvider.value = await WalletConnectProvider.init({
      projectId: projectID,
      networkId: 'mainnet',
      onDisconnected() {
        console.log('disconnected walletconnect')
      }
    })
  }

  async function setAccount() {
    const account = await wcProvider.value!.getSelectedAccount()
    if (account) {
      accountStore.setAccount(account.address, account.group, 'WalletConnect', account.publicKey)
      wcIsConnected.value = true
      if (loginStore.showModal) {
        loginStore.toggleModal()
      }
    }
  }

  async function disconnectWalletConnect() {
    try {
      await wcProvider.value?.disconnect()
    } catch (error) {
      console.log(error)
    }
    wcProvider.value = undefined
    loginStore.toggleModal()
  }

  return { wcIsConnected, connectWalletConnect, disconnectWalletConnect, checkExistingWCConnection }
})
