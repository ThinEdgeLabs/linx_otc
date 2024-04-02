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
    class="flex flew-row py-[10px] px-[45px] py-2 rounded-[26px] text-[16px] justify-center items-center space-x-[10px] h-[52px]"
    :class="
      props.disabled
        ? 'bg-gradient-to-r from-accent-1/50 to-accent-2/50 text-white/50'
        : 'bg-gradient-to-r from-accent-1 to-accent-2 text-white hover:bg-none hover:bg-accent-2'
    "
  >
    <font-awesome-icon v-if="props.icon" :icon="['fal', 'copy']" />
    <p>{{ props.title }}</p>
  </button>
  <button
    v-else
    class="flex flex-row px-4 py-[10px] w-[128px] border rounded-[26px] text-[16px] hover:text-white justify-center items-center space-x-[10px] h-[52px]"
    :class="
      props.delete
        ? 'border-danger text-danger hover:bg-danger'
        : 'text-accent-1 bg-core-darkest border-none hover:border-accent-1 hover:bg-accent-1'
    "
  >
    <font-awesome-icon v-if="props.icon" :icon="['fal', `${props.icon}`]" />
    <p>{{ props.title }}</p>
  </button>
</template>
