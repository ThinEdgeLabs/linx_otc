<script setup lang="ts">
const props = defineProps({
  title: String,
  open: Boolean,
  disabled: Boolean,
  icon: String,
  delete: Boolean
})
</script>

<template>
  <button
    v-if="!props.open"
    class="flex flew-row py-[15px] px-[60px] rounded-[26px] text-[16px] leading-snug justify-center items-center space-x-[10px] w-full lg:w-auto"
    :class="
      props.disabled
        ? 'bg-gradient-to-r from-accent-1/50 to-accent-2/50 text-white/50'
        : 'bg-gradient-to-r from-accent-1 to-accent-2 text-white hover:bg-none hover:bg-accent-3'
    "
  >
    <font-awesome-icon v-if="props.icon" :icon="['fal', 'copy']" />
    <div>{{ props.title }}</div>
  </button>
  <button
    v-else
    class="flex flex-row px-4 px-[60px] rounded-[26px] text-[16px] leading-snug hover:text-white justify-center items-center space-x-[10px] w-full lg:w-auto"
    :class="
      props.delete
        ? 'border-danger text-danger hover:bg-danger border py-[14px]'
        : 'text-core-lightest bg-core-darkest hover:border-accent-3 hover:bg-accent-3 py-[15px]'
    "
  >
    <font-awesome-icon v-if="props.icon" :icon="['fal', `${props.icon}`]" />
    <div>{{ props.title }}</div>
  </button>
</template>
