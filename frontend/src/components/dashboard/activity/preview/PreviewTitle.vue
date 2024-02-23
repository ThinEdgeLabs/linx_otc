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
  <div class="flex flex-col">
    <p class="text-[22px] font-extrabold text-core-lightest">{{ props.title }}</p>
    <p class="text-[14px] text-core-light">{{ props.description }}</p>
  </div>
</template>
