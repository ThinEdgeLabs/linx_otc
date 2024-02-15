<script setup lang="ts">
const props = defineProps({
  title: String,
  open: Boolean,
  disabled: Boolean
})
</script>

<template>
  <button
    v-if="!props.open"
    class="px-[45px] py-2 rounded-[26px] text-[14px]"
    :class="
      props.disabled
        ? 'bg-gradient-to-r from-accent-1/50 to-accent-2/50 text-white/50'
        : 'bg-gradient-to-r from-accent-1 to-accent-2 text-white hover:bg-none hover:bg-accent-2'
    "
  >
    {{ props.title }}
  </button>
  <button
    v-else
    :class="`px-4 py-2 w-[128px] border-2 border-accent-1 rounded-[26px] text-[14px] text-accent-1 hover:bg-none hover:bg-accent-2 hover:text-white`"
  >
    {{ props.title }}
  </button>
</template>
