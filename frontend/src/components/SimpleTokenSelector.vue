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
      class="w-full flex flex-row p-[12px] justify-between items-center font-normal cursor-pointer max-h-48 lg:max-h-64"
      :class="openSelector ? 'rounded-t-lg z-10 bg-core-lightest' : 'rounded-lg -z-1 bg-divider'"
    >
      <div class="flex flex-row space-x-[10px] items-center">
        <img
          v-if="tokenValue.name != 'Any token'"
          :src="`${tokenValue.logoUri}`"
          class="w-[20px] h-[20px] rounded-full"
        />
        <div class="text-[14px] text-core-lightest" :class="openSelector ? 'text-menu' : 'text-core-lightest'">
          {{ openSelector && tokenValue.name === 'Any token' ? 'Select a token' : tokenValue.name }}
        </div>
      </div>

      <font-awesome-icon :icon="['fas', 'angle-down']" class="text-[18px] text-accent-3" />
    </div>
    <div v-if="openSelector" class="absolute w-full rounded-b-lg overflow-auto max-h-[362px] z-10">
      <div
        v-for="token in props.tokenList"
        v-bind:key="token.name"
        @click="setToken(token), (openSelector = !openSelector)"
        class="w-full font-normal hover:bg-white bg-core-lightest"
      >
        <HorizontalDivider :background-color="'core-light'" />
        <div class="flex flex-row items-center justify-between py-3 px-2 cursor-pointer text-core-darkest">
          <div class="flex flex-row items-center space-x-[10px]">
            <img :src="`${token.logoUri}`" class="w-[32px] h-[32px] rounded-full" />
            <p class="font-extrabold text-[14px] text-core-darkest">
              {{ token.symbol === 'NONE' ? 'ANY' : token.symbol }}
            </p>
          </div>
          <div v-if="token.name === props.tokenValue.name">
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
