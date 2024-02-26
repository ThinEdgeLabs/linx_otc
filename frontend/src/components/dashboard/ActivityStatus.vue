<script setup lang="ts">
const props = defineProps({
  status: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div
    class="flex items-center justify-center min-w-[64px] h-[24px] text-center rounded-[20px] text-[10px] font-semibold"
    :class="
      props.status === 'Open' || props.status === 'Active'
        ? 'border-[1px] border-ok text-ok'
        : props.status === 'Pending'
          ? 'border-[1px] border-warning text-warning'
          : props.status === 'Expired'
            ? 'bg-danger text-core-lightest'
            : 'bg-ok text-core-lightest'
    "
  >
    {{ props.status }}
  </div>
</template>
