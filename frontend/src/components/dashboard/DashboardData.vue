<script setup lang="ts">
import { useStatsStore } from '@/stores/stats'
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

const statsStore = useStatsStore()
statsStore.getPrice()
</script>

<template>
  <section class="w-full flex flex-row justify-between items-center py-[40px] lg:mb-[0]">
    <div v-if="!props.isLandingPage" class="text-[28px] lg:text-[40px] font-extrabold text-core-lightest">
      Dashboard
    </div>
    <div
      class="w-full flex flex-col lg:flex-row items-center"
      :class="$props.isLandingPage ? 'space-y-[20px] lg:space-y-0 lg:space-x-[30px] ' : 'hidden lg:flex justify-evenly'"
    >
      <div
        class="flex flex-col"
        :class="props.isLandingPage ? 'w-full bg-menu rounded-lg p-[20px] lg:p-[30px]' : 'text-end'"
      >
        <div class="text-[14px] text-core-light">ALPH price</div>
        <div class="text-[22px] lg:text-[18px] font-extrabold text-core-lightest">
          $ {{ statsStore.stats?.price.toFixed(4) }}
        </div>
      </div>
      <div
        class="flex flex-col"
        :class="props.isLandingPage ? 'w-full bg-menu rounded-lg p-[20px] lg:p-[30px]' : 'text-end'"
      >
        <div class="text-[14px] text-core-light">Total value</div>
        <div class="text-[22px] lg:text-[18px] font-extrabold text-core-lightest">
          $ {{ totalValue.toLocaleString() }}
        </div>
      </div>
      <div
        class="flex flex-col"
        :class="props.isLandingPage ? 'w-full bg-menu rounded-lg p-[20px] lg:p-[30px]' : 'text-end'"
      >
        <div class="text-[14px] text-core-light">Total trades</div>
        <div class="text-[22px] lg:text-[18px] font-extrabold text-core-lightest">
          $ {{ tradeOffers.toLocaleString() }}
        </div>
      </div>
      <div
        class="flex flex-col"
        :class="props.isLandingPage ? ' w-full bg-menu rounded-lg p-[20px] lg:p-[30px]' : 'text-end'"
      >
        <div class="text-[14px] text-core-light">Total loans</div>
        <div class="text-[22px] lg:text-[18px] font-extrabold text-core-lightest">
          $ {{ loanOffers.toLocaleString() }}
        </div>
      </div>
    </div>
  </section>
</template>
