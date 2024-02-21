<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
})
</script>

<template>
  <div class="w-full">
    <p class="text-[34px] text-core-lightest font-extrabold">{{ props.title }}</p>
    <p v-if="props.description" class="text-[14px] text-core-light">{{ props.description }}</p>
  </div>
</template>
