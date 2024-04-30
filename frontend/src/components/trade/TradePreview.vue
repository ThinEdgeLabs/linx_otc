<script setup lang="ts">
import { tradeFee } from '@/config'
import SectionTitle from '../SectionTitle.vue'
import { useAccountStore } from '@/stores/account'
import { shortenString } from '@/functions/stringUtils'
import HorizontalDivider from '../HorizontalDivider.vue'
import LoanPreviewLabel from '../lending/LoanPreviewLabel.vue'

const accountStore = useAccountStore()

const props = defineProps({
  tradeOffer: { type: Object, required: true }
})

const isSender = props.tradeOffer.from === accountStore.account?.address

function calculateResult() {
  return (isSender ? props.tradeOffer.amountTo : props.tradeOffer.amountFrom) * (1 - tradeFee)
}
</script>

<template>
  <section class="w-full flex flex-col bg-menu px-[10px] py-[30px] lg:p-[30px] space-y-[20px] rounded-lg leading-snug">
    <SectionTitle :title="`Preview P2P Swap`" :description="''" />
    <div class="flex flex-col w-full space-y-[20px]">
      <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-between items-center rounded-lg">
        <div class="flex flex-row space-x-[10px] item-center">
          <img :src="props.tradeOffer.tokenFrom?.logoUri" class="w-[40px] h-[40px] rounded-full" />
          <div class="flex flex-col text-start justify-center">
            <p class="text-[10px] text-core-light">
              {{ isSender ? 'YOU OFFER' : 'YOU REQUEST' }}
            </p>
            <div class="flex flex-row items-center space-x-[10px] text-[14px]">
              <p class="font-extrabold text-core-lightest">{{ props.tradeOffer.amountFrom }}</p>
              <p class="text-core-light">{{ props.tradeOffer.tokenFrom?.symbol }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col text-end">
          <p class="text-[10px] text-core-light">FROM</p>
          <p class="text-[14px] font-extrabold text-core-lightest">
            {{ shortenString(props.tradeOffer.from, 12) }}
          </p>
        </div>
      </div>
      <font-awesome-icon :icon="['fal', 'arrow-up-arrow-down']" class="text-[18px] text-accent-1" />
      <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-between items-center rounded-lg">
        <div class="flex flex-row space-x-[10px] item-center">
          <img :src="props.tradeOffer.tokenTo?.logoUri" class="w-[40px] h-[40px] rounded-full" />
          <div class="flex flex-col text-start justify-center">
            <p class="text-[10px] text-core-light">
              {{ !isSender ? 'YOU OFFER' : 'YOU REQUEST' }}
            </p>
            <div class="flex flex-row items-center space-x-[10px] text-[14px]">
              <p class="font-extrabold text-core-lightest">
                {{ props.tradeOffer!.amountTo }}
              </p>
              <p class="text-core-light">{{ props.tradeOffer.tokenTo?.symbol }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col text-end">
          <p class="text-[10px] text-core-light">TO</p>
          <p class="text-[14px] font-extrabold text-core-lightest">
            {{ shortenString(props.tradeOffer.to, 12) }}
          </p>
        </div>
      </div>
    </div>
    <HorizontalDivider />
    <LoanPreviewLabel :title="'P2P Fee'" :amount="(tradeFee * 100).toFixed(2)" :amount_description="'%'" />
    <HorizontalDivider />
    <LoanPreviewLabel
      :title="'You will receive'"
      :amount="calculateResult().toString()"
      :amount_description="isSender ? props.tradeOffer.tokenTo.symbol : props.tradeOffer.tokenFrom.symbol"
    />
  </section>
</template>
