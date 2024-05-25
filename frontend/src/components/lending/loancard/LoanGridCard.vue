<script setup lang="ts">
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import type { Loan, Token } from '@/types'
import { prettifyTokenAmount } from '@alephium/web3'
import CustomButton from '@/components/CustomButton.vue'

const props = defineProps<{
  loan: Loan
  tokens: Map<string, Token>
}>()

const collateralToken = props.tokens.get(props.loan.collateralToken) ?? {
  symbol: 'unknown',
  name: 'unknown',
  decimals: 18,
  logoUri: '/images/tokens/nologo.png'
}
const loanToken = props.tokens.get(props.loan.loanToken) ?? {
  symbol: 'unknown',
  name: 'unknown',
  decimals: 18,
  logoUri: '/images/tokens/nologo.png'
}
</script>

<template>
  <div class="flex flex-col leading-snug">
    <p class="text-[16px] font-extrabold text-core-lightest">Loan #{{ props.loan.id }}</p>
    <p class="text-[12px] text-core-light">Created on {{ new Date(loan.created).toDateString() }}</p>
  </div>
  <div class="lg:pt-[20px] flex flex-row lg:flex-col cursor-pointer">
    <div class="flex flex-row w-full items-center space-x-[15px]">
      <img :src="`${loanToken.logoUri}`" class="w-[40px] h-[40px] rounded-full" />
      <div class="flex flex-col space-y-0 leading-snug">
        <p class="text-[10px]">LOAN</p>
        <div class="flex flex-row space-x-1 text-[14px] items-center">
          <p class="font-extrabold text-white">{{ prettifyTokenAmount(props.loan.loanAmount, loanToken.decimals) }}</p>
          <p>{{ loanToken.symbol }}</p>
        </div>
      </div>
    </div>
    <div class="hidden lg:flex border-dashed border-r border-accent-3 h-[20px] w-[20px]"></div>
    <div class="flex flex-row w-full items-center space-x-[15px]">
      <img :src="`${collateralToken.logoUri}`" class="w-[40px] h-[40px] rounded-full" />
      <div class="flex flex-col items-center justify-center leading-snug">
        <div class="text-[10px] text-start">COLLATERAL</div>
        <div class="flex flex-row space-x-1 text-[14px]">
          <p class="font-extrabold text-white">
            {{ prettifyTokenAmount(props.loan.collateralAmount, collateralToken.decimals) }}
          </p>
          <p>{{ collateralToken.symbol }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="lg:pt-[30px] group-hover:hidden">
    <HorizontalDivider :background-color="'core-darkest'" :class="'-mx-5'" />
    <div class="flex flex-row w-full pt-[10px] leading-snug">
      <div class="w-full flex flex-col items-center justify-center">
        <p class="text-[10px]">DURATION</p>
        <div class="flex flex-row space-x-1 text-[12px]">
          <div class="font-extrabold text-white">{{ loan.duration }}</div>
          <div>DAYS</div>
        </div>
      </div>
      <div class="border border-r-2 border-core-darkest -mt-3 -mb-3" />
      <div class="w-full flex flex-col items-center justify-center">
        <p class="text-[10px]">INTEREST</p>
        <p class="text-[10px] text-core-light">
          {{ prettifyTokenAmount((props.loan.interest * props.loan.loanAmount) / 10000n, loanToken.decimals) }}
          {{ loanToken.symbol }}
        </p>
      </div>
    </div>
  </div>
  <div class="hidden lg:pt-[20px] group-hover:flex">
    <CustomButton :title="'View'" @click="$emit('update:selectedLoan', loan)" class="w-full" />
  </div>
</template>
