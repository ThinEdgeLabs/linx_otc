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
    class="px-[20px] py-[10px] rounded-[20px] bg-gradient-to-r from-accent-1 to-accent-2 text-[14px] text-white font-semibold hover:bg-none hover:bg-accent-2"
  >
    Connect wallet
  </button>
  <button
    v-else
    @click="toggleModal"
    class="p-[10px] rounded-[20px] border-2 border-accent-1 text-[14px] text-white font-semibold hover:bg-none hover:bg-accent-2"
  >
    <div class="flex space-x-[10px] items-center">
      <img :src="`./images/ALPH-light.png`" class="w-[20px] h-[20px] rounded-full" />
      <div>{{ shortenString(account.account.address, 16) }}</div>
    </div>
  </button>
</template>
