<script setup lang="ts">
import { useLoanOrderStore } from '@/stores/loanOrder'
import { ref } from 'vue'
import DropdownItem from '@/components/DropdownItem.vue'

const loanOrderStore = useLoanOrderStore()
const dropdownOpen = ref(false)

function toggleDropDown() {
  dropdownOpen.value = !dropdownOpen.value
}

const durationOptions = [7, 14, 30, 90]

function setDropDown(duration: number) {
  loanOrderStore.setDuration(duration)
  toggleDropDown()
}
</script>

<template>
  <div class="flex flex-col w-full space-y-[10px]">
    <p class="text-[14px] font-bold text-core-light">Loan Duration</p>
    <div class="relative">
      <div
        @click="toggleDropDown()"
        class="flex flex-row items-center justify-between w-full p-[10px] bg-white text-core h-[52px] cursor-pointer"
        :class="dropdownOpen ? 'rounded-t-lg border-b-[1px] border-core-darkest bg-white' : 'rounded-lg z-0'"
      >
        <div v-if="!loanOrderStore.order?.duration" class="text-[14px] text-core">Choose</div>
        <div v-else class="text-[14px] text-core">{{ loanOrderStore.order.duration }} Days</div>
        <font-awesome-icon :icon="['fal', 'angle-down']" class="text-[18px] text-accent-1" />
      </div>
      <div v-if="dropdownOpen" class="absolute bg-white w-full rounded-b-lg max-h-48 overflow-auto z-10">
        <ul class="divide-y divide-grey-100 text-sm text-gray-700">
          <DropdownItem
            v-for="duration in durationOptions"
            v-bind:key="duration"
            :description="'Days'"
            :item="duration"
            :is-selected="duration === loanOrderStore.order?.duration"
            @click="setDropDown(duration)"
          />
        </ul>
      </div>
    </div>
    <div class="h-[14px]"></div>
  </div>
</template>
