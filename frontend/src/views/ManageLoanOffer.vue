<script setup lang="ts">
import HorizontalDivider from '../components/HorizontalDivider.vue'
import LoanPreviewLabel from '../components/lending/LoanPreviewLabel.vue'
import CustomButton from '../components/CustomButton.vue'
import ComponentTitle from '../components/ComponentTitle.vue'
import { computed, onMounted, ref } from 'vue'
import ApproveWallet, { type Status } from '../components/ApproveWallet.vue'
import { convertBasisPointsToPercentage, calculateInterest, parseBalance } from '../functions/utils'
import type { Loan, Token } from '../types'
import {
  ContractEvent,
  SignerProvider,
  addressFromContractId,
  prettifyExactAmount,
  prettifyTokenAmount,
  web3
} from '@alephium/web3'
import { getMarketplaceConfig, getTokens, undefinedToken } from '../config'
import { LendingMarketplaceHelper } from '../../../shared/lending-marketplace'
import { waitTxConfirmed } from '@alephium/cli'
import { useAccountStore, useLoanStore } from '../stores'
import { LendingOfferInstance } from '../../../artifacts/ts'
import { useRoute } from 'vue-router'
import router from '@/router'
import { storeToRefs } from 'pinia'
import LoanHistory from '@/components/lending/LoanHistory.vue'
import WalletButton from '@/components/WalletButton.vue'
import { useValidateGroup } from '@/composables/validateGroup'

const route = useRoute()
const contractId = route.params.loan as string
const returnPage = route.query.return as string
const loan = ref<Loan | undefined>(undefined)

const config = getMarketplaceConfig()
web3.setCurrentNodeProvider(config.defaultNodeUrl)

const { account, signer, nodeProvider } = storeToRefs(useAccountStore())
const loanStore = useLoanStore()
const status = ref<Status | undefined>(undefined)
const txId = ref<string | undefined>(undefined)
const events = ref<ContractEvent[]>([])

const loanStatus = computed(() => {
  const isLiquidated = events.value.find((e) => e.name === 'LoanLiquidated')
  if (isLiquidated) return 'Liquidated'
  const isPaid = events.value.find((e) => e.name === 'LoanPaid')
  if (isPaid) return 'Paid'
  const isCancelled = events.value.find((e) => e.name === 'LoanCancelled')
  if (isCancelled) return 'Cancelled'
  const isActive = events.value.find((e) => e.name === 'LoanAccepted')
  if (isActive) return 'Active'
  return 'Available'
})
const isLender = computed(() => loan.value?.lender === account.value?.address)
const isBorrower = computed(() => loan.value?.borrower && loan.value?.borrower === account.value?.address)
const isActive = computed(() => loanStatus.value === 'Active')
const isAvailable = computed(() => loanStatus.value === 'Available')
const isOverdue = computed(() => {
  if (loan.value) {
    return Number(loan.value.duration) * 24 * 60 * 60 * 1000 + loan.value.startDate! < Date.now()
  }
  return false
})
const waitingForTxConfirmation = computed(() => status.value === 'signed')
const waitingForSign = computed(() => status.value === 'approve')
const canBorrow = computed(() => loanStatus.value === 'Available' && !isLender.value)
const canRepay = computed(() => loanStatus.value === 'Active' && isBorrower.value)
const canDelete = computed(() => loanStatus.value === 'Available' && isLender.value)

const collateralToken = ref<Token | undefined>()
const loanToken = ref<Token | undefined>()

onMounted(async () => {
  try {
    const tokens = await getTokens()
    loan.value = await loanStore.getLoan(contractId)
    events.value = await loanStore.getLoanEvents(contractId, true)
    collateralToken.value = tokens.find((e) => e.contractId === loan.value?.collateralToken) ?? undefinedToken
    loanToken.value = tokens.find((e) => e.contractId === loan.value?.loanToken) ?? undefinedToken
  } catch (err) {
    console.log('err', err)
  }
})

function calculateReceivedAmount(loan: Loan) {
  return (loan.loanAmount * (10000n - (config.fee as bigint))) / 10000n
}

async function borrow() {
  if ((await useValidateGroup()) === false) {
    return
  }
  const config = getMarketplaceConfig()
  const marketplace = new LendingMarketplaceHelper(signer.value as SignerProvider)
  marketplace.contractId = config.marketplaceContractId
  try {
    status.value = 'approve'
    const result = await marketplace.takeOffer(
      signer.value as SignerProvider,
      loan.value!.contractId,
      loan.value!.collateralToken,
      loan.value!.collateralAmount
    )
    status.value = 'signed'
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await waitTxConfirmed(nodeProvider.value, result.txId, 1, 1000)
    txId.value = result.txId
    events.value = await useLoanStore().getLoanEvents(contractId, true)
    status.value = 'success'
  } catch (err) {
    console.log('err', err)
    status.value = 'denied'
  }
}

