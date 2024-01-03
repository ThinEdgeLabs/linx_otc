<script setup lang="ts">
const dashboardData = [
  {
    name: 'ALPH Price',
    value: 1.01,
    change: 3.15
  },
  {
    name: 'Total Value',
    value: 747797285
  },
  {
    name: 'Total Open Orders',
    value: 312455
  },
  {
    name: 'Total Transactions',
    value: 3942014
  }
]
</script>

<template>
  <div class="hidden lg:flex flex-row w-full items-center justify-between pt-[40px] p-[30px]">
    <div
      v-for="data in dashboardData"
      v-bind:key="dashboardData.indexOf(data)"
      class="flex flex-col"
    >
      <p class="text-[14px] text-core-lightest">{{ data.name }}</p>
      <div class="flex flex-row space-x-[4px]">
        <p class="text-[22px] font-extrabold text-white">
          {{ data.name.includes('Price') || data.name.includes('Value') ? '\$ ' : '' }}
          {{ data.value.toLocaleString() }}
        </p>
        <p v-if="data.change" :class="data.change > 0 ? 'text-ok' : 'text-danger'">
          {{ data.change > 0 ? '+' : '-' }}
          {{ data.change }}
          %
        </p>
      </div>
    </div>
  </div>
</template>
