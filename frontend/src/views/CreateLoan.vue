<script setup lang="ts">
import TokenBar from '../components/TokenBar.vue'
import InterestField from '../components/lending/InterestField.vue'
import CustomButton from '../components/CustomButton.vue'
import { useLoanOrderStore } from '../stores/loanOrder'
import { useAccountStore } from '../stores/account'
import WalletButton from '../components/WalletButton.vue'
import DurationSelect from '../components/lending/DurationSelect.vue'
import RatingSelect from '../components/lending/RatingSelect.vue'
import HorizontalDivider from '../components/HorizontalDivider.vue'
import ApproveWallet from '../components/ApproveWallet.vue'
import { onMounted, ref } from 'vue'
import LoanPreview from '../components/lending/LoanPreview.vue'
import ComponentTitle from '../components/ComponentTitle.vue'
import AgreeToTerms from '../components/AgreeToTerms.vue'
import { LendingMarketplaceHelper } from '../../../shared/lending-marketplace'
import { getMarketplaceConfig } from '../config'
import { waitTxConfirmed } from '@alephium/cli'
import { useNodeStore } from '../stores/node'
import type { Status } from '../components/ApproveWallet.vue'
import { convertAmountWithDecimals, type SignerProvider } from '@alephium/web3'
import { usePopUpStore } from '../stores/popup'
import router from '@/router'

const loanOfferStore = useLoanOrderStore()
const accountStore = useAccountStore()
const { nodeProvider } = useNodeStore()
const popUpStore = usePopUpStore()

const status = ref<Status | undefined>(undefined)
const txId = ref<string | undefined>(undefined)

function reset() {
  status.value = undefined
  txId.value = undefined
  loanOfferStore.reset()
}

onMounted(() => {
  loanOfferStore.reset()
})

async function createLoan() {
  if (
    loanOfferStore.order?.collateralAmount &&
    loanOfferStore.order?.collateralToken &&
    loanOfferStore.order.duration &&
    loanOfferStore.order.interest &&
    loanOfferStore.order.loanAmount &&
    loanOfferStore.order.loanToken
  ) {
    const config = getMarketplaceConfig()
    const marketplace = new LendingMarketplaceHelper(accountStore.signer as SignerProvider)
    marketplace.contractId = config.marketplaceContractId

    const lendingTokenId = loanOfferStore.order!.loanToken!.contractId
    const collateralTokenId = loanOfferStore.order!.collateralToken!.contractId
    const loanTokenDecimals = loanOfferStore.order!.loanToken!.decimals
    const collateralTokenDecimals = loanOfferStore.order!.collateralToken!.decimals
    const lendingAmount = convertAmountWithDecimals(loanOfferStore.order!.loanAmount, loanTokenDecimals)
    const collateralAmount = convertAmountWithDecimals(loanOfferStore.order!.collateralAmount, collateralTokenDecimals)
    const interest = convertAmountWithDecimals(loanOfferStore.order!.interest, loanTokenDecimals)
    const interestRate = (((interest! * 10n ** 18n) / lendingAmount!) * 10000n) / 10n ** 18n // basis points

    const duration = BigInt(loanOfferStore.order!.duration)

    try {
      status.value = 'approve'
      const result = await marketplace.createOffer(
        accountStore.signer as SignerProvider,
        lendingTokenId,
        collateralTokenId,
        lendingAmount!,
        collateralAmount!,
        interestRate,
        duration
      )
      status.value = 'signed'
      await waitTxConfirmed(nodeProvider!, result.txId, 1, 1000)
      txId.value = result.txId
      status.value = 'success'
    } catch (err) {
      console.log('err', err)
      status.value = 'denied'
    }
  } else {
    popUpStore.setPopUp({
      title: "Can't complete the loan offer",
      onAcknowledged: popUpStore.closePopUp,
      leftButtonTitle: 'OK',
      type: 'warning',
      message: createErrorMessage(),
      showTerms: false
    })
  }
}