async function cancel() {
  const config = getMarketplaceConfig()
  const marketplace = new LendingMarketplaceHelper(signer.value as SignerProvider)
  marketplace.contractId = config.marketplaceContractId
  try {
    status.value = 'approve'
    const result = await marketplace.cancelOffer(signer.value as SignerProvider, loan.value!.contractId)
    status.value = 'signed'
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await waitTxConfirmed(nodeProvider.value, result.txId, 1, 1000)
    txId.value = result.txId
    events.value = await useLoanStore().getLoanEvents(contractId, true)
    status.value = 'success'
  } catch (err) {
    console.log('err', err)
    status.value = 'denied'
  }
}

async function repay() {
  const config = getMarketplaceConfig()
  const marketplace = new LendingMarketplaceHelper(signer.value as SignerProvider)
  marketplace.contractId = config.marketplaceContractId
  const instance = new LendingOfferInstance(addressFromContractId(contractId))
  const interest = (await instance.methods.getInterest()).returns
  try {
    status.value = 'approve'
    const result = await marketplace.repayLoan(
      signer.value as SignerProvider,
      loan.value!.contractId,
      loan.value!.loanToken,
      loan.value!.loanAmount + interest
    )
    status.value = 'signed'
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await waitTxConfirmed(nodeProvider.value, result.txId, 1, 1000)
    txId.value = result.txId
    events.value = await useLoanStore().getLoanEvents(contractId, true)
    status.value = 'success'
  } catch (err) {
    console.log('err', err)
    status.value = 'denied'
  }
}

async function liquidate() {
  const config = getMarketplaceConfig()
  const marketplace = new LendingMarketplaceHelper(signer.value as SignerProvider)
  marketplace.contractId = config.marketplaceContractId
  try {
    status.value = 'approve'
    const result = await marketplace.liquidateLoan(signer.value as SignerProvider, loan.value!.contractId)
    status.value = 'signed'
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await waitTxConfirmed(nodeProvider.value, result.txId, 1, 1000)
    txId.value = result.txId
    events.value = await useLoanStore().getLoanEvents(contractId, true)
    status.value = 'success'
  } catch (err) {
    console.log('err', err)
    status.value = 'denied'
  }
}

function reset() {
  status.value = undefined
  txId.value = undefined
}
</script>

