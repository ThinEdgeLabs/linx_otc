<script setup lang="ts">
const alphPrice = 2.7
const totalValue = 7597285
const tradeOffers = 312455
const loanOffers = 142014

const props = defineProps({
  isLandingPage: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <section class="w-full flex flex-row justify-between items-center py-[40px]">
    <div v-if="!props.isLandingPage" class="text-[40px] font-extrabold text-core-lightest">Dashboard</div>
    <div class="w-full flex flex-row items-center" :class="$props.isLandingPage ? 'space-x-[30px] ' : 'justify-evenly'">
      <div class="flex flex-col" :class="props.isLandingPage ? 'w-full bg-menu rounded-lg p-[30px]' : 'text-end'">
        <div class="text-[14px] text-core-light">ALPH price</div>
        <div class="text-[18px] font-extrabold text-core-lightest">$ {{ alphPrice.toFixed(2) }}</div>
      </div>
      <div class="flex flex-col" :class="props.isLandingPage ? 'w-full bg-menu rounded-lg p-[30px]' : 'text-end'">
        <div class="text-[14px] text-core-light">Total value</div>
        <div class="text-[18px] font-extrabold text-core-lightest">$ {{ totalValue.toLocaleString() }}</div>
      </div>
      <div class="flex flex-col" :class="props.isLandingPage ? 'w-full bg-menu rounded-lg p-[30px]' : 'text-end'">
        <div class="text-[14px] text-core-light">Total trades</div>
        <div class="text-[18px] font-extrabold text-core-lightest">$ {{ tradeOffers.toLocaleString() }}</div>
      </div>
      <div class="flex flex-col" :class="props.isLandingPage ? ' w-full bg-menu rounded-lg p-[30px]' : 'text-end'">
        <div class="text-[14px] text-core-light">Total loans</div>
        <div class="text-[18px] font-extrabold text-core-lightest">$ {{ loanOffers.toLocaleString() }}</div>
      </div>
    </div>
  </section>
</template>
