<script setup lang="ts">
const account = {
  isConnected: false,
  address: '0x1234567890123456789012345678901234567890'
}

function toggleModal() {
  console.log('toggle modal')
}
</script>

<template>
  <button
    v-if="!account.isConnected"
    @click="toggleModal"
    class="px-[20px] py-[10px] rounded bg-gradient-to-r from-accent-1 to-accent-2 text-[14px] text-white font-semibold hover:bg-none hover:bg-accent-2"
  >
    Connect wallet
  </button>
  <button
    v-else
    @click="toggleModal"
    class="p-[10px] rounded border-2 border-accent-1 text-[14px] text-white font-semibold hover:bg-none hover:bg-accent-2"
  >
    <div class="flex space-x-[10px]">
      <div>{{ account.address }}</div>
    </div>
  </button>
</template>
