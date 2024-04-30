<script setup lang="ts">
import { ref } from 'vue'
</script>

<template>
  <div class="w-full flex flex-row bg-divider items-center justify-between px-[16px] rounded-lg h-[40px] max-w-[386px]">
    <p>All</p>
    <font-awesome-icon :icon="['fas', 'angle-down']" class="text-[18px] text-accent-3" />
  </div>
</template>
