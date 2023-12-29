<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  isSender: {
    type: Boolean,
    required: true
  }
})

const selectedToken = ref('NONE')
const dropdownOpen = ref(false)

const balance = {
  ALPH: 0,
  OGAlf: 0,
  ALPHpaca: 0,
  BERRY: 0,
  TAIL: 0,
  XAYIN: 0,
  VLAD: 0,
  JKL: 0,
  WETH: 0,
  USDT: 0,
  USDC: 0,
  DAI: 0,
  NGU: 0,
  VIRL: 0,
  BUBBLE: 0,
  CYXE: 0
}

function toggleDropDown() {
  dropdownOpen.value = !dropdownOpen.value
}
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px]">
    <div class="font-extrabold text-core-light">
      {{ props.isSender ? 'You offer' : 'You request' }}
    </div>
    <div
      class="flex flex-row w-full p-[10px] rounded-lg bg-white justify-between items-center text-core"
    >
      <div class="flex flex-row space-x-[10px] items-center">
        <img src="@/assets/alph.png" class="w-[20px] h-[20px] rounded-full" />
        <p v-if="selectedToken != 'NONE'">{{ selectedToken }}</p>
        <p v-else>{{ 'Select a token' }}</p>
      </div>
      <font-awesome-icon
        v-if="!props.isSender"
        :icon="['fal', 'clipboard']"
        class="text-[18px] text-accent-3"
      />
    </div>
  </section>
</template>
