<script setup lang="ts">
import { ref, toValue, watchEffect } from 'vue'
import { useOrderStore } from '@/stores/tradeOrder'
import TokenDropdownItem from '@/components/TokenDropdownItem.vue'
import NumberInput from '@/components/NumberInput.vue'
import MaxButton from '@/components/MaxButton.vue'
import { getTokens } from '@/config'
import { useLoanOrderStore } from '@/stores/loanOrder'
import { onMounted } from 'vue'
import type { Token } from '@/types/token'
import { useBalance } from '@/composables/balance'
import { ALPH_TOKEN_ID, convertAmountWithDecimals, prettifyExactAmount } from '@alephium/web3'
import ValidationError from './ValidationError.vue'

const props = defineProps<{
  isSender: boolean
  offerType: 'trade' | 'loan'
}>()

const errorMessage = ref<string | undefined>(undefined)

onMounted(() => {
  watchEffect(() => {
    if (!toValue(isLoading)) {
      if (toValue(balance)) {
        const alph: Token | undefined = tokens.value.find((e) => e.contractId === ALPH_TOKEN_ID)
        alph!.balance = {
          balance: balance.value!.balance,
          balanceHint: balance.value!.balanceHint
        }
        balance.value!.tokenBalances?.forEach((tokenBalance) => {
          const token = tokens.value.find((e) => e.contractId === tokenBalance.id)
          if (token) {
            token.balance = {
              balance: tokenBalance.amount,
              balanceHint: ` ${prettifyExactAmount(tokenBalance.amount, token.decimals)!} ${token.symbol}`
            }
          }
        })
      } else {
        // Reset any previously set balances
        tokens.value.forEach((token) => {
          token.balance = undefined
        })
      }
      checkSelectedLoanTokens()
    }
  })
})

const orderStore = useOrderStore()
const loanStore = useLoanOrderStore()

const { balance, isLoading } = useBalance()

const selectedToken = ref<Token | undefined>()
const dropdownOpen = ref(false)
const tokens = ref<Token[]>(getTokens())

function selectToken(token: Token) {
  if (token.symbol != 'NONE') {
    dropdownOpen.value = false
    selectedToken.value = token
    if (props.offerType === 'trade') {
      if (orderStore.order) {
        if (props.isSender) {
          orderStore.setFromToken(selectedToken.value)
        } else {
          orderStore.setToToken(selectedToken.value)
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
  } else {
    dropdownOpen.value = false
  }
}

function toggleDropDown() {
  dropdownOpen.value = !dropdownOpen.value
}

function onAmountChange(value: number) {
  errorMessage.value = undefined
  const amount = convertAmountWithDecimals(value, selectedToken.value!.decimals)
  if (!amount) {
    errorMessage.value = 'Invalid Amount'
    return
  }

  if (amount > BigInt(selectedToken.value!.balance!.balance) && props.isSender) {
    errorMessage.value = 'Insufficient Balance'
    return
  }

  if (props.offerType === 'trade') {
    if (props.isSender) {
      orderStore.setFromAmount(value)
    } else {
      orderStore.setAmountTo(value)
    }
  } else {
    if (props.isSender) {
      loanStore.setLoanAmount(value)
    } else {
      loanStore.setCollateralAmount(value)
    }
  }
}

function checkSelectedLoanTokens() {
  if (props.offerType === 'loan' && loanStore.order) {
    if (props.isSender && loanStore.order!.loanToken && !selectedToken.value) {
      selectedToken.value = tokens.value.find((e) => e.symbol === loanStore.order!.loanToken?.symbol)
    } else if (loanStore.order!.collateralToken && !selectedToken.value) {
      selectedToken.value = tokens.value.find((e) => e.symbol === loanStore.order!.collateralToken?.symbol)
    }
  }
}

function onMaxButtonClick() {
  const token = toValue(selectedToken)
  if (props.offerType === 'trade') {
    if (props.isSender) {
      orderStore.setFromAmount(Number(prettifyExactAmount(token!.balance!.balance, token!.decimals)))
    } else {
      orderStore.setAmountTo(Number(prettifyExactAmount(token!.balance!.balance, token!.decimals)))
    }
  } else {
    loanStore.setLoanAmount(Number(prettifyExactAmount(token!.balance!.balance, token!.decimals)))
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
        class="flex flex-row w-full p-[10px] bg-white justify-between items-center text-core min-h-[60px]"
        :class="dropdownOpen ? 'rounded-t-lg border-b-[1px] border-core-darkest bg-white z-10' : 'rounded-lg z-0'"
      >
        <div class="flex flex-row space-x-[10px] items-center w-full">
          <img
            @click="toggleDropDown()"
            :src="`${selectedToken?.logoUri ?? './images/tokens/NONE.png'}`"
            class="w-[32px] h-[32px] rounded-full"
          />
          <div v-if="selectedToken" class="flex flex-row items-center space-x-[10px] w-full">
            <div @click="toggleDropDown()" class="flex flex-row min-w-[20%] items-center justify-between">
              <p class="min-w-[50%]">{{ selectedToken.symbol }}</p>
              <div class="flex flex-row space-x-[10px]">
                <font-awesome-icon :icon="['fas', 'angle-down']" />
                <div class="inline-block w-[0.5px] self-stretch bg-core-light opacity-100"></div>
              </div>
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
            <MaxButton v-if="props.offerType === 'trade' || props.isSender" @click="onMaxButtonClick" />
          </div>
          <p v-else>{{ 'Select a token' }}</p>
        </div>
        <font-awesome-icon v-if="!selectedToken" :icon="['fal', 'angle-down']" class="text-[18px] text-accent-3" />
      </div>
      <div v-if="dropdownOpen" class="absolute bg-white w-full rounded-b-lg h-48 overflow-auto z-10">
        <ul class="py-2 divide-y divide-grey-100 text-sm text-gray-700">
          <TokenDropdownItem
            v-for="token in props.offerType === 'loan' && !props.isSender ? getTokens() : tokens"
            v-bind:key="token.name"
            :token="token"
            :is-offer="props.isSender"
            :is-selected="token === selectedToken"
            @click="selectToken(token)"
          />
        </ul>
      </div>
    </div>
    <ValidationError :message="errorMessage" />
  </section>
</template>
