<script setup lang="ts">
import CustomButton from './CustomButton.vue'

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
  buttonDescription: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  }
})

function openInNewTab() {
  window.open(props.destination, '_blank')
}
</script>

<template>
  <div class="flex flex-col py-[60px] items-center bg-menu rounded-lg space-y-[30px] max-w-[400px]">
    <font-awesome-icon :icon="['fab', `${props.icon}`]" class="text-accent-3 text-[38px]" />
    <p class="text-[22px] font-extrabold text-core-lightest">{{ props.title }}</p>
    <p class="px-[30px] text-[14px] text-core-light">{{ props.description }}</p>
    <CustomButton :title="props.buttonDescription" :class="'w-[250px] text-[16px]'" @click="openInNewTab()" />
  </div>
</template>
