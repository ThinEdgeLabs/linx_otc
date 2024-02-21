<script setup lang="ts">
import CustomButton from './CustomButton.vue'

defineEmits<{
  (e: 'update:cancel'): void
  (f: 'update:retry'): void
}>()
const props = defineProps({
  description: {
    type: String,
    required: true
  }
})
</script>

<template>
  <section
    class="flex flex-col w-full min-h-full bg-menu rounded-lg space-y-[30px] justify-center items-center"
  >
    <div class="flex bg-warning w-[60px] h-[60px] rounded-full justify-center items-center">
      <font-awesome-icon :icon="['fal', 'warning']" class="text-core-lightest text-[27px]" />
    </div>
    <div class="flex flex-col space-y-[10px] items-center">
      <p class="text-[22px] font-extrabold text-core-lightest">Something went wrong</p>
      <p class="text-[16px] text-core-light">{{ props.description }}</p>
    </div>
    <div class="flex flex-row space-x-[30px] items-center">
      <CustomButton :title="'Retry'" @click="$emit('update:retry')" />
      <CustomButton
        :open="true"
        :title="'Cancel'"
        @click="$emit('update:cancel')"
        :class="'border-0 bg-core-darkest text-core-lightest'"
      />
    </div>
  </section>
</template>
