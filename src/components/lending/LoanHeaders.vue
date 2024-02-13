<script setup lang="ts">
import HorizontalDivider from '../HorizontalDivider.vue'
</script>

<template>
  <div class="">
    <div class="w-full py-4 px-[20px] flex flex-row text-[14px] font-bold text-core-light">
      <div class="w-full flex flex-row justify-between items-center">
        <div>Offer</div>
        <font-awesome-icon
          :icon="['fas', 'sort']"
          class="text-[18px] text-divider max-w-[20px] pr-[30px]"
        />
      </div>
      <div class="w-full flex flex-row justify-between items-center">
        <div>Loan</div>
        <font-awesome-icon
          :icon="['fas', 'sort']"
          class="text-[18px] text-divider max-w-[20px] pr-[30px]"
        />
      </div>
      <div class="w-full flex flex-row justify-between items-center">
        <div>Collateral</div>
        <font-awesome-icon
          :icon="['fas', 'sort']"
          class="text-[18px] text-divider max-w-[20px] pr-[30px]"
        />
      </div>
      <div class="w-full flex flex-row justify-between items-center">
        <div>Duration</div>
        <font-awesome-icon
          :icon="['fas', 'sort']"
          class="text-[18px] text-divider max-w-[20px] pr-[30px]"
        />
      </div>
      <div class="w-full">Interest</div>
      <div class="w-[20%]"></div>
    </div>
    <HorizontalDivider />
  </div>
</template>
