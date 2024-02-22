<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useWalletConnectStore } from '@/stores/walletconnect'

import LinxMenu from '@/components/LinxMenu.vue'
import SelectWalletModal from '@/components/WalletSelect.vue'
import FooterComponent from './components/FooterComponent.vue'
import { useExtensionStore } from './stores/extension'

onMounted(() => {
  const wcStore = useWalletConnectStore()
  wcStore.checkExistingWCConnection()
  useExtensionStore().silentConnectExtension()
})
</script>

<template>
  <main class="relative font-sans antialiased text-base text-core bg-core-darkest w-full min-h-screen px-[10%]">
    <header>
      <LinxMenu />
    </header>
    <RouterView />
    <FooterComponent />
    <SelectWalletModal />
  </main>
</template>
