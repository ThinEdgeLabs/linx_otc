<script setup lang="ts">
const props = defineProps({
  type: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="text-[16px] font-extrabold text-core-lightest">{{ props.type }} offer #{{ props.id }}</div>
    <div class="text-[12px] font-semibold text-core-light">Created on {{ props.date.toDateString() }}</div>
  </div>
</template>
