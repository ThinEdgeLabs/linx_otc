<script setup lang="ts">
import type { Token } from '@/types'

const props = defineProps<{
  isSender: boolean
  token: Token
  amount: number
}>()
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px] w-full">
    <div class="font-extrabold text-core-light">
      {{ props.isSender ? 'You offer' : 'You request' }}
    </div>
    <div class="relative w-full">
      <div class="flex flex-row w-full p-[10px] bg-core-darkest justify-between items-center text-core rounded-lg z-0">
        <div class="flex flex-row space-x-[10px] items-center w-full">
          <img :src="`${props.token?.logoUri ?? '/images/tokens/NONE.png'}`" class="w-[32px] h-[32px] rounded-full" />
          <div class="flex flex-row items-center space-x-[10px] w-full">
            <div class="flex flex-row space-x-[10px] items-center">
              <p>{{ token.symbol }}</p>
              <div class="inline-block w-[0.5px] self-stretch bg-core-light opacity-100"></div>
            </div>
            <div class="text-core-lightest">{{ props.amount }}</div>
            <div class="text-core-light">{{ props.token.symbol }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
