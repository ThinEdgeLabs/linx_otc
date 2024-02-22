<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
</script>

<template>
  <div class="flex flex-col w-full h-full py-[15%] items-center">
    <font-awesome-icon :icon="['fat', 'plug']" class="text-[38px] text-accent-3 pb-[30px]" />
    <div class="text-[22px] font-extrabold text-core-lightest">Please Connect your Alephium Wallet</div>
    <div class="pb-[30px] text-core-light text-[14px]">Some useless text</div>
    <CustomButton :title="'Connect wallet'" :class="'w-[200px]'" />
  </div>
</template>
