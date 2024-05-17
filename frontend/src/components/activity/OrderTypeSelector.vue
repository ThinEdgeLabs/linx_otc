<script setup lang="ts">
import { ref } from 'vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'

const typeList = ['Any', 'Trades', 'Loans']

const dropdownOpen = ref<boolean>(false)

const selectedType = ref<string>('Any')

defineEmits<{
  (e: 'update:txType', value: string): void
}>()
</script>

<template>
  <section class="relative">
    <div
      class="w-full flex flex-row items-center justify-between px-[16px] h-[40px] max-w-[386px]"
      @click="dropdownOpen = !dropdownOpen"
      :class="dropdownOpen ? 'rounded-t-lg z-10 bg-core-lightest' : 'rounded-lg -z-1 bg-divider'"
    >
      <p>{{ selectedType }}</p>
      <font-awesome-icon :icon="['fas', 'angle-down']" class="text-[18px] text-accent-3" />
    </div>
    <div v-if="dropdownOpen" class="absolute w-full rounded-b-lg overflow-auto max-h-[362px] max-w-[386px] z-10">
      <div
        v-for="typeName in typeList"
        v-bind:key="typeName"
        @click="(selectedType = typeName), (dropdownOpen = !dropdownOpen), $emit('update:txType', typeName)"
        class="w-full font-normal hover:bg-white bg-core-lightest"
      >
        <HorizontalDivider :background-color="'core-light'" />
        <div class="flex flex-row items-center justify-between py-3 px-2 cursor-pointer text-core-darkest">
          <div class="flex flex-row items-center space-x-[10px]">
            <p class="font-extrabold text-[14px] text-core-darkest">
              {{ typeName }}
            </p>
          </div>
          <div v-if="typeName === selectedType">
            <font-awesome-icon
              :icon="['fal', 'circle-check']"
              class="text-core-lightest text-[14px] bg-ok rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
