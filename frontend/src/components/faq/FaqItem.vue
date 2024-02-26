<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
})

const isOpen = ref(false)
</script>

<template>
  <button class="w-full flex flex-col p-[20px] bg-menu" @click="isOpen = !isOpen">
    <div class="flex flex-row w-full justify-between items-center text-[16px] lg:text-[24px] text-start">
      <p class="font-semibold text-core-lightest">{{ props.question }}</p>
      <font-awesome-icon :icon="['fal', 'plus']" class="text-lg text-accent-3 ]" />
    </div>
    <p v-if="isOpen" class="text-core-light text-start pt-[30px]">{{ props.answer }}</p>
  </button>
</template>
