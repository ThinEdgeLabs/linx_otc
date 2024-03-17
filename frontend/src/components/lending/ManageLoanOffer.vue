<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import HorizontalDivider from '../HorizontalDivider.vue'
import LoanPreviewLabel from './LoanPreviewLabel.vue'
import CustomButton from '../CustomButton.vue'
import ComponentTitle from '../ComponentTitle.vue'
import { computed, onMounted, ref } from 'vue'
import ApproveWallet, { type Status } from '../ApproveWallet.vue'
import { calculateApr, convertBasisPointsToPercentage } from '@/functions/utils'
import type { Loan } from '@/types'
import { SignerProvider, addressFromContractId, prettifyTokenAmount, web3 } from '@alephium/web3'
import { getMarketplaceConfig } from '@/config'
import { getTokens } from '@/config'
import { LendingMarketplaceHelper } from '../../../../shared/lending-marketplace'
import { waitTxConfirmed } from '@alephium/cli'
import { useAccountStore } from '@/stores'
import { LendingOfferInstance, type LendingOfferTypes } from '../../../../artifacts/ts'

defineEmits<{
  (e: 'update:closeOffer'): void
}>()

const props = defineProps<{
  loan: Loan
}>()

const config = getMarketplaceConfig()
web3.setCurrentNodeProvider(config.defaultNodeUrl)
const accountStore = useAccountStore()

const state = ref<LendingOfferTypes.State | undefined>()
const status = ref<Status | undefined>(undefined)
const txId = ref<string | undefined>(undefined)

const isLender = computed(() => accountStore.account?.address && accountStore.account?.address === props.loan.lender)
const isBorrower = computed(
  () => accountStore.account?.address && accountStore.account?.address === state.value?.fields.borrower
)
const isActive = computed(() => state.value?.fields.borrower !== state.value?.fields.lender)

const collateralToken = getTokens().find((e) => e.contractId === props.loan.collateralToken) ?? {
  symbol: 'unknown',
  name: 'unknown',
  decimals: 18,
  logoUri: '/images/tokens/nologo.png'
}
const loanToken = getTokens().find((e) => e.contractId === props.loan.loanToken) ?? {
  symbol: 'unknown',
  name: 'unknown',
  decimals: 18,
  logoUri: '/images/tokens/nologo.png'
}

onMounted(async () => {
  const instance = new LendingOfferInstance(addressFromContractId(props.loan.loanId))
  state.value = await instance.fetchState()
  console.log(state.value)
})

function calculateReceivedAmount(loan: Loan) {
  return (loan.loanAmount * (10000n - (config.fee as bigint))) / 10000n
}

async function borrow() {
  const config = getMarketplaceConfig()
  const marketplace = new LendingMarketplaceHelper(accountStore.signer as SignerProvider)
  marketplace.contractId = config.marketplaceContractId
  try {
    status.value = 'approve'
    const result = await marketplace.takeOffer(
      accountStore.signer as SignerProvider,
      props.loan.loanId,
      props.loan.collateralToken,
      props.loan.collateralAmount
    )
    status.value = 'signed'
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await waitTxConfirmed(accountStore.nodeProvider!, result.txId, 1, 1000)
    txId.value = result.txId
    status.value = 'success'
  } catch (err) {
    console.log('err', err)
    status.value = 'denied'
  }
}

async function cancel() {
  const config = getMarketplaceConfig()
  const marketplace = new LendingMarketplaceHelper(accountStore.signer as SignerProvider)
  marketplace.contractId = config.marketplaceContractId
  try {
    status.value = 'approve'
    const result = await marketplace.cancelOffer(accountStore.signer as SignerProvider, props.loan.loanId)
    status.value = 'signed'
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await waitTxConfirmed(accountStore.nodeProvider!, result.txId, 1, 1000)
    txId.value = result.txId
    status.value = 'success'
  } catch (err) {
    console.log('err', err)
    status.value = 'denied'
  }
}

async function repay() {
  //TODO
  console.log('repay')
}

async function liquidate() {
  //TODO
  console.log('liquidate')
}

function reset() {
  status.value = undefined
  txId.value = undefined
}
</script>

