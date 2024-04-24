<script setup lang="ts">
import { shortenString } from '../functions/stringUtils'
import HorizontalDivider from '../components/HorizontalDivider.vue'
import LoanPreviewLabel from '../components/lending/LoanPreviewLabel.vue'
import CustomButton from '../components/CustomButton.vue'
import ComponentTitle from '../components/ComponentTitle.vue'
import { computed, onMounted, ref } from 'vue'
import ApproveWallet, { type Status } from '../components/ApproveWallet.vue'
import { calculateApr, convertBasisPointsToPercentage } from '../functions/utils'
import type { Loan, Token } from '../types'
import {
  ContractEvent,
  SignerProvider,
  addressFromContractId,
  prettifyExactAmount,
  prettifyTokenAmount,
  web3
} from '@alephium/web3'
import { getMarketplaceConfig, getTokens } from '../config'
import { LendingMarketplaceHelper } from '../../../shared/lending-marketplace'
import { waitTxConfirmed } from '@alephium/cli'
import { useAccountStore, useLoanStore } from '../stores'
import { LendingOfferInstance } from '../../../artifacts/ts'
import { useRoute } from 'vue-router'
import router from '@/router'
import { storeToRefs } from 'pinia'

const route = useRoute()
const contractId = route.params.loan as string
const loan = ref<Loan | undefined>(undefined)

const config = getMarketplaceConfig()
web3.setCurrentNodeProvider(config.defaultNodeUrl)
const { account, signer, nodeProvider } = storeToRefs(useAccountStore())

const status = ref<Status | undefined>(undefined)
const txId = ref<string | undefined>(undefined)
const fetchingData = ref<boolean>(true)
const events = ref<ContractEvent[]>([])

const isLender = computed(() => loan.value?.lender === account.value?.address)
const isBorrower = computed(() => loan.value?.borrower === account.value?.address)
const isActive = computed(() => loan.value?.borrower !== loan.value?.lender)
const isOverdue = computed(() => {
  if (loan.value) {
    return Number(loan.value.duration) * 24 * 60 * 60 * 1000 + loan.value.created < Date.now()
  }
  return false
})
const canBorrow = computed(() => !isActive.value && !isLender.value)
const canRepay = computed(() => isActive.value && isBorrower.value)
const canDelete = computed(() => !isActive.value && isLender.value)

const undefinedToken = {
  contractId: 'unknown',
  symbol: 'unknown',
  name: 'unknown',
  decimals: 18,
  logoUri: '/images/tokens/nologo.png'
}

const collateralToken = ref<Token>(undefinedToken)
const loanToken = ref<Token>(undefinedToken)

onMounted(async () => {
  await loadLoan()
  events.value = await useLoanStore().getLoanEvents(contractId)
})

function calculateReceivedAmount(loan: Loan) {
  return (loan.loanAmount * (10000n - (config.fee as bigint))) / 10000n
}

function getDueDate(loan: Loan) {
  const dueTimestamp = loan.created + Number(loan.duration) * 24 * 60 * 60 * 1000
  const diff = dueTimestamp - Date.now()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000)) % 24
  if (days > 0) {
    return `${days} days`
  } else if (days === 0 && hours > 0) {
    return `${hours} hours`
  } else {
    return 0
  }
}

async function loadLoan() {
  try {
    const instance = new LendingOfferInstance(addressFromContractId(contractId))
    const state = await instance.fetchState()
    loan.value = {
      id: state.fields.id,
      contractId,
      collateralToken: state.fields.collateralTokenId,
      collateralAmount: state.fields.collateralAmount,
      loanToken: state.fields.lendingTokenId,
      loanAmount: state.fields.lendingAmount,
      interest: state.fields.interestRate,
      duration: state.fields.duration,
      created: Number(state.fields.loanTimeStamp) * 1000,
      lender: state.fields.lender,
      borrower: state.fields.borrower
    }
    collateralToken.value = getTokens().find((e) => e.contractId === loan.value?.collateralToken) ?? undefinedToken
    loanToken.value = getTokens().find((e) => e.contractId === loan.value?.loanToken) ?? undefinedToken
  } catch (err) {
    console.log('err', err)
  } finally {
    fetchingData.value = false
  }
}

