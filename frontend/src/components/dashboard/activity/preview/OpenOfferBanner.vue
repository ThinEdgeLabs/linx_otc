<script setup lang="ts">
const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col bg-core-darkest p-[10px]">
    <div class="flex flex-row space-x-[10px] item-center">
      <img :src="`./images/${props.activity.offerToken}.png`" class="w-[60px] h-[60px] rounded-full" />
      <div class="flex flex-col text-start justify-center">
        <p class="text-[12px] text-core-light">{{ props.activity.type === 'Trade' ? 'OFFER' : 'LENDING' }}</p>
        <div class="flex flex-row items-center space-x-[10px] text-[18px]">
          <p class="font-extrabold text-core-lightest">{{ props.activity.offerAmount }}</p>
          <p class="text-core-light">{{ props.activity.offerToken }}</p>
        </div>
      </div>
    </div>

    <div class="border-dashed border-r-2 border-accent-3 h-[20px] w-[30px]"></div>
    <div class="grid grid-cols-2 w-full items-center">
      <div class="flex flex-row space-x-[10px] item-center">
        <img :src="`./images/${props.activity.requestToken}.png`" class="w-[60px] h-[60px] rounded-full" />
        <div class="flex flex-col text-start justify-center">
          <p class="text-[12px] text-core-light">{{ props.activity.type === 'Trade' ? 'REQUEST' : 'COLLATERAL' }}</p>
          <div class="flex flex-row items-center space-x-[10px] text-[18px]">
            <p class="font-extrabold text-core-lightest">
              {{ props.activity.requestAmount }}
            </p>
            <p class="text-core-light">{{ props.activity.requestToken }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
