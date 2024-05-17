<script setup lang="ts">
const props = defineProps({
  item: {
    type: Number,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-row w-full items-center justify-between py-[14px] px-[19px] hover:bg-core-lightest">
    <p>{{ props.item }} {{ props.description }}</p>
    <font-awesome-icon
      :icon="['fal', 'circle-check']"
      :class="props.isSelected ? 'flex text-green-500' : 'invisible'"
    />
  </div>
</template>
