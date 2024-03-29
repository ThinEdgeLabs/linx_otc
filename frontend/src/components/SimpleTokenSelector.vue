<script setup lang="ts">
import { type Token } from '@/types'
import { ref } from 'vue'
import HorizontalDivider from './HorizontalDivider.vue'

const props = defineProps<{
  tokenValue: Token
  setToken: Function
  tokenList: Array<Token>
}>()

const openSelector = ref(false)
</script>

<template>
  <section class="relative">
    <div
      @click="openSelector = !openSelector"
      class="w-full flex flex-row bg-divider p-[12px] justify-between items-center font-normal"
      :class="openSelector ? 'rounded-t-lg z-10' : 'rounded-lg -z-1'"
    >
      <div class="flex flex-row space-x-[10px] items-center">
        <img
          v-if="tokenValue.name != 'Any token'"
          :src="`${tokenValue.logoUri}`"
          class="w-[20px] h-[20px] rounded-full"
        />
        <div class="text-[14px] text-core-lightest">
          {{ tokenValue.name }}
        </div>
      </div>

      <font-awesome-icon :icon="['fas', 'angle-down']" class="text-[18px] text-accent-3" />
    </div>
    <div
      v-if="openSelector"
      class="absolute w-full bg-divider rounded-b-lg p-[12px] space-y-4 h-48 lg:h-64 overflow-auto z-10"
    >
      <div
        v-for="token in props.tokenList"
        v-bind:key="token.name"
        @click="setToken(token), (openSelector = !openSelector)"
        class="w-full font-normal space-y-4"
      >
        <HorizontalDivider :class="'bg-menu'" />
        <div class="flex flex-row items-center space-x-[10px]">
          <img :src="`${token.logoUri}`" class="w-[32px] h-[32px] rounded-full" />
          <div>{{ token.name }}</div>
          <div v-if="token.symbol != 'NONE'">({{ token.symbol }})</div>
        </div>
      </div>
    </div>
  </section>
</template>
