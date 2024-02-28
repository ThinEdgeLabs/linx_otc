<script setup lang="ts">
import { ref } from 'vue'
import { useOrderStore } from '@/stores/tradeOrder'
import { useRequesterBalanceStore } from '@/stores/requesterBalance'
import { useReceiverBalanceStore } from '@/stores/receiverBalance'
import TokenDropdownItem from '@/components/TokenDropdownItem.vue'
import NumberInput from '@/components/NumberInput.vue'
import MaxButton from '@/components/MaxButton.vue'
import type { TokenData } from '@/stores/node'
import { parseBalance } from '@/functions/utils'
import { getTokens } from '@/config'
import { useLoanOrderStore } from '@/stores/loanOrder'
import { onMounted } from 'vue'
import type { Token } from '@/types/token'

onMounted(() => checkSelectedLoanTokens())

const props = defineProps<{
  isSender: boolean
  offerType: 'trade' | 'loan'
}>()

const tokenStore = props.isSender ? useRequesterBalanceStore() : useReceiverBalanceStore()

const orderStore = useOrderStore()
const loanStore = useLoanOrderStore()

const selectedToken = ref<TokenData | undefined | Token>()
const dropdownOpen = ref(false)

function selectToken(token: TokenData | Token) {
  dropdownOpen.value = false
  selectedToken.value = token
  if (props.offerType === 'trade') {
    if (orderStore.order) {
      if (props.isSender) {
        orderStore.setFromToken(selectedToken.value.symbol)
      } else {
        orderStore.setToToken(selectedToken.value.symbol)
      }
    }
  } else {
    if (loanStore.order) {
      if (props.isSender) {
        loanStore.setLoanToken(selectedToken.value as Token)
      } else {
        loanStore.setCollateralToken(selectedToken.value as Token)
      }
    }
  }
}

function toggleDropDown() {
  dropdownOpen.value = !dropdownOpen.value
}

function onAmountChange(amount: number) {
  if (props.offerType === 'trade') {
    if (amount > parseBalance((selectedToken.value! as TokenData).balance, selectedToken.value!.decimals)) {
      // amountError.value = 'Insufficient Balance'
      // bridgeStore.data.isFormValid = false
    } else {
      const parsedAmount = amount.toFixed(selectedToken.value!.decimals)
      orderStore.setFromAmount(selectedToken.value!.decimals > 0 ? parseFloat(parsedAmount) : parseInt(parsedAmount))
    }
  } else {
    if (props.isSender) {
      if (amount > parseBalance((selectedToken.value! as TokenData).balance, selectedToken.value!.decimals)) {
        // amountError.value = 'Insufficient Balance'
        // bridgeStore.data.isFormValid = false
      } else {
        const parsedAmount = amount.toFixed(selectedToken.value!.decimals)
        loanStore.setLoanAmount(selectedToken.value!.decimals > 0 ? parseFloat(parsedAmount) : parseInt(parsedAmount))
      }
    } else {
      const parsedAmount = amount.toFixed(selectedToken.value!.decimals)
      loanStore.setCollateralAmount(
        selectedToken.value!.decimals > 0 ? parseFloat(parsedAmount) : parseInt(parsedAmount)
      )
    }
  }
}

function checkSelectedLoanTokens() {
  if (props.offerType === 'loan' && loanStore.order) {
    if (props.isSender && loanStore.order!.loanToken && !selectedToken.value) {
      selectedToken.value = getTokens().find((e) => e.symbol === loanStore.order!.loanToken?.symbol)
    } else if (loanStore.order!.collateralToken && !selectedToken.value) {
      selectedToken.value = getTokens().find((e) => e.symbol === loanStore.order!.collateralToken?.symbol)
    }
  }
}
</script>

<template>
  <section :v-bind="checkSelectedLoanTokens" class="flex flex-col space-y-[10px] text-[14px]">
    <div class="font-extrabold text-core-light">
      {{
        props.isSender
          ? props.offerType === 'loan'
            ? 'Offered Loan'
            : 'You offer'
          : props.offerType === 'loan'
            ? 'Requested Collateral'
            : 'You request'
      }}
    </div>
    <div class="relative w-full">
      <div
        @click="!selectedToken ? toggleDropDown() : null"
        class="flex flex-row w-full p-[10px] bg-white justify-between items-center text-core"
        :class="dropdownOpen ? 'rounded-t-lg border-b-[1px] border-core-darkest bg-white z-10' : 'rounded-lg z-0'"
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
              :model-value="
                props.offerType === 'trade'
                  ? props.isSender
                    ? orderStore.order?.amountFrom
                    : orderStore.order?.amountTo
                  : props.isSender
                    ? loanStore.order?.loanAmount
                    : loanStore.order?.collateralAmount
              "
              @update:model-value="onAmountChange"
            />
            <MaxButton
              v-if="props.offerType === 'trade' || props.isSender"
              @click="
                props.offerType === 'trade'
                  ? orderStore.setFromAmount(parseBalance((selectedToken as TokenData).balance, selectedToken.decimals))
                  : loanStore.setLoanAmount(parseBalance((selectedToken as TokenData).balance, selectedToken.decimals))
              "
            />
          </div>
          <p v-else>{{ 'Select a token' }}</p>
        </div>
        <font-awesome-icon v-if="!selectedToken" :icon="['fal', 'angle-down']" class="text-[18px] text-accent-3" />
      </div>
      <div v-if="dropdownOpen" class="absolute bg-white w-full rounded-b-lg h-48 overflow-auto z-10">
        <ul class="py-2 divide-y divide-grey-100 text-sm text-gray-700">
          <TokenDropdownItem
            v-for="token in props.offerType === 'loan' && !props.isSender ? getTokens() : tokenStore.balance"
            v-bind:key="token.name"
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
