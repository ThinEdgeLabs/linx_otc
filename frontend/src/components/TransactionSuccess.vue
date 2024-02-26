<script setup lang="ts">
import { copyToClipboard } from '@/functions/utils'
import CustomButton from './CustomButton.vue'
import { onMounted, ref } from 'vue'

const emits = defineEmits<{
  (e: 'update:finished'): void
}>()

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  txId: {
    type: String,
    required: true
  }
})

const timer = ref(20)

async function startTimer() {
  while (timer.value > 0) {
    //TODO: Set timeout to 60 seconds once everything is ready
    await new Promise((resolve) => setTimeout(resolve, 1000))
    timer.value--
  }
  emits('update:finished')
}

async function copy() {
  await copyToClipboard(props.txId)
}

onMounted(() => startTimer())
</script>

<template>
  <section
    class="flex flex-col w-full min-h-full bg-menu rounded-lg py-[30px] px-[20px] lg:px-0 lg:py-0 space-y-[30px] justify-center items-center"
  >
    <div class="flex bg-ok w-[60px] h-[60px] rounded-full justify-center items-center">
      <font-awesome-icon :icon="['fal', 'check']" class="text-core-lightest text-[27px]" />
    </div>
    <div class="flex flex-col space-y-[10px] items-center">
      <p class="text-[22px] font-extrabold text-core-lightest">{{ props.title }}</p>
      <p class="text-[16px] text-core-light">{{ props.description }}</p>
    </div>
    <button
      class="w-[60%] bg-core-lightest rounded-lg py-[20px] text-center text-core-darkest text-[14px] font-extrabold"
      @click="
        {
        }
      "
    >
      {{ props.txId }}
    </button>
    <div
      class="w-full flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 lg:space-x-[30px] items-center justify-center"
    >
      <CustomButton :title="'Copy'" :icon="'copy'" @click="copy()" :class="'w-full lg:w-[228px]'" />
      <CustomButton
        :open="true"
        :title="'Continue'"
        @click="$emit('update:finished')"
        :class="'w-full lg:w-[228px] border-0 bg-core-darkest text-core-lightest'"
      />
    </div>
  </section>
</template>