async function borrow() {
  if (loan.value) {
    const config = getMarketplaceConfig()
    const marketplace = new LendingMarketplaceHelper(signer.value as SignerProvider)
    marketplace.contractId = config.marketplaceContractId
    try {
      status.value = 'approve'
      const result = await marketplace.takeOffer(
        signer.value as SignerProvider,
        loan.value.contractId,
        loan.value.collateralToken,
        loan.value.collateralAmount
      )
      status.value = 'signed'
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await waitTxConfirmed(nodeProvider.value, result.txId, 1, 1000)
      txId.value = result.txId
      status.value = 'success'
    } catch (err) {
      console.log('err', err)
      status.value = 'denied'
    }
  }
}

async function cancel() {
  if (loan.value) {
    const config = getMarketplaceConfig()
    const marketplace = new LendingMarketplaceHelper(signer.value as SignerProvider)
    marketplace.contractId = config.marketplaceContractId
    try {
      status.value = 'approve'
      const result = await marketplace.cancelOffer(signer.value as SignerProvider, loan.value.contractId)
      status.value = 'signed'
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await waitTxConfirmed(nodeProvider.value, result.txId, 1, 1000)
      txId.value = result.txId
      status.value = 'success'
    } catch (err) {
      console.log('err', err)
      status.value = 'denied'
    }
  }
}

async function repay() {
  if (loan.value) {
    const config = getMarketplaceConfig()
    const marketplace = new LendingMarketplaceHelper(signer.value as SignerProvider)
    marketplace.contractId = config.marketplaceContractId
    const instance = new LendingOfferInstance(addressFromContractId(contractId))
    const interest = (await instance.methods.getInterest()).returns
    try {
      status.value = 'approve'
      const result = await marketplace.repayLoan(
        signer.value as SignerProvider,
        loan.value.contractId,
        loan.value.loanToken,
        loan.value.loanAmount + interest
      )
      status.value = 'signed'
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await waitTxConfirmed(nodeProvider.value, result.txId, 1, 1000)
      txId.value = result.txId
      status.value = 'success'
    } catch (err) {
      console.log('err', err)
      status.value = 'denied'
    }
  }
}

async function liquidate() {
  if (loan.value) {
    const config = getMarketplaceConfig()
    const marketplace = new LendingMarketplaceHelper(signer.value as SignerProvider)
    marketplace.contractId = config.marketplaceContractId
    try {
      status.value = 'approve'
      const result = await marketplace.liquidateLoan(signer.value as SignerProvider, loan.value.contractId)
      status.value = 'signed'
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await waitTxConfirmed(nodeProvider.value, result.txId, 1, 1000)
      txId.value = result.txId
      status.value = 'success'
    } catch (err) {
      console.log('err', err)
      status.value = 'denied'
    }
  }
}

function reset() {
  status.value = undefined
  txId.value = undefined
}
</script>

