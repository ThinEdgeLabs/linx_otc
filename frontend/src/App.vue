<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useWalletConnectStore } from '@/stores/walletconnect'

import LinxMenu from '@/components/LinxMenu.vue'
import SelectWalletModal from '@/components/WalletSelect.vue'
import FooterComponent from './components/FooterComponent.vue'
import { useExtensionStore } from './stores/extension'
import { useAccountStore } from './stores'
import { usePopUpStore } from './stores/popup'
import PopUpView from './views/PopUpView.vue'
import { getMarketplaceConfig } from './config'

const popUpStore = usePopUpStore()
const deploymentNetwork = getMarketplaceConfig().network

onMounted(async () => {
  const wcStore = useWalletConnectStore()
  wcStore.checkExistingWCConnection()
  const store = useAccountStore()
  if (!store.account?.isConnected) {
    useExtensionStore().silentConnectExtension()
  }

  // Check if user acknowledged popup about dapp
  const hasApproved = localStorage.getItem('approveTerms')
  if (!hasApproved || hasApproved != deploymentNetwork) {
    popUpStore.setPopUp({
      title: 'Welcome to LinxOTC',
      type: 'warning',
      message: [
        'Please be aware that LinxOTC is in a BETA stage. This means there can be bugs, errors and, eventhough we strive to deliver a safe DApp, contracts could potentially become compromised which can result in losing all your funds.',
        'For lending and borrowing, the contracts are on group 0, please connect a wallet with the address on Group 0',
        '\bLinxOTC is currently on TESTNET',
        '\bUse this DApp at your own risk'
      ],
      showTerms: true,
      onAcknowledged: acknowledgedTerms,
      leftButtonTitle: 'Agree and Continue',
      rightButtonTitle: 'Cancel'
    })
  }
})

function acknowledgedTerms() {
  localStorage.setItem('approveTerms', deploymentNetwork)
  popUpStore.closePopUp()
}
</script>

<template>
  <main
    class="relative font-sans antialiased text-base text-core bg-core-darkest w-full min-h-screen px-[16px] lg:px-[10%]"
  >
    <header>
      <LinxMenu />
    </header>
    <RouterView :class="popUpStore.popUp ? 'fixed' : ''" />
    <FooterComponent />
    <SelectWalletModal />
    <PopUpView v-if="popUpStore.popUp" />
  </main>
</template>
