<script setup lang="ts">
defineEmits<{
  (e: 'update:goBack'): void
}>()

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  }
})
</script>

<template>
  <div class="flex flex-row items-center justify-between">
    <div class="flex flex-row items-center space-x-[20px]">
      <button
        @click="$emit('update:goBack')"
        class="flex w-[40px] h-[40px] rounded-full bg-core-darkest items-center justify-center"
      >
        <font-awesome-icon :icon="['fal', 'arrow-left-long']" class="text-core-light text-[20px]" />
      </button>
      <div class="flex flex-col items-start">
        <p class="text-[22px] font-extrabold text-core-lightest">
          {{ props.title }}
        </p>
        <p v-if="props.description" class="text-[14px] text-core-light">
          {{ props.description }}
        </p>
      </div>
    </div>
    <div
      v-if="props.status"
      class="border rounded-[20px] text-[12px] py-[7px] px-[10px] min-w-[70px] text-center"
      :class="['Liquidated', 'Cancelled'].includes($props.status!)  ? 'border-danger text-danger' : 'border-ok text-ok'"
    >
      {{ status }}
    </div>
  </div>
</template>