<template>
  <div v-if="collateralToken && loanToken" class="w-full py-[30px]">
    <section
      v-if="loan"
      class="w-full h-full flex flex-col lg:flex-row space-y-[30px] lg:space-y-0 lg:space-x-[30px] leading-snug"
    >
      <div
        v-if="!status"
        class="flex flex-col bg-menu w-full px-[10px] py-[30px] lg:px-[30px] space-y-[30px] rounded-lg"
      >
        <div class="flex flex-col h-full justify-between">
          <div class="flex flex-col space-y-[30px]">
            <ComponentTitle
              :title="`Loan #${loan.id}`"
              :description="`Created on ${new Date(loan.created).toDateString()}`"
              :status="loanStatus"
              @update:go-back="returnPage ? router.push(`/${returnPage}`) : router.push('/lending')"
            />
            <div class="flex flex-col">
              <div class="grid grid-cols-2 w-full items-center">
                <div class="flex flex-row space-x-[10px] item-center">
                  <img :src="`${loanToken!.logoUri}`" class="w-[60px] h-[60px] rounded-full" />
                  <div class="flex flex-col text-start justify-center">
                    <p class="text-[10px] lg:text-[12px] text-core-light">LENDING</p>
                    <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                      <p class="font-extrabold text-core-lightest">
                        {{ prettifyTokenAmount(loan.loanAmount, loanToken!.decimals) }}
                      </p>
                      <p class="text-core-light">{{ loanToken!.symbol }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex flex-row space-x-[10px] item-center">
                  <div class="flex w-[60px] h-[60px] rounded-full bg-core-darkest items-center justify-center">
                    <font-awesome-icon :icon="['fal', 'receipt']" class="text-core-light text-[20px]" />
                  </div>
                  <div class="flex flex-col text-start justify-center">
                    <p class="text-[10px] lg:text-[12px] text-core-light">INTEREST</p>
                    <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                      <p class="font-extrabold text-core-lightest">
                        {{ calculateInterest(loan.interest, loan.loanAmount, loanToken!.decimals) }}
                      </p>
                      <p class="text-core-light">{{ loanToken!.symbol }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="border-dashed border-r border-accent-3 h-[20px] w-[30px]"></div>
              <div class="grid grid-cols-2 w-full items-center">
                <div class="flex flex-row space-x-[10px] item-center">
                  <img :src="`${collateralToken!.logoUri}`" class="w-[60px] h-[60px] rounded-full" />
                  <div class="flex flex-col text-start justify-center">
                    <p class="text-[10px] lg:text-[12px] text-core-light">COLLATERAL</p>
                    <div class="flex flex-row items-center space-x-[10px] text-[14px] lg:text-[18px]">
                      <p class="font-extrabold text-core-lightest">
                        {{ prettifyTokenAmount(loan.collateralAmount, collateralToken!.decimals) }}
                      </p>
                      <p class="text-core-light">{{ collateralToken!.symbol }}</p>
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
                          {{ loanStore.getDueDate(loan) }}
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
        <div class="flex flex-col w-full border border-dashed border-accent-3 p-[15px] rounded-lg">
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
        @update:finished="router.push('/lending')"
        :status="status"
        :tx-id="txId"
      />

      <!-- Loan information -->
      <div
        class="flex flex-col bg-menu w-full lg:w-[40%] px-[10px] py-[30px] lg:px-[30px] rounded-lg lg:min-h-[500px] justify-items-stretch"
      >
        <div class="flex flex-col">
          <p class="text-[22px] font-extrabold text-core-lightest">Details</p>
          <!-- <p class="text-[14px] text-core-light">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> -->
        </div>

        <LoanHistory :events="events" :loan="loan" />

        <div v-if="canBorrow && !waitingForTxConfirmation" class="flex flex-col space-y-[15px] mb-[30px]">
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You send'"
            :amount="prettifyExactAmount(loan.collateralAmount, collateralToken!.decimals) ?? '0'"
            :amount_description="collateralToken!.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You receive'"
            :amount="prettifyExactAmount(calculateReceivedAmount(loan), loanToken!.decimals) ?? '0'"
            :amount_description="loanToken!.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel :title="'P2P Fee'" :amount="convertBasisPointsToPercentage(config.fee as bigint)" />
          <HorizontalDivider />
          <LoanPreviewLabel :title="'Estimated time'" :amount="'16'" :amount_description="'seconds'" />
        </div>

        <div v-if="canRepay && !waitingForTxConfirmation" class="flex flex-col space-y-[15px] mb-[30px]">
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You send (loan + interest)'"
            :amount="`${
              parseBalance(Number(loan.loanAmount), loanToken!.decimals)! +
                calculateInterest(loan.interest, loan.loanAmount, loanToken!.decimals) ?? '0'
            }`"
            :amount_description="loanToken!.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You receive (collateral)'"
            :amount="prettifyExactAmount(loan.collateralAmount, collateralToken!.decimals) ?? '0'"
            :amount_description="collateralToken!.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel :title="'Estimated time'" :amount="'16'" :amount_description="'seconds'" />
        </div>

        <div v-if="canDelete && !waitingForTxConfirmation" class="flex flex-col space-y-[15px] mb-[30px]">
          <HorizontalDivider />
          <LoanPreviewLabel
            :title="'You receive'"
            :amount="prettifyExactAmount(loan.loanAmount, loanToken!.decimals) ?? '0'"
            :amount_description="loanToken!.symbol"
          />
          <HorizontalDivider />
          <LoanPreviewLabel :title="'Estimated time'" :amount="'16'" :amount_description="'seconds'" />
        </div>

        <WalletButton v-if="!account?.isConnected" />
        <div
          v-if="account?.isConnected && !waitingForTxConfirmation"
          class="lg:mt-auto mt-[20px] flex flex-col flex-wrap content-center"
        >
          <CustomButton
            v-if="isAvailable && !isLender"
            :disabled="waitingForSign"
            :title="'Borrow'"
            :class="'w-full'"
            @click="borrow"
          />
          <CustomButton
            v-if="isAvailable && isLender"
            :title="'Delete loan'"
            :class="'w-full'"
            @click="cancel"
            :open="true"
            :delete="true"
            :disabled="waitingForSign"
          />
          <CustomButton
            v-if="isActive && isBorrower"
            :title="'Repay'"
            :class="'w-full'"
            @click="repay"
            :disabled="waitingForSign"
          />
          <CustomButton
            v-if="isActive && isOverdue && isLender"
            :title="'Liquidate'"
            :class="'w-full'"
            @click="liquidate"
            :disabled="waitingForSign"
          />
          <p class="text-core-light text-[12px] mt-[30px] text-center">
            By using this feature, you agree to Linx Labs <a href="#" class="text-accent-3">Terms of Use</a>
          </p>
        </div>
      </div>
    </section>

    <section v-if="loanStore.isLoading" class="justify-center items-center text-center space-y-[30px]">
      <p class="text-[30px] text-core-lightest font-extrabold">Loading...</p>
      <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    </section>
    <section v-if="!loanStore.isLoading && !loan" class="w-full justify-center items-center text-center">
      <p class="text-[30px] text-core-lightest font-extrabold">Loan not found</p>
    </section>
  </div>
</template>
