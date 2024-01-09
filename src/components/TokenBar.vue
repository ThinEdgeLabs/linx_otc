<script setup lang="ts">
import { ref } from 'vue'
import { useOrderStore } from '@/stores/order'
import TokenDropdownItem from '@/components/TokenDropdownItem.vue'
import { tokens } from '@/config'

const props = defineProps({
  isSender: {
    type: Boolean,
    required: true
  }
})

const orderStore = useOrderStore()

const selectedToken = ref('NONE')
const dropdownOpen = ref(false)

function selectToken(token: string) {
  dropdownOpen.value = false
  selectedToken.value = token
  if (orderStore.order) {
    if (props.isSender) {
      orderStore.setFromToken(selectedToken.value)
    } else {
      orderStore.setToToken(selectedToken.value)
    }
  }
}

function toggleDropDown() {
  dropdownOpen.value = !dropdownOpen.value
}
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px]">
    <div class="font-extrabold text-core-light">
      {{ props.isSender ? 'You offer' : 'You request' }}
    </div>
    <div class="relative w-full">
      <div
        @click="toggleDropDown()"
        class="flex flex-row w-full p-[10px] bg-white justify-between items-center text-core"
        :class="
          dropdownOpen
            ? 'rounded-t-lg border-b-[1px] border-core-darkest bg-white z-10'
            : 'rounded-lg z-0'
        "
      >
        <div class="flex flex-row space-x-[10px] items-center">
          <img :src="`./images/${selectedToken}.png`" class="w-[32px] h-[32px] rounded-full" />
          <div v-if="selectedToken != 'NONE'" class="flex flex-row items-center space-x-[10px]">
            <p>{{ selectedToken }}</p>
            <font-awesome-icon @click="toggleDropDown()" :icon="['fas', 'angle-down']" />
            <div class="inline-block w-[0.5px] self-stretch bg-core-light opacity-100"></div>
          </div>
          <p v-else>{{ 'Select a token' }}</p>
        </div>
        <font-awesome-icon
          v-if="selectedToken === 'NONE'"
          :icon="['fal', 'angle-down']"
          class="text-[18px] text-accent-3"
        />
      </div>
      <div
        v-if="dropdownOpen"
        class="absolute bg-white w-full rounded-b-lg h-48 overflow-auto z-10"
      >
        <ul class="py-2 divide-y divide-grey-100 text-sm text-gray-700">
          <TokenDropdownItem
            v-for="token in tokens"
            v-bind:key="tokens.indexOf(token)"
            :token="token"
            :is-offer="props.isSender"
            :is-selected="token.symbol === selectedToken"
            @click="selectToken(token.symbol)"
          />
        </ul>
      </div>
    </div>
  </section>
</template>
