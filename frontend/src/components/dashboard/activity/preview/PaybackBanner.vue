<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'

const props = defineProps({
  token: String,
  amount: Number,
  address: String
})
</script>

<template>
  <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-between items-center rounded-lg">
    <div class="flex flex-row space-x-[10px] items-center">
      <img :src="`./images/tokens/${props.token}.png`" class="w-[40px] h-[40px] rounded-full" />
      <div class="flex flex-col text-start justify-center">
        <p class="text-[10px] text-core-light">Payback</p>
        <div class="flex flex-row items-center space-x-[10px] text-[14px]">
          <p class="font-extrabold text-core-lightest">{{ props.amount }}</p>
          <p class="text-core-light">{{ props.token }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col text-end">
      <p class="text-[10px] text-core-light">FROM</p>
      <p class="text-[14px] font-extrabold text-core-lightest">
        {{ shortenString(props.address!, 12) }}
      </p>
    </div>
  </div>
</template>
