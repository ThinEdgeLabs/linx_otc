<script setup lang="ts">
defineProps({ modelValue: Number })
defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()
</script>

<template>
  <div class="w-full">
    <input
      type="number"
      inputmode="decimal"
      class="text-[18px] font-extrabold text-core-darkest remove-arrow outline-none w-full"
      :value="modelValue"
      @input="
        $emit(
          'update:modelValue',
          ($event.target as HTMLInputElement).value !== '' ? parseFloat(($event.target as HTMLInputElement).value) : 0.0
        )
      "
    />
  </div>
</template>
