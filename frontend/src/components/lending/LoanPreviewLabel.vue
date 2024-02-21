<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  amount_description: {
    type: String,
    required: false
  }
})
</script>

<template>
  <div class="flex flex-row justify-between items-center w-full text-[14px]">
    <p class="font-semibold text-core-light">{{ props.title }}</p>
    <div class="flex flex-row items-center space-x-[10px]">
      <p class="font-extrabold text-core-lightest">{{ props.amount }}</p>
      <p v-if="props.amount_description" class="text-core-light">{{ props.amount_description }}</p>
    </div>
  </div>
</template>
