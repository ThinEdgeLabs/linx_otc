<script setup lang="ts">
import { RouterView } from 'vue-router'
import LinxMenu from '@/components/LinxMenu.vue'
</script>

<template>
  <main
    class="font-sans antialiased text-base text-core bg-core-darkest w-full min-h-screen px-[10%]"
  >
    <header>
      <LinxMenu />
    </header>
    <RouterView />
  </main>
</template>
