<script setup lang="ts">
import ComponentTitle from '@/components/ComponentTitle.vue'

defineEmits<{
  (e: 'update:closeActivity'): void
}>()

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

function calculateAPR() {
  return (((props.activity.interest / props.activity.offerAmount) * 100) / props.activity.duration) * 365
}
</script>

<template>
  <div class="flex flex-col h-full justify-between">
    <div class="flex flex-col space-y-[30px]">
      <ComponentTitle
        :title="`${props.activity.type} order #${props.activity.id}`"
        :description="`Created on ${new Date(props.activity.created).toDateString()}`"
        :status="props.activity.status"
        @update:go-back="$emit('update:closeActivity')"
      />
      <div class="flex flex-col">
        <div class="grid grid-cols-2 w-full items-center">
          <div class="flex flex-row space-x-[10px] item-center">
            <img :src="`/images/tokens/${props.activity.offerToken}.png`" class="w-[60px] h-[60px] rounded-full" />
            <div class="flex flex-col text-start justify-center">
              <p class="text-[10px] lg:text-[12px] text-core-light">LENDING</p>
              <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                <p class="font-extrabold text-core-lightest">{{ props.activity.offerAmount }}</p>
                <p class="text-core-light">{{ props.activity.offerToken }}</p>
              </div>
            </div>
          </div>
          <div class="flex flex-row space-x-[10px] item-center">
            <div class="flex w-[60px] h-[60px] rounded-full bg-core-darkest items-center justify-center">
              <font-awesome-icon :icon="['fal', 'receipt']" class="text-core-light text-[20px]" />
            </div>
            <div class="flex flex-col text-start justify-center">
              <p class="text-[10px] lg:text-[12px] text-core-light">
                INTEREST {{ props.activity.interest }} {{ props.activity.offerToken }}
              </p>
              <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                <p class="font-extrabold text-core-lightest">
                  {{ calculateAPR().toFixed(2) }}
                </p>
                <p class="text-core-light">% APR</p>
              </div>
            </div>
          </div>
        </div>
        <div class="border-dashed border-r border-accent-3 h-[20px] w-[30px]"></div>
        <div class="grid grid-cols-2 w-full items-center">
          <div class="flex flex-row space-x-[10px] item-center">
            <img :src="`/images/tokens/${props.activity.requestToken}.png`" class="w-[60px] h-[60px] rounded-full" />
            <div class="flex flex-col text-start justify-center">
              <p class="text-[10px] lg:text-[12px] text-core-light">COLLATERAL</p>
              <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                <p class="font-extrabold text-core-lightest">
                  {{ props.activity.requestAmount }}
                </p>
                <p class="text-core-light">{{ props.activity.requestToken }}</p>
              </div>
            </div>
          </div>
          <div class="flex flex-row space-x-[10px] item-center">
            <div class="flex w-[60px] h-[60px] rounded-full bg-core-darkest items-center justify-center">
              <font-awesome-icon :icon="['fal', 'calendar-days']" class="text-core-light text-[20px]" />
            </div>
            <div class="flex flex-col text-start justify-center">
              <p class="text-[10px] lg:text-[12px] text-core-light">DURATION</p>
              <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                <p class="font-extrabold text-core-lightest">
                  {{ props.activity.duration }}
                </p>
                <p class="text-core-light">DAYS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-col w-full border-2 border-dashed border-accent-3 p-[15px] rounded-lg">
    <div class="flex flex-row space-x-[10px] items-center">
      <font-awesome-icon :icon="['fal', 'info-circle']" class="text-core-lightest text-[16px]" />
      <p class="text-[14px] font-extrabold text-core-lightest">Useful Tips</p>
    </div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec viverra pretium nisl, a efficitur purus fringilla
      sed viverra pretium nisl.
    </p>
  </div>
</template>
