<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col space-y-[10px]">
    <p class="text-[32px] text-white font-extrabold">{{ props.title }}</p>
    <p class="text-[16px] text-white">{{ props.description }}</p>
  </div>
</template>
