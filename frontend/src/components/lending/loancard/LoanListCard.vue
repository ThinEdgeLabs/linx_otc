<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import type { Token, Loan } from '@/types'
import { prettifyTokenAmount } from '@alephium/web3'

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
  <div class="group lg:hover:bg-core-darkest cursor-pointer">
    <section class="w-full flex flex-row items-center p-[20px]">
      <div class="w-full flex flex-col">
        <div class="text-[16px] font-extrabold text-core-lightest">Loan #{{ loan.id }}</div>
        <div class="text-[12px] font-semibold text-core-light">
          Created on {{ new Date(loan.created).toDateString() }}
        </div>
      </div>
      <div class="w-full flex flex-row items-center space-x-[10px] text-[14px]">
        <img :src="`${loanToken.logoUri}`" class="w-[40px] h-[40px] rounded-full" />
        <div class="flex flex-row items-center space-x-1">
          <div class="font-extrabold text-core-lightest">
            {{ prettifyTokenAmount(loan.loanAmount, loanToken.decimals) }}
          </div>
          <div class="text-core-light">{{ loanToken?.symbol }}</div>
        </div>
      </div>
      <div class="w-full flex flex-row items-center space-x-[10px] text-[14px]">
        <img :src="`${collateralToken.logoUri}`" class="w-[40px] h-[40px] rounded-full" />
        <div class="flex flex-row items-center space-x-1">
          <div class="font-extrabold text-core-lightest">
            {{ prettifyTokenAmount(loan.collateralAmount, collateralToken.decimals) }}
          </div>
          <div class="text-core-light">{{ collateralToken.symbol }}</div>
        </div>
      </div>
      <div class="w-full flex flex-row space-x-1">
        <div class="font-extrabold text-core-lightest">{{ loan.duration }}</div>
        <div class="text-core-light">Days</div>
      </div>
      <div class="w-full flex flex-col">
        <div class="text-core-light text-[12px]">
          {{ prettifyTokenAmount((props.loan.interest * props.loan.loanAmount) / 10000n, loanToken.decimals) }}
          {{ loanToken.symbol }}
        </div>
      </div>
      <div class="w-[20%]">
        <CustomButton :title="'View'" :class="'invisible group-hover:visible'" />
      </div>
    </section>
    <HorizontalDivider />
  </div>
</template>
