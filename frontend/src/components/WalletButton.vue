<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import { useAccountStore } from '@/stores/account'
import { useLoginStore } from '@/stores/login'

const account = useAccountStore()
const loginStore = useLoginStore()

function toggleModal() {
  loginStore.toggleModal()
}
</script>

<template>
  <button
    v-if="!account.account?.isConnected"
    @click="toggleModal"
    class="px-[40px] py-[15px] rounded-full bg-gradient-to-r from-accent-1 to-accent-2 text-[14px] leading-snug text-core-lightest hover:bg-none hover:bg-accent-3 w-full lg:w-auto"
  >
    Connect wallet
  </button>
  <button
    v-else
    @click="toggleModal"
    class="px-[15px] py-[10px] rounded-full border border-accent-3 text-[14px] leading-snug text-core-lightest hover:bg-none hover:bg-accent-3 w-full lg:w-auto"
  >
    <div class="flex space-x-[10px] justify-center items-center">
      <img :src="`/images/tokens/ALPH-light.png`" class="w-[20px] h-[20px] rounded-full" />
      <div>{{ shortenString(account.account.address, 12) }}</div>
    </div>
  </button>
</template>