<template>
  <div class="w-full py-[30px]">
    <section
      v-if="loan"
      class="w-full h-full flex flex-col lg:flex-row space-y-[30px] lg:space-y-0 lg:space-x-[30px] leading-snug"
    >
      <div v-if="!status" class="flex flex-col bg-menu w-full p-[10px] lg:p-[30px] space-y-[30px] rounded-lg">
        <div class="flex flex-col h-full justify-between">
          <div class="flex flex-col space-y-[30px]">
            <ComponentTitle
              :title="`Loan #${loan.id}`"
              :description="`Created on ${new Date(loan.created).toDateString()}`"
              :status="isActive ? 'Active' : 'Open'"
              @update:go-back="router.push('/lending')"
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
                    <div v-if="isActive">
                      <p class="text-[10px] lg:text-[12px] text-core-light">DUE IN</p>
                      <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                        <p class="font-extrabold text-core-lightest">
                          {{ getDueDate(loan) }}
                        </p>
                      </div>
                    </div>
                    <div v-else>
                      <p class="text-[10px] lg:text-[12px] text-core-light">DURATION</p>
                      <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                        <p class="font-extrabold text-core-lightest">
                          {{ loan.duration }}
                        </p>
                        <p class="text-core-light">{{ loan.duration > 1 ? 'DAYS' : 'DAY' }}</p>
                      </div>
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
        @update:retry="isLender ? cancel() : isBorrower ? repay() : borrow()"
        @update:cancel="reset"
        @update:finished="$emit('update:closeOffer')"
        :status="status"
        :tx-id="txId"
      />

      <!-- Loan information -->
      <div
        class="flex flex-col bg-menu w-full lg:w-[40%] p-[10px] lg:p-[30px] rounded-lg min-h-[500px] justify-items-stretch"
      >
        <div class="flex flex-col">
          <p class="text-[22px] font-extrabold text-core-lightest">Loan information</p>
          <p class="text-[14px] text-core-light">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>

        <div v-for="event in events" v-bind:key="events.indexOf(event)">
          <div
            v-if="event.name == 'LoanCreated'"
            class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg mt-[20px]"
          >
            <div class="flex flex-row space-x-[10px]">
              <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
                <font-awesome-icon :icon="['fal', 'pen']" class="text-core-light text-[20px]" />
              </div>
              <div class="flex flex-col text-start justify-center text-[10px]">
                <p class="text-core-light">CREATED BY</p>
                <div class="flex flex-row items-center space-x-[10px]">
                  <p class="font-extrabold text-core-lightest">
                    {{ shortenString(event.fields['lender'] as string, 12) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-[10px] flex flex-col text-end">
              <p class="text-core-light">ON</p>
              <p class="font-extrabold text-core-lightest">
                {{ new Date(loan.created).toDateString() }}
              </p>
            </div>
          </div>

          <div
            v-if="event.name == 'LoanCancelled'"
            class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg"
          >
            <div class="flex flex-row space-x-[10px]">
              <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
                <font-awesome-icon :icon="['fal', 'trash-can']" class="text-core-light text-[20px]" />
              </div>
              <div class="flex flex-col text-start justify-center text-[10px]">
                <p class="text-core-light">CANCELLED BY</p>
                <div class="flex flex-row items-center space-x-[10px]">
                  <p class="font-extrabold text-core-lightest">
                    {{ shortenString(event.fields['lender'] as string, 12) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-[10px] flex flex-col text-end">
              <p class="text-core-light">ON</p>
              <p class="font-extrabold text-core-lightest">
                {{ new Date(Number(event.fields['timestamp'] as bigint)).toDateString() }}
              </p>
            </div>
          </div>

          <div
            v-if="event.name == 'LoanAccepted'"
            class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg"
          >
            <div class="flex flex-row space-x-[10px]">
              <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
                <font-awesome-icon :icon="['fal', 'handshake']" class="text-core-light text-[20px]" />
              </div>
              <div class="flex flex-col text-start justify-center text-[10px]">
                <p class="text-core-light">ACCEPTED BY</p>
                <div class="flex flex-row items-center space-x-[10px]">
                  <p class="font-extrabold text-core-lightest">
                    {{ shortenString(event.fields['by'] as string, 12) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-[10px] flex flex-col text-end">
              <p class="text-core-light">ON</p>
              <p class="font-extrabold text-core-lightest">
                {{ new Date(Number(event.fields['timestamp'] as bigint)).toDateString() }}
              </p>
            </div>
          </div>

          <div
            v-if="event.name == 'LoanPaid'"
            class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg"
          >
            <div class="flex flex-row space-x-[10px]">
              <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
                <font-awesome-icon :icon="['fal', 'money-from-bracket']" class="text-core-light text-[20px]" />
              </div>
              <div class="flex flex-col text-start justify-center text-[10px]">
                <p class="text-core-light"></p>
                <div class="flex flex-row items-center space-x-[10px]">
                  <p class="font-extrabold text-core-lightest">
                    {{ shortenString(event.fields['by'] as string, 12) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-[10px] flex flex-col text-end">
              <p class="text-core-light">ON</p>
              <p class="font-extrabold text-core-lightest">
                {{ new Date(Number(event.fields['timestamp'] as bigint)).toDateString() }}
              </p>
            </div>
          </div>

          <div
            v-if="event.name == 'LoanLiquidated'"
            class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg mt-[20px]"
          >
            <div class="flex flex-row space-x-[10px]">
              <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
                <font-awesome-icon :icon="['fal', 'gavel']" class="text-core-light text-[20px]" />
              </div>
              <div class="flex flex-col text-start justify-center text-[10px]">
                <p class="text-core-light"></p>
                <div class="flex flex-row items-center space-x-[10px]">
                  <p class="font-extrabold text-core-lightest">
                    {{ shortenString(event.fields['by'] as string, 12) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-[10px] flex flex-col text-end">
              <p class="text-core-light">ON</p>
              <p class="font-extrabold text-core-lightest">
                {{ new Date(Number(event.fields['timestamp'] as bigint)).toDateString() }}
              </p>
            </div>
          </div>

          <div v-if="events.indexOf(event) !== events.length - 1" class="border-dashed border-l border-accent-3 h-[30px] ms-[30px]"></div>
        </div>

        <div v-if="canBorrow" class="flex flex-col space-y-[15px] mb-[30px]">
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You send'"
            :amount="prettifyExactAmount(loan.collateralAmount, collateralToken.decimals) ?? '0'"
            :amount_description="collateralToken.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You receive'"
            :amount="prettifyExactAmount(calculateReceivedAmount(loan), loanToken.decimals) ?? '0'"
            :amount_description="loanToken.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel :title="'P2P Fee'" :amount="convertBasisPointsToPercentage(config.fee as bigint)" />
          <HorizontalDivider />
          <LoanPreviewLabel :title="'Estimated time to create order'" :amount="'60'" :amount_description="'seconds'" />
        </div>

        <div v-if="canRepay" class="flex flex-col space-y-[15px] mb-[30px]">
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You send (loan + interest)'"
            :amount="prettifyExactAmount(loan.loanAmount, loanToken.decimals) ?? '0'"
            :amount_description="loanToken.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You receive (collateral)'"
            :amount="prettifyExactAmount(loan.collateralAmount, collateralToken.decimals) ?? '0'"
            :amount_description="collateralToken.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel :title="'Estimated time to create order'" :amount="'60'" :amount_description="'seconds'" />
        </div>

        <div v-if="canDelete" class="flex flex-col space-y-[15px] mb-[30px]">
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You receive'"
            :amount="prettifyExactAmount(loan.loanAmount, loanToken.decimals) ?? '0'"
            :amount_description="loanToken.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel :title="'Estimated time to create order'" :amount="'60'" :amount_description="'seconds'" />
        </div>

        <div class="mt-auto">
          <CustomButton
            v-if="!isActive && !isLender"
            :disabled="!account?.isConnected"
            :title="'Borrow'"
            :class="'w-full'"
            @click="borrow"
          />
          <CustomButton
            v-if="!isActive && isLender"
            :title="'Delete loan'"
            :class="'w-full'"
            @click="cancel"
            :open="true"
            :delete="true"
          />
          <CustomButton v-if="isActive && isBorrower" :title="'Repay'" :class="'w-full'" @click="repay" />
          <CustomButton
            v-if="isActive && isOverdue && isLender"
            :title="'Liquidate'"
            :class="'w-full'"
            @click="liquidate"
          />
          <p class="text-core-light text-[12px] mt-[30px] text-center">
            By using this feature, you agree to Linx Labs <a href="#" class="text-accent-3">Terms of Use</a>
          </p>
        </div>
      </div>
      <!-- Loan information -->
    </section>

    <section v-if="fetchingData" class="justify-center items-center text-center space-y-[30px]">
      <p class="text-[30px] text-core-lightest font-extrabold">Getting Loan</p>
      <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    </section>
    <section v-if="!fetchingData && !loan" class="w-full justify-center items-center text-center">
      <p class="text-[30px] text-core-lightest font-extrabold">Loan not found</p>
    </section>
  </div>
</template>
