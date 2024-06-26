<script setup lang="ts">
import { copyToClipboard } from '@/functions/utils'
import CustomButton from './CustomButton.vue'
import { onMounted, ref } from 'vue'
import { getMarketplaceConfig } from '@/config'
import { shortenString } from '@/functions/stringUtils'

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

const timer = ref(60)

async function startTimer() {
  while (timer.value > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    timer.value--
  }
  emits('update:finished')
}

async function copy() {
  await copyToClipboard(props.txId)
}

function goToExplorer(link: string) {
  const mpConfig = getMarketplaceConfig()
  window.open(
    `https://${mpConfig.network === 'testnet' ? 'testnet' : 'explorer'}.alephium.org/transactions/${link}`,
    '_blank'
  )
}

onMounted(() => startTimer())
</script>

<template>
  <section
    class="flex flex-col w-full min-h-full bg-menu rounded-lg py-[30px] px-[10px] lg:px-0 lg:py-0 space-y-[30px] justify-center items-center cursor-pointer"
  >
    <div class="flex bg-ok w-[60px] h-[60px] rounded-full justify-center items-center">
      <font-awesome-icon :icon="['fal', 'check']" class="text-core-lightest text-[27px]" />
    </div>
    <div class="flex flex-col space-y-[10px] items-center">
      <p class="text-[22px] font-extrabold text-core-lightest">{{ props.title }}</p>
      <p class="text-[16px] text-core-light">{{ props.description }}</p>
    </div>
    <a
      class="flex max-w-full bg-core-lightest rounded-lg py-[17px] px-[60px] text-center items-center justify-center text-[14px] font-extrabold text-core-darkest"
      @click="goToExplorer(props.txId)"
    >
      <div class="hidden lg:block">{{ shortenString(props.txId!, 48) }}</div>
      <div class="lg:hidden">{{ shortenString(props.txId!, 28) }}</div>
    </a>
    <div
      class="w-full flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 lg:space-x-[10px] items-center justify-center"
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
