<script setup lang="ts">
import HorizontalDivider from '@/components/HorizontalDivider.vue'

const props = defineProps({
  loan: {
    type: Object,
    required: true
  }
})

function calculateInterest(interest: number, duration: number, loan: number) {
  return Math.round((((interest / loan) * 100) / duration) * 365 * 100) / 100
}
</script>

<template>
  <div>
    <p class="text-[18px] font-extrabold text-white">Loan offer #{{ loan.loanId }}</p>
    <p class="text-[12px] font-semibold text-core-light">
      Created on {{ new Date(props.loan.created).toDateString() }}
    </p>
  </div>
  <div class="lg:pt-[30px] flex flex-row lg:flex-col">
    <div class="flex flex-row w-full items-center space-x-[15px]">
      <img :src="`./images/${props.loan.loanToken}.png`" class="w-[40px] h-[40px] rounded-full" />
      <div class="flex flex-col space-y-0 leading-snug">
        <p class="text-[10px]">LOAN</p>
        <div class="flex flex-row space-x-1 text-[14px] items-center">
          <p class="font-extrabold text-white">{{ props.loan.loanAmount }}</p>
          <p>{{ props.loan.loanToken }}</p>
        </div>
      </div>
    </div>
    <div class="hidden lg:flex border-dashed border-r-2 border-core h-[20px] w-[20px]"></div>
    <div class="flex flex-row w-full items-center space-x-[15px]">
      <img :src="`./images/${props.loan.collateralToken}.png`" class="w-[40px] h-[40px] rounded-full" />
      <div class="flex flex-col items-center justify-center leading-snug">
        <div class="text-[10px]">COLLATERAL</div>
        <div class="flex flex-row space-x-1 text-[14px]">
          <p class="font-extrabold text-white">{{ props.loan.collateralAmount }}</p>
          <p>{{ props.loan.collateralToken }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="lg:pt-[30px]">
    <HorizontalDivider :background-color="'core-darkest'" :class="'-mx-5'" />
    <div class="flex flex-row w-full pt-[10px] leading-snug">
      <div class="w-full flex flex-col items-center justify-center">
        <p class="text-[10px]">DURATION</p>
        <div class="flex flex-row space-x-[4px] text-[14px]">
          <div class="font-extrabold text-white">{{ loan.duration }}</div>
          <div>DAYS</div>
        </div>
      </div>
      <div class="border border-r-2 border-core-darkest -mt-3 -mb-5" />
      <div class="w-full flex flex-col items-center justify-center">
        <p>{{ calculateInterest(loan.interest, loan.duration, loan.loanAmount) }} % APR</p>
        <p>{{ loan.interest }} {{ loan.loanToken }}</p>
      </div>
    </div>
  </div>
</template>
