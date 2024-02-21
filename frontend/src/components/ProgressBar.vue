<script setup lang="ts">
const props = defineProps({
  percentageFilled: {
    type: Number,
    required: true
  }
})

const standardWidth = 300
const progressWidth = (props.percentageFilled / 100) * standardWidth
const openWidth = ((100 - props.percentageFilled) / 100) * standardWidth
</script>

<template>
  <div class="flex flex-row w-full px-[30px] items-center justify-center">
    <div class="w-[20px] h-[20px] rounded-full bg-accent-3" />
    <div class="h-[5px] bg-accent-3" :style="{ width: `${progressWidth}px` }" />
    <div v-if="openWidth != 0" class="h-[5px] bg-core-darkest" :style="{ width: `${openWidth}px` }" />
    <div
      class="h-[20px] w-[20px] rounded-full"
      :class="$props.percentageFilled === 100 ? 'bg-accent-3' : 'bg-core-darkest'"
    />
  </div>
</template>
