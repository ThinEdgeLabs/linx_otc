<script setup lang="ts">
import { useLoginStore } from '@/stores/login'
import LoginModalVue from './LoginModal.vue'

const loginStore = useLoginStore()
</script>

<template>
  <div
    v-if="loginStore.showModal"
    class="absolute top-0 left-0 w-full h-screen flex justify-center items-center bg-core-darkest bg-opacity-50 backdrop-blur-md dark:text-core-light z-30"
  >
    <section class="pt-4 pb-12 px-8 py-5 rounded-lg bg-core-darkest max-w-[500px]">
      <div>
        <h3 class="flex justify-between items-baseline text-2xl font-extrabold leading-10 text-white">
          Connect Wallet
          <font-awesome-icon
            :icon="['far', 'xmark']"
            @click="loginStore.toggleModal"
            class="text-2xl/[18] text-accent-1 cursor-pointer"
          />
        </h3>
        <div class="text-start text-white opacity-75">
          <p>Connect with a supported Alephium wallet</p>
        </div>
      </div>
      <LoginModalVue />
    </section>
  </div>
</template>
