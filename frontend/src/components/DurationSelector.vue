<script setup lang="ts">
import { ref } from 'vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'

const props = defineProps({
  durationValue: { type: Number, required: false },
  setDuration: { type: Function, required: true }
})

const openSelector = ref(false)
const durationList = [0, 1, 7, 14, 30, 60, 90]
</script>

<template>
  <section class="relative">
    <div
      @click="openSelector = !openSelector"
      class="w-full flex flex-row bg-divider p-[12px] justify-between items-center font-normal cursor-pointer"
      :class="openSelector ? 'rounded-t-lg z-10' : 'rounded-lg'"
    >
      <div class="text-[14px] text-core-lightest">
        <div v-if="!props.durationValue">Any duration</div>
        <div v-if="props.durationValue! > 1 && props.durationValue! <= 90">
          More than {{ props.durationValue }} days
        </div>
        <div v-if="props.durationValue === 1">7 days or less</div>
      </div>

      <font-awesome-icon :icon="['fas', 'angle-down']" class="text-[18px] text-accent-3" />
    </div>
    <div
      v-if="openSelector"
      class="absolute w-full bg-divider rounded-b-lg max-h-48 lg:max-h-64 overflow-auto z-10"
    >
      <div
        v-for="duration in durationList"
        v-bind:key="duration"
        @click="setDuration(duration), (openSelector = !openSelector)"
        class="w-full font-normal cursor-pointer hover:bg-core-darker"
      >
        <HorizontalDivider :class="'bg-menu'" />
        <div class="py-4 px-2 cursor-pointer">
          <div v-if="duration > 1 && duration <= 90">More than {{ duration }} days</div>
          <div v-if="duration === 1">7 days or less</div>
          <div v-if="duration === 0">Any duration</div>
        </div>
      </div>
    </div>
  </section>
</template>
