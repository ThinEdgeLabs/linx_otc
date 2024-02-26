<script setup lang="ts">
const props = defineProps({
  backgroundColor: {
    type: String,
    default: 'divider'
  }
})
</script>

<template>
  <div :class="`h-0.5 border-t-0 bg-${props.backgroundColor}`"></div>
</template>
