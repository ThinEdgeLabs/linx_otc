<script setup lang="ts">
import { getTokens } from '@/config'

const props = defineProps({
  token: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})

const tokens = getTokens()
</script>

<template>
  <div class="flex flex-row items-center space-x-[10px] w-full">
    <img
      :src="tokens.find((e) => e.symbol === props.token)?.logoUri ?? '/images/tokens/nologo.png'"
      class="w-[40px] h-[40px] rounded-full"
    />
    <div class="flex flex-col text-start">
      <div class="text-[10px] text-core-light">{{ props.title.toUpperCase() }}</div>
      <div class="flex flex-row items-center space-x-[10px] text-[14px]">
        <div class="font-extrabold text-core-lightest">{{ props.amount }}</div>
        <div class="text-core-light">{{ props.token }}</div>
      </div>
    </div>
  </div>
</template>
