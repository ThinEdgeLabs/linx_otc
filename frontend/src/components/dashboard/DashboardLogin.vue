<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import { useLoginStore } from '@/stores/login'
const loginStore = useLoginStore()
</script>

<template>
  <div class="flex flex-col w-full h-full py-[15%] items-center text-center">
    <font-awesome-icon :icon="['fat', 'plug']" class="text-[38px] text-accent-3 pb-[30px]" />
    <div class="text-[22px] font-extrabold text-core-lightest mb-[30px]">Please connect your Alephium wallet</div>
    <!-- <div class="invisible lg:flex pb-[30px] text-core-light text-[14px]">Lorem ipsum</div> -->
    <CustomButton :title="'Connect wallet'" :class="'w-[200px]'" @click="loginStore.toggleModal()" />
  </div>
</template>
