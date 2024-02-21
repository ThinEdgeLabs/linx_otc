<script setup lang="ts">
import { useLoginStore } from '@/stores/login'
import LoginModalVue from './LoginModal.vue'

const loginStore = useLoginStore()
</script>

<template>
  <div
    v-if="loginStore.showModal"
    class="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-core-darkest bg-opacity-50 backdrop-blur-md dark:text-core-light"
  >
    <section class="pt-4 pb-12 px-8 space-y-[20px] rounded-lg bg-core-darkest">
      <div>
        <h3 class="flex justify-between items-baseline text-2xl font-extrabold leading-10 text-white">
          Connect Wallet
          <font-awesome-icon
            :icon="['far', 'xmark']"
            @click="loginStore.toggleModal"
            class="text-2xl/[18] text-accent-1"
          />
        </h3>
        <div class="text-start text-white opacity-75">
          <p>Select the Alephium wallet you want to connect to</p>
        </div>
      </div>
      <LoginModalVue />
    </section>
  </div>
</template>
