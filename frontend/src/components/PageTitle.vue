<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  icon?: string[]
  descriptionRight?: string
}>()
</script>

<template>
  <div class="flex flex-col space-y-[10px]">
    <p class="text-[32px] text-white font-extrabold">{{ props.title }}</p>
    <div class="flex flex-row justify-between">
      <p class="text-[14px] text-white">{{ props.description }}</p>
      <div class="flex items-center space-x-[10px]">
        <font-awesome-icon v-if="props.icon" :icon="props.icon" class="text-[14px] text-warning" />
        <p v-if="props.descriptionRight" class="text-[14px] text-warning">
          {{ props.descriptionRight }}
        </p>
      </div>
    </div>
  </div>
</template>
