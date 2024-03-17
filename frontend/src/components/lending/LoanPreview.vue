<script setup lang="ts">
import { useLoanOrderStore } from '@/stores/loanOrder'
import SectionTitle from '../SectionTitle.vue'
import { useAccountStore } from '@/stores/account'
import { shortenString } from '@/functions/stringUtils'
import HorizontalDivider from '../HorizontalDivider.vue'
import LoanPreviewLabel from './LoanPreviewLabel.vue'
import { getTokens } from '@/config'

const loanOrder = useLoanOrderStore()
const accountStore = useAccountStore()

function getAnnualisedInterest() {
  return (loanOrder.order!.interest / loanOrder.order!.loanAmount / loanOrder.order!.duration) * 365
}

const collateralToken = getTokens().find((e) => e.contractId === loanOrder.order?.collateralToken?.contractId) ?? {
  symbol: 'unknown',
  name: 'unknown',
  decimals: 18,
  logoUri: '/images/tokens/nologo.png'
}
const loanToken = getTokens().find((e) => e.contractId === loanOrder.order?.loanToken?.contractId) ?? {
  symbol: 'unknown',
  name: 'unknown',
  decimals: 18,
  logoUri: '/images/tokens/nologo.png'
}

</script>

<template>
  <section class="w-full flex flex-col bg-menu p-[30px] space-y-[20px] rounded-lg">
    <SectionTitle :title="`Preview loan order`" :description="'Some useles lorum ipsum'" />
    <div class="flex flex-col w-full">
      <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-between items-center">
        <div class="flex flex-row space-x-[10px] item-center">
          <img
            :src="`${loanToken.logoUri}`"
            class="w-[40px] h-[40px] rounded-full"
          />
          <div class="flex flex-col text-start justify-center">
            <p class="text-[10px] text-core-light">LENDING</p>
            <div class="flex flex-row items-center space-x-[10px] text-[14px]">
              <p class="font-extrabold text-core-lightest">{{ loanOrder.order!.loanAmount }}</p>
              <p class="text-core-light">{{ loanOrder.order!.loanToken?.symbol }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col text-end">
          <p class="text-[10px] text-core-light">FROM</p>
          <p class="text-[14px] font-extrabold text-core-lightest">
            {{ shortenString(accountStore.account!.address, 12) }}
          </p>
        </div>
      </div>
      <div class="border-dashed border-r-2 border-accent-3 h-[20px] w-[30px]"></div>
      <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-start items-center">
        <div class="flex flex-row space-x-[10px] item-center">
          <img
            :src="`${collateralToken.logoUri}`"
            class="w-[40px] h-[40px] rounded-full"
          />
          <div class="flex flex-col text-start justify-center">
            <p class="text-[10px] text-core-light">COLLATERAL</p>
            <div class="flex flex-row items-center space-x-[10px] text-[14px]">
              <p class="font-extrabold text-core-lightest">
                {{ loanOrder.order!.collateralAmount }}
              </p>
              <p class="text-core-light">{{ loanOrder.order!.collateralToken?.symbol }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <HorizontalDivider />
    <LoanPreviewLabel
      :title="'Loan Duration'"
      :amount="loanOrder.order!.duration.toString()"
      :amount_description="'DAYS'"
    />
    <HorizontalDivider />
    <LoanPreviewLabel
      :title="'Interest'"
      :amount="loanOrder.order!.interest.toString()"
      :amount_description="loanOrder.order!.loanToken?.symbol"
    />
    <HorizontalDivider />
    <LoanPreviewLabel
      :title="'Annualised Interest'"
      :amount="getAnnualisedInterest().toFixed(2)"
      :amount_description="'% APR'"
    />
    <HorizontalDivider />
    <LoanPreviewLabel :title="'P2P Fee'" :amount="'FREE'" />
    <HorizontalDivider />
    <LoanPreviewLabel :title="'Estimated time to create order'" :amount="'60'" :amount_description="'SEC'" />
    <HorizontalDivider />
    <LoanPreviewLabel
      :title="'Minumum Rating Borrower'"
      :amount="loanOrder.order!.borrowerRating.toString()"
      :amount_description="'STARS'"
    />
    <HorizontalDivider />
  </section>
</template>
