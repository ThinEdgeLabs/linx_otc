<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import { useAccountStore } from '@/stores/account'
import { useExtensionStore } from '@/stores/extension'
import { useWalletConnectStore } from '@/stores/walletconnect'
import { ref } from 'vue'
import CustomButton from '@/components/CustomButton.vue'

const accountStore = useAccountStore()
const extensionStore = useExtensionStore()
const wcStore = useWalletConnectStore()

const account = accountStore.account
const isLoading = ref(false)

const connectExtension = async () => {
  isLoading.value = true
  extensionStore.connectExtension()
}

const connectWalletConnect = async () => {
  isLoading.value = true
  wcStore.connectWalletConnect()
}
</script>

<template>
  <div v-if="!account?.isConnected">
    <div v-if="isLoading">
      <div class="flex flex-col items-center pt-[30px] space-y-[30px]">
        <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[46px] lg:text-[60px]" />
        <p>Approve the connection in your wallet</p>
      </div>
    </div>
    <div v-else class="flex flex-col gap-4 mt-8">
      <div @click="connectWalletConnect()" class="p-4 rounded shadow bg-menu hover:bg-core">
        <img class="inline w-8 h-8 mr-4" src="@/assets/wcLogo.png" />
        <span class="font-extrabold text-white dark:text-white">WalletConnect</span>
      </div>
      <div @click="connectExtension()" class="p-4 rounded shadow bg-menu hover:bg-core">
        <img class="inline w-8 h-8 mr-4" src="@/assets/alph.png" />
        <span class="font-extrabold text-white">Extension Wallet</span>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col items-center space-y-[30px]">
    <div class="space-y-[12px] pt-[30px]">
      <p>
        You are connected with your wallet to LinxOTC. If you disconnect all saved data from your browser will be
        erased.
      </p>
      <div class="flex flex-row justify-between items-center px-[30px] pt-[30px]">
        <p class="text-core-lightest text-start font-extrabold">Connected account:</p>
        <p class="text-core-light text-start font-semibold">
          {{ shortenString(account.address, 12) }}
        </p>
      </div>
      <div class="flex flex-row justify-between items-center px-[30px] pb-[30px]">
        <p class="text-core-lightest text-start font-extrabold">Connected wallet:</p>
        <p class="text-core-light text-start font-semibold">
          {{ account.wallet }}
        </p>
      </div>
    </div>
    <p class="text-core-light">Do you want to logout?</p>
    <div @click="accountStore.disconnect" class="w-full">
      <CustomButton title="Logout" :class="'w-full'" />
    </div>
  </div>
</template>
