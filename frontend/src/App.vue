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
      title: 'Welcome to Linx OTC',
      type: 'warning',
      message: [
        'Please be aware that Linx OTC is still in the BETA phase. This means there may be bugs and errors. Despite our efforts to deliver a safe DApp, contracts could potentially become compromised, which could result in the loss of all your funds.',
        '\bLinx Labs is not responsible for any loss of funds, use this DApp at your own risk.'
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
  <main class="relative font-sans antialiased text-base text-core bg-core-darkest min-h-screen px-[16px] lg:px-[10%]">
    <div class="container mx-auto min-h-screen flex flex-col">
      <header>
        <LinxMenu />
      </header>
      <RouterView :class="popUpStore.popUp ? 'fixed' : ''" class="mb-auto" />
      <FooterComponent />
      <SelectWalletModal />
      <PopUpView v-if="popUpStore.popUp" />
    </div>
  </main>
</template>