function createErrorMessage(): Array<string> {
  const errorList = []
  if (loanOfferStore.order?.loanToken === undefined) {
    errorList.push('Please select a token to lend.')
  }
  if (!loanOfferStore.order?.loanAmount) {
    errorList.push('Please set an amount to lend.')
  }
  if (loanOfferStore.order?.collateralToken === undefined) {
    errorList.push('Please select a collateral token.')
  }
  if (!loanOfferStore.order?.collateralAmount) {
    errorList.push('Please set a collateral amount.')
  }
  if (!loanOfferStore.order?.interest) {
    errorList.push('Please set the amount of interest')
  }
  if (!loanOfferStore.order?.duration) {
    errorList.push('Please select the duration of the loan')
  }
  if (loanOfferStore.order?.borrowerRating === undefined) {
    errorList.push('Please select a minimum rating for the borrower')
  }
  return errorList
}
</script>
<template>
  <section class="w-full py-[30px]">
    <div
      v-if="!status"
      class="w-full rounded-lg bg-menu p-[10px] pt-[40px] lg:p-[30px] space-y-[30px]"
      :class="popUpStore.popUp ? 'fixed' : ''"
    >
      <ComponentTitle
        :title="'Create new loan offer'"
        :description="'Lend your tokens to other users and earn interest. You can set the accepted collateral, interest rate and the duration of the loan.'"
        @update:go-back="router.push('/lending')"
      />
      <div class="w-full flex flex-col lg:flex-row items-center space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
        <TokenBar :class="'w-full'" :is-sender="true" :offer-type="'loan'" :validate-input="true" />
        <InterestField />
      </div>
      <div class="w-full flex flex-col lg:flex-row items-center space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
        <TokenBar
          :class="'w-full'"
          :is-sender="false"
          :offer-type="'loan'"
          :validate-input="false"
          :hide-balance="true"
        />
        <div class="w-full flex flex-row space-x-[30px]">
          <DurationSelect />
          <!-- <RatingSelect /> -->
        </div>
      </div>

      <div
        class="flex flex-col space-y-[10px] text-[14px]"
        v-if="loanOfferStore.order?.duration && loanOfferStore.order.interest"
      >
        <HorizontalDivider />
        <div class="flex flex-row justify-between">
          <p class="font-semibold text-core-light">Interest % over Loan</p>
          <p class="font-extrabold text-core-lightest">
            {{ (((loanOfferStore.order?.interest ?? 0) / (loanOfferStore.order?.loanAmount ?? 0)) * 100).toFixed(2) }}
            %
          </p>
        </div>
        <HorizontalDivider />
        <div
          class="flex flex-row justify-between"
          v-if="loanOfferStore.order?.duration && loanOfferStore.order.interest"
        >
          <p class="font-semibold text-core-light">Interest % Annualised</p>
          <p class="font-extrabold text-core-lightest">
            {{
              (
                ((((loanOfferStore.order?.interest ?? 0) / (loanOfferStore.order?.loanAmount ?? 0)) * 100) /
                  (loanOfferStore.order?.duration ?? 0)) *
                365
              ).toFixed(2)
            }}
            %
          </p>
        </div>
        <HorizontalDivider />
      </div>

      <div
        class="w-full flex flex-col lg:flex-row items-center text-center lg:justify-between space-y-[20px] lg:space-y-0"
      >
        <div class="w-full flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
          <WalletButton v-if="!accountStore.account" :class="'w-full'" />
          <CustomButton v-else :title="'Continue'" @click="createLoan" :class="'w-full lg:w-[228px]'" />
          <CustomButton
            :title="'Cancel'"
            :open="true"
            :delete="true"
            @click="reset, router.push('/lending')"
            :class="'w-full lg:w-[228px]'"
          />
        </div>
        <AgreeToTerms class="w-full justify-end" />
      </div>
    </div>
    <div v-else class="w-full flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
      <ApproveWallet
        @update:cancel="reset"
        @update:finished="reset(), $router.push('/lending')"
        :status="status!"
        :tx-id="txId"
        @update:retry="createLoan"
      />
      <LoanPreview />
    </div>
  </section>
</template>
