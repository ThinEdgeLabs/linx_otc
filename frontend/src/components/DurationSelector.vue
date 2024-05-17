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
      class="w-full flex flex-row p-[12px] justify-between items-center font-normal cursor-pointer"
      :class="
        openSelector
          ? 'rounded-t-lg z-10 bg-core-lightest text-core-darkest'
          : 'rounded-lg bg-divider text-core-lightest'
      "
    >
      <div class="text-[14px]">
        <div v-if="openSelector">Select duration</div>
        <div v-if="!openSelector && !props.durationValue">Any duration</div>
        <div v-if="!openSelector && props.durationValue! > 1 && props.durationValue! <= 90">
          More than {{ props.durationValue }} days
        </div>
        <div v-if="!openSelector && props.durationValue === 1">7 days or less</div>
      </div>

      <font-awesome-icon :icon="['fas', 'angle-down']" class="text-[18px] text-accent-3" />
    </div>
    <div v-if="openSelector" class="absolute w-full bg-divider rounded-b-lg max-h-[362px] overflow-auto z-10">
      <div
        v-for="duration in durationList"
        v-bind:key="duration"
        @click="setDuration(duration), (openSelector = !openSelector)"
        class="w-full cursor-pointer hover:bg-white bg-core-lightest"
      >
        <HorizontalDivider :background-color="'core-light'" />
        <div class="flex flex-row justify-between items-center py-4 px-2 cursor-pointer text-core-darkest">
          <p>
            {{
              duration > 1 && duration <= 90
                ? `More than ${duration} days`
                : duration === 1
                  ? '7 days or less'
                  : 'Any duration'
            }}
          </p>
          <font-awesome-icon
            v-if="duration === props.durationValue || (!props.durationValue && duration === 0)"
            :icon="['fal', 'circle-check']"
            class="text-core-lightest text-[14px] bg-ok rounded-full"
          />
        </div>
      </div>
    </div>
  </section>
</template>
