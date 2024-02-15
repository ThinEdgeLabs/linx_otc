<script setup lang="ts">
const alphPrice = 2.7
const totalValue = 7597285
const tradeOffers = 312455
const loanOffers = 142014
</script>

<template>
  <section class="flex flex-row px-[30px] py-[40px] justify-between items-center">
    <div class="text-[40px] font-extrabold text-core-lightest">Dashboard</div>
    <div class="flex flex-row items-center justify-evenly space-x-[100px]">
      <div class="flex flex-col text-end">
        <div class="text-[14px] text-core-light">ALPH price</div>
        <div class="text-[18px] font-extrabold text-core-lightest">
          $ {{ alphPrice.toFixed(2) }}
        </div>
      </div>
      <div class="flex flex-col text-end">
        <div class="text-[14px] text-core-light">Total value</div>
        <div class="text-[18px] font-extrabold text-core-lightest">
          $ {{ totalValue.toLocaleString() }}
        </div>
      </div>
      <div class="flex flex-col text-end">
        <div class="text-[14px] text-core-light">Total trades</div>
        <div class="text-[18px] font-extrabold text-core-lightest">
          $ {{ tradeOffers.toLocaleString() }}
        </div>
      </div>
      <div class="flex flex-col text-end">
        <div class="text-[14px] text-core-light">Total loans</div>
        <div class="text-[18px] font-extrabold text-core-lightest">
          $ {{ loanOffers.toLocaleString() }}
        </div>
      </div>
    </div>
  </section>
</template>
