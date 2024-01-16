<script setup lang="ts">
import { ref } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useRequesterBalanceStore } from '@/stores/requesterBalance'
import { useReceiverBalanceStore } from '@/stores/receiverBalance'
import TokenDropdownItem from '@/components/TokenDropdownItem.vue'
import NumberInput from '@/components/NumberInput.vue'
import MaxButton from '@/components/MaxButton.vue'
import type { TokenData } from '@/stores/node'
import { parseBalance } from '@/functions/utils'

const props = defineProps({
  isSender: {
    type: Boolean,
    required: true
  }
})

const tokenStore = props.isSender ? useRequesterBalanceStore() : useReceiverBalanceStore()

const orderStore = useOrderStore()

const selectedToken = ref<TokenData | undefined>()
const dropdownOpen = ref(false)

function selectToken(token: TokenData) {
  dropdownOpen.value = false
  selectedToken.value = token
  if (orderStore.order) {
    if (props.isSender) {
      orderStore.setFromToken(selectedToken.value.symbol)
    } else {
      orderStore.setToToken(selectedToken.value.symbol)
    }
  }
}

function toggleDropDown() {
  dropdownOpen.value = !dropdownOpen.value
}

function onAmountChange(amount: number) {
  console.log('onAmountChange', amount)
  if (amount > parseBalance(selectedToken.value!.balance, selectedToken.value!.decimals)) {
    // amountError.value = 'Insufficient Balance'
    // bridgeStore.data.isFormValid = false
  } else {
    const parsedAmount = amount.toFixed(selectedToken.value!.decimals)
    orderStore.setFromAmount(
      selectedToken.value!.decimals > 0 ? parseFloat(parsedAmount) : parseInt(parsedAmount)
    )
  }
}
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px]">
    <div class="font-extrabold text-core-light">
      {{ props.isSender ? 'You offer' : 'You request' }}
    </div>
    <div class="relative w-full">
      <div
        @click="!selectedToken ? toggleDropDown() : null"
        class="flex flex-row w-full p-[10px] bg-white justify-between items-center text-core"
        :class="
          dropdownOpen
            ? 'rounded-t-lg border-b-[1px] border-core-darkest bg-white z-10'
            : 'rounded-lg z-0'
        "
      >
        <div class="flex flex-row space-x-[10px] items-center w-full">
          <img
            @click="toggleDropDown()"
            :src="`./images/${selectedToken?.symbol ?? 'NONE'}.png`"
            class="w-[32px] h-[32px] rounded-full"
          />
          <div v-if="selectedToken" class="flex flex-row items-center space-x-[10px] w-full">
            <div @click="toggleDropDown()" class="flex flex-row space-x-[10px] items-center">
              <p>{{ selectedToken.symbol }}</p>
              <font-awesome-icon :icon="['fas', 'angle-down']" />
              <div class="inline-block w-[0.5px] self-stretch bg-core-light opacity-100"></div>
            </div>
            <NumberInput
              :model-value="orderStore.order?.amountFrom"
              @update:model-value="onAmountChange"
            />
            <MaxButton
              @click="
                orderStore.setFromAmount(
                  parseBalance(selectedToken.balance, selectedToken.decimals)
                )
              "
            />
          </div>
          <p v-else>{{ 'Select a token' }}</p>
        </div>
        <font-awesome-icon
          v-if="!selectedToken"
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
            v-for="token in tokenStore.balance"
            v-bind:key="tokenStore.balance.indexOf(token)"
            :token="token"
            :is-offer="props.isSender"
            :is-selected="token === selectedToken"
            @click="selectToken(token)"
          />
        </ul>
      </div>
    </div>
  </section>
</template>
