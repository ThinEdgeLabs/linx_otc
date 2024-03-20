<script setup lang="ts">
import { RouterLink } from 'vue-router'
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  isSelected: {
    required: true,
    type: Boolean
  }
})
</script>

<template>
  <RouterLink
    class="flex uppercase lg:py-[30px] items-center text-[14px] h-[40px] border-r-[4px] lg:border-b-[4px] lg:border-r-0"
    :class="props.isSelected ? 'text-accent-3  border-accent-3 font-extrabold' : ' border-transparent'"
    :to="props.title === 'Docs' ? $route.fullPath : props.destination"
    >{{ props.title }}</RouterLink
  >
</template>
