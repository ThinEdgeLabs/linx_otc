<script setup lang="ts">
const props = defineProps({
  message: String
})
</script>

<template>
  <div class="h-[14px] text-danger text-[12px]" :class="props.message ? 'flex' : 'invisible'">
    {{ props.message }}
  </div>
</template>
