<script setup lang="ts">
import HorizontalDivider from '@/components/HorizontalDivider.vue'

const props = defineProps({
  loan: {
    type: Object,
    required: true
  }
})

function calculateInterest() {
  return (
    Math.round((props.loan.interest / props.loan.loanAmount / props.loan.duration) * 365 * 100) /
    100
  )
}
</script>

<template>
  <div class="group hover:bg-core-darkest">
    <section class="w-full flex flex-row items-center p-[20px]">
      <div class="w-full flex flex-col">
        <div class="text-[16px] font-extrabold text-core-lightest">
          Loan offer #{{ loan.loanId }}
        </div>
        <div class="text-[12px] font-semibold text-core-light">
          Created on {{ new Date(loan.created).toDateString() }}
        </div>
      </div>
      <div class="w-full flex flex-row items-center space-x-[10px] text-[14px]">
        <img :src="`./images/${props.loan.loanToken}.png`" class="w-[40px] h-[40px] rounded-full" />
        <div class="flex flex-row items-center space-x-1">
          <div class="font-extrabold text-core-lightest">{{ loan.loanAmount }}</div>
          <div class="text-core-light">{{ loan.loanToken }}</div>
        </div>
      </div>
      <div class="w-full flex flex-row items-center space-x-[10px] text-[14px]">
        <img
          :src="`./images/${props.loan.collateralToken}.png`"
          class="w-[40px] h-[40px] rounded-full"
        />
        <div class="flex flex-row items-center space-x-1">
          <div class="font-extrabold text-core-lightest">{{ loan.collateralAmount }}</div>
          <div class="text-core-light">{{ loan.collateralToken }}</div>
        </div>
      </div>
      <div class="w-full flex flex-row space-x-1">
        <div class="font-extrabold text-core-lightest">{{ loan.duration }}</div>
        <div class="text-core-light">Days</div>
      </div>
      <div class="w-full flex flex-col">
        <div class="flex flex-row text-[14px]">
          <div class="font-extrabold text-core-lightest">{{ calculateInterest() }}</div>
          <div class="text-core-light">% APR</div>
        </div>
        <div class="text-core-light text-[12px]">
          {{ props.loan.interest }} {{ props.loan.loanToken }}
        </div>
      </div>
      <div class="w-[20%] invisible group-hover:visible">View Button</div>
    </section>
    <HorizontalDivider />
  </div>
</template>