<template>
  <section class="w-full h-full flex flex-col lg:flex-row space-y-[30px] lg:space-y-0 lg:space-x-[30px] leading-snug">
    <div v-if="!status" class="flex flex-col bg-menu w-full p-[10px] lg:p-[30px] space-y-[30px] rounded-lg">
      <div class="flex flex-col h-full justify-between">
        <div class="flex flex-col space-y-[30px]">
          <ComponentTitle
            :title="`Loan order ${shortenString(loan.loanId, 12)}`"
            :description="`Created on ${new Date(loan.created).toDateString()}`"
            :status="isActive ? 'Active' : 'Open'"
            @update:go-back="$emit('update:closeOffer')"
          />
          <div class="flex flex-col">
            <div class="grid grid-cols-2 w-full items-center">
              <div class="flex flex-row space-x-[10px] item-center">
                <img :src="`${loanToken.logoUri}`" class="w-[60px] h-[60px] rounded-full" />
                <div class="flex flex-col text-start justify-center">
                  <p class="text-[10px] lg:text-[12px] text-core-light">LENDING</p>
                  <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                    <p class="font-extrabold text-core-lightest">
                      {{ prettifyTokenAmount(loan.loanAmount, loanToken.decimals) }}
                    </p>
                    <p class="text-core-light">{{ loanToken.symbol }}</p>
                  </div>
                </div>
              </div>
              <div class="flex flex-row space-x-[10px] item-center">
                <div class="flex w-[60px] h-[60px] rounded-full bg-core-darkest items-center justify-center">
                  <font-awesome-icon :icon="['fal', 'receipt']" class="text-core-light text-[20px]" />
                </div>
                <div class="flex flex-col text-start justify-center">
                  <p class="text-[10px] lg:text-[12px] text-core-light">
                    INTEREST {{ convertBasisPointsToPercentage(loan.interest) }} {{ loanToken.symbol }}
                  </p>
                  <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                    <p class="font-extrabold text-core-lightest">
                      {{ prettifyTokenAmount(calculateApr(loan), 18) }}
                    </p>
                    <p class="text-core-light">% APR</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="border-dashed border-r-2 border-accent-3 h-[20px] w-[30px]"></div>
            <div class="grid grid-cols-2 w-full items-center">
              <div class="flex flex-row space-x-[10px] item-center">
                <img :src="`${collateralToken.logoUri}`" class="w-[60px] h-[60px] rounded-full" />
                <div class="flex flex-col text-start justify-center">
                  <p class="text-[10px] lg:text-[12px] text-core-light">COLLATERAL</p>
                  <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                    <p class="font-extrabold text-core-lightest">
                      {{ prettifyTokenAmount(loan.collateralAmount, collateralToken.decimals) }}
                    </p>
                    <p class="text-core-light">{{ collateralToken.symbol }}</p>
                  </div>
                </div>
              </div>
              <div class="flex flex-row space-x-[10px] item-center">
                <div class="flex w-[60px] h-[60px] rounded-full bg-core-darkest items-center justify-center">
                  <font-awesome-icon :icon="['fal', 'calendar-days']" class="text-core-light text-[20px]" />
                </div>
                <div class="flex flex-col text-start justify-center">
                  <p class="text-[10px] lg:text-[12px] text-core-light">DURATION</p>
                  <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                    <p class="font-extrabold text-core-lightest">
                      {{ props.loan.duration }}
                    </p>
                    <p class="text-core-light">DAYS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col w-full border-2 border-dashed border-accent-3 p-[15px] rounded-lg">
        <div class="flex flex-row space-x-[10px] items-center">
          <font-awesome-icon :icon="['fal', 'info-circle']" class="text-core-lightest text-[16px]" />
          <p class="text-[14px] font-extrabold text-core-lightest">Useful Tips</p>
        </div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec viverra pretium nisl, a efficitur purus
          fringilla sed viverra pretium nisl.
        </p>
      </div>
    </div>
    <ApproveWallet
      v-else
      @update:cancel="reset"
      @update:finished="$emit('update:closeOffer')"
      :status="status"
      :tx-id="txId"
    />
    <div class="flex flex-col bg-menu w-full lg:w-[40%] p-[10px] lg:p-[30px] rounded-lg space-y-[30px]">
      <div class="flex flex-col">
        <p class="text-[22px] font-extrabold text-core-lightest">Loan information</p>
        <p class="text-[14px] text-core-light">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-between items-center rounded-lg">
        <div class="flex flex-row space-x-[10px] items-center">
          <img :src="`${loanToken.logoUri}`" class="w-[40px] h-[40px] rounded-full" />
          <div class="flex flex-col text-start justify-center">
            <p class="text-[10px] text-core-light">LENDING</p>
            <div class="flex flex-row items-center space-x-[10px] text-[14px]">
              <p class="font-extrabold text-core-lightest">
                {{ prettifyTokenAmount(loan.loanAmount, loanToken.decimals) }}
              </p>
              <p class="text-core-light">{{ loanToken.symbol }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col text-end">
          <p class="text-[10px] text-core-light">FROM</p>
          <p class="text-[14px] font-extrabold text-core-lightest">
            {{ shortenString(props.loan.lender, 12) }}
          </p>
        </div>
      </div>

      <div class="flex flex-col space-y-[15px]">
        <HorizontalDivider />
        <LoanPreviewLabel :title="'P2P Fee'" :amount="convertBasisPointsToPercentage(config.fee as bigint)" />
        <HorizontalDivider />
        <LoanPreviewLabel
          :title="'You receive'"
          :amount="prettifyTokenAmount(calculateReceivedAmount(loan), loanToken.decimals) ?? '0'"
          :amount_description="loanToken.symbol"
        />
        <HorizontalDivider />
        <LoanPreviewLabel :title="'Estimated time to create order'" :amount="'60'" :amount_description="'seconds'" />
      </div>

      <CustomButton
        v-if="!isActive && !isLender"
        :disabled="!accountStore.account?.isConnected"
        :title="'Borrow'"
        :class="'w-full'"
        @click="borrow"
      />
      <CustomButton v-if="!isActive && isLender" :title="'Cancel offer'" :class="'w-full'" @click="cancel" />
      <CustomButton v-if="isActive && isBorrower" :title="'Repay'" :class="'w-full'" @click="repay" />

      <div class="flex flex-row items-center text-center space-x-[4px] justify-center text-[12px]">
        <p class="text-core-light">By using this feature, you agree to LinxLabs</p>
        <button class="text-accent-3">Terms of Use</button>
      </div>
    </div>
  </section>
</template>
