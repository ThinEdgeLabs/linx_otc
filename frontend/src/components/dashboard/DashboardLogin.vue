<script setup lang="ts">
import WalletButton from '@/components/WalletButton.vue'
</script>

<template>
  <div class="flex flex-col w-full h-full py-[15%] items-center">
    <div class="text-[22px] font-extrabold text-core-lightest">
      Please Connect your Alephium Wallet
    </div>
    <div class="pb-[30px] text-core-light text-[14px]">Some useless text</div>
    <WalletButton />
  </div>
</template>
