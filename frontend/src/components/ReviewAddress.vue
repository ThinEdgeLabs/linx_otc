<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'

const props = defineProps({
  address: {
    type: String,
    required: true
  },
  isSender: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px] w-full">
    <div class="font-extrabold text-core-light">
      {{ props.isSender ? 'Your address' : 'Receiver Address' }}
    </div>
    <div class="flex flex-row w-full p-[10px] rounded-lg bg-core-darkest justify-between items-center text-core">
      <div class="flex flex-row space-x-[10px] items-center w-full">
        <img src="@/assets/alph.png" class="w-[32px] h-[32px] rounded-full" />
        <div class="flex flex-row justify-between w-full">
          <p class="font-extrabold text-core-lightest text-[14px]">
            {{ shortenString(props.address, 16) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
