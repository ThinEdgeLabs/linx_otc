<script setup lang="ts">
import { useLoanOrderStore } from '@/stores/loanOrder'
import PercentageButton from './PercentageButton.vue'
import { ref } from 'vue'
import ValidationError from '../ValidationError.vue'

const loanOrderStore = useLoanOrderStore()
const errorMessage = ref<string | undefined>(undefined)

function setAmount(amount: number) {
  loanOrderStore.setInterest(amount)
}
</script>

<template>
  <div class="w-full flex flex-col space-y-[10px]">
    <p class="text-[14px] font-extrabold text-core-light">You want to receive back</p>
    <div class="flex flex-row w-full rounded-lg bg-white text-center p-[10px] h-[52px]">
      <div v-if="loanOrderStore.order?.loanToken" class="w-full flex flex-row justify-between items-center">
        <div class="w-full flex flex-row items-center space-x-[10px]">
          <img
            :src="`${loanOrderStore.order?.loanToken.logoUri ?? '/images/tokens/NONE.png'}`"
            class="w-[32px] h-[32px] rounded-full"
          />
          <p>{{ loanOrderStore.order.loanToken.symbol }}</p>
          <div class="inline-block w-[0.5px] self-stretch bg-core-light opacity-100"></div>
          <input
            type="number"
            inputmode="decimal"
            class="text-[18px] font-extrabold text-core-darkest remove-arrow outline-none rounded-lg"
            :value="!loanOrderStore.order?.loanToken ? 'Choose token' : loanOrderStore.order?.interest"
            @input="(e) => setAmount(parseFloat((e.target as HTMLInputElement).value))"
          />
        </div>

        <div class="flex-row space-x-[10px] items-center hidden lg:flex">
          <PercentageButton :interest="1" />
          <PercentageButton :interest="5" />
          <PercentageButton :interest="10" />
        </div>
      </div>
      <div v-else class="flex flex-row space-x-[10px] items-center">
        <img :src="`/images/tokens/NONE.png`" class="w-[32px] h-[32px] rounded-full" />
        <div>Choose Token</div>
      </div>
    </div>
    <ValidationError :message="errorMessage" />
  </div>
</template>
