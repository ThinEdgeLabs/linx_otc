<script setup lang="ts">
defineProps({ modelValue: String })
defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div>
    <input
      class="remove-arrow outline-none w-full"
      :value="modelValue"
      :placeholder="'Enter receiver address'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
