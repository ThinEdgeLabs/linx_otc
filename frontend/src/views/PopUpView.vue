<script setup lang="ts">
import WarningMessage from '@/components/WarningMessage.vue'
import { usePopUpStore } from '@/stores/popup'

const popUpStore = usePopUpStore()
</script>

<template>
  <section
    class="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center bg-core-darkest bg-opacity-50 backdrop-blur-md z-30 leading-snug"
  >
    <WarningMessage v-if="popUpStore.showPopUp && popUpStore.popUp?.type === 'warning'" :pop-up="popUpStore.popUp" />
  </section>
</template>
