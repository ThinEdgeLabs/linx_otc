<script setup lang="ts">
import SectionTitle from '../SectionTitle.vue'
import { useAccountStore } from '@/stores/account'
import { shortenString } from '@/functions/stringUtils'
import HorizontalDivider from '../HorizontalDivider.vue'

import { useOrderStore } from '@/stores/tradeOrder'
import LoanPreviewLabel from '../lending/LoanPreviewLabel.vue'

const accountStore = useAccountStore()
const tradeStore = useOrderStore()

function calculateResult() {
  return tradeStore.order!.amountTo * 0.993
}
</script>

<template>
  <section class="w-full flex flex-col bg-menu p-[30px] space-y-[20px] rounded-lg leading-snug">
    <SectionTitle :title="`Preview P2P Swap`" :description="'Some useles lorum ipsum'" />
    <div class="flex flex-col w-full space-y-[20px]">
      <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-between items-center rounded-lg">
        <div class="flex flex-row space-x-[10px] item-center">
          <img :src="`./images/${tradeStore.order!.tokenFrom?.symbol}.png`" class="w-[40px] h-[40px] rounded-full" />
          <div class="flex flex-col text-start justify-center">
            <p class="text-[10px] text-core-light">YOU OFFER</p>
            <div class="flex flex-row items-center space-x-[10px] text-[14px]">
              <p class="font-extrabold text-core-lightest">{{ tradeStore.order!.amountFrom }}</p>
              <p class="text-core-light">{{ tradeStore.order!.tokenFrom?.symbol }}</p>
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
      <font-awesome-icon :icon="['fal', 'arrow-up-arrow-down']" class="text-[18px] text-accent-1" />
      <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-between items-center rounded-lg">
        <div class="flex flex-row space-x-[10px] item-center">
          <img :src="`./images/${tradeStore.order!.tokenTo?.symbol}.png`" class="w-[40px] h-[40px] rounded-full" />
          <div class="flex flex-col text-start justify-center">
            <p class="text-[10px] text-core-light">YOU REQUEST</p>
            <div class="flex flex-row items-center space-x-[10px] text-[14px]">
              <p class="font-extrabold text-core-lightest">
                {{ tradeStore.order!.amountTo }}
              </p>
              <p class="text-core-light">{{ tradeStore.order!.tokenTo?.symbol }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col text-end">
          <p class="text-[10px] text-core-light">TO</p>
          <p class="text-[14px] font-extrabold text-core-lightest">
            {{ shortenString(tradeStore.order!.to!, 12) }}
          </p>
        </div>
      </div>
    </div>
    <HorizontalDivider />
    <LoanPreviewLabel :title="'P2P Fee'" :amount="'0.7'" :amount_description="'%'" />
    <HorizontalDivider />
    <LoanPreviewLabel
      :title="'You will receive'"
      :amount="calculateResult().toString()"
      :amount_description="tradeStore.order!.tokenTo?.symbol"
    />
  </section>
</template>
