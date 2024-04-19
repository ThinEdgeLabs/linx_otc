<script setup lang="ts">

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  }
})
</script>

<template>
  <RouterLink
    :to="props.destination"
    class="w-full min-w-[275px] lg:min-w-[300px] h-[78px]"
  >
    <button
      class="w-full flex flex-row items-center bg-divider rounded-lg p-[20px] space-x-[10px] lg:space-x-[20px]"
    >
      <font-awesome-icon :icon="['fat', props.icon]" class="text-[38px] text-accent-3" />
      <div class="flex flex-col text-start">
        <div class="text-[16px] font-extrabold text-core-lightest">{{ props.title }}</div>
        <div class="text-[12px] font-semibold text-core-light">{{ props.description }}</div>
      </div>
    </button>
  </RouterLink>
</template>
