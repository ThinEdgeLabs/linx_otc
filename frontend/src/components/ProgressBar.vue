<script setup lang="ts">
const props = defineProps({
  percentageFilled: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div id="progressBar" class="flex flex-row items-center pt-[10px] pb-[20px] w-2/3">
      <div class="h-[20px] w-[20px] rounded-full bg-accent-1" />
      <div class="grid grid-cols-4 w-full h-[5px]">
        <div class="col-span-1" :class="props.percentageFilled >= 25 ? 'bg-accent-3' : 'bg-core-darkest'" />
        <div class="col-span-1" :class="props.percentageFilled >= 50 ? 'bg-accent-3' : 'bg-core-darkest'" />
        <div class="col-span-1" :class="props.percentageFilled >= 75 ? 'bg-accent-3' : 'bg-core-darkest'" />
        <div class="col-span-1" :class="props.percentageFilled >= 100 ? 'bg-accent-3' : 'bg-core-darkest'" />
      </div>
      <div
        class="h-[20px] w-[20px] rounded-full"
        :class="props.percentageFilled === 100 ? 'bg-accent-3' : 'bg-core-darkest'"
      />
    </div>
</template>
