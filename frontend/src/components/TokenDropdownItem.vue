<script setup lang="ts">
import { parseBalance } from '@/functions/utils'
import type { Token } from '@/types'

const props = defineProps<{
  token: Token
  isSelected: Boolean
  isOffer: Boolean
}>()
</script>

<template>
  <div class="flex flex-row w-full items-center justify-between py-[14px] px-[19px]">
    <div class="flex flex-row items-center space-x-[10px]">
      <img :src="`${token.logoUri}`" class="w-[32px] h-[32px] rounded-full" />
      <div class="flex flex-col">
        <p class="text-[14px] text-core-darkest font-extrabold">{{ props.token.symbol }}</p>
        <p class="text-[12px] text-core-light font-semibold">{{ props.token.name }}</p>
      </div>
    </div>
    <div
      v-if="props.isOffer"
      class="flex flex-row text-end items-center space-x-[10px] text-[14px] font-semibold text-menu"
    >
      <p>{{ parseBalance(props.token.balance, props.token.decimals) }} {{ props.token.symbol }}</p>
      <font-awesome-icon
        :icon="['fal', 'circle-check']"
        :class="props.isSelected ? 'flex text-green-500' : 'invisible'"
      />
    </div>
  </div>
</template>
