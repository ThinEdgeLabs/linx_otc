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
    class="uppercase py-[40px] text-[14px]"
    :class="
      props.isSelected
        ? 'text-accent-3  border-b-[4px] border-accent-3 font-extrabold'
        : 'border-b-[4px] border-transparent'
    "
    :to="props.destination"
    >{{ props.title }}</RouterLink
  >
</template>
