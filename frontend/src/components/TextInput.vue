<script setup lang="ts">
defineProps({ modelValue: String, fieldType: { type: String, default: 'address' } })
defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="w-full overflow-x-auto">
    <input
      class="remove-arrow outline-none w-full font-extrabold text-core-darkest text-[14px]"
      :value="modelValue"
      :placeholder="fieldType === 'address' ? 'Enter receiver address' : 'Enter receiver PUBLIC KEY'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
