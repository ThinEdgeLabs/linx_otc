import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getDefaultAlephiumWallet } from "@alephium/get-extension-wallet"
import { useAccountStore } from '@/stores/account'
import { useLoginStore } from '@/stores/login'


export const useExtensionStore = defineStore('extension', () => {
    const extensionIsConnected = ref(false)

    const accountStore = useAccountStore()
    const loginStore = useLoginStore()

    async function connectExtension() {
        console.log("connecting to extension")
        try {
            const windowAlephium = await getDefaultAlephiumWallet()
            if (!windowAlephium) {
                throw new Error("Extension not installed")
            }
            const selectedAccount = await windowAlephium?.enable({networkId: "mainnet"})
            .then((res) => {
                console.log(res)
                extensionIsConnected.value = true
                accountStore.setAccount(res.address, res.group, "Extension", res.publicKey )
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

    async function disconnectExtension() {
        try {
            const windowAlephium = await getDefaultAlephiumWallet()
            windowAlephium?.disconnect()
        } catch (error) {
            console.log(error)
        }
        loginStore.toggleModal()
     }

    
  return { extensionIsConnected, connectExtension, disconnectExtension }
})