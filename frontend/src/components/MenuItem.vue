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
    class="flex uppercase lg:py-[20px] items-center lg:py-[40px] text-[14px] border-r-[4px] lg:border-b-[4px] lg:border-r-0 h-[20px]"
    :class="
      props.isSelected ? 'text-accent-3  border-accent-3 font-extrabold' : ' border-transparent'
    "
    :to="props.destination"
    >{{ props.title }}</RouterLink
  >
</template>
