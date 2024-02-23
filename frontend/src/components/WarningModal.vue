<script setup lang="ts">
import CustomButton from './CustomButton.vue'

defineEmits<{
  (e: 'update:agree'): void
  (f: 'update:cancel'): void
}>()

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  buttonTitle: {
    type: String,
    required: true
  }
})
</script>

<template>
  <section
    class="absolute top-0 left-0 w-full h-screen flex flex-col justify-center items-center bg-core-darkest bg-opacity-50 backdrop-blur-md dark:text-core-light"
  >
    <div class="flex flex-col bg-menu py-[60px] px-[30px] space-y-[30px] text-center">
      <font-awesome-icon :icon="['fal', 'warning']" class="text-danger text-[54px]" />
      <p class="text-[22px] text-core-lightest font-extrabold">{{ props.title }}</p>
      <p class="text-[14px] text-core-light font-semibold">{{ props.description }}</p>
      <CustomButton
        :title="props.buttonTitle"
        :open="true"
        :delete="true"
        :class="'w-full'"
        @click="$emit('update:agree')"
      />
      <CustomButton :title="'Close'" :open="true" :class="'w-full'" @click="$emit('update:cancel')" />
    </div>
  </section>
</template>
