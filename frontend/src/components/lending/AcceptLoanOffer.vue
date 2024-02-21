<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import HorizontalDivider from '../HorizontalDivider.vue'
import LoanPreviewLabel from './LoanPreviewLabel.vue'
import CustomButton from '../CustomButton.vue'
import ComponentTitle from '../ComponentTitle.vue'
import { ref } from 'vue'
import ApproveWallet from '../ApproveWallet.vue'

defineEmits<{
  (e: 'update:closeOffer'): void
}>()

const step = ref(0)

const props = defineProps({
  loan: {
    type: Object,
    required: true
  }
})

function calculateInterest() {
  return (((props.loan.interest / props.loan.loanAmount) * 100) / props.loan.duration) * 365
}
</script>

<template>
  <section class="w-full h-full flex flex-row space-x-[30px]">
    <div v-if="step === 0" class="flex flex-col bg-menu w-full p-[30px] space-y-[30px] rounded-lg">
      <div class="flex flex-col h-full justify-between">
        <div class="flex flex-col space-y-[30px]">
          <ComponentTitle
            :title="`Loan order #${props.loan.loanId}`"
            :description="`Created on ${new Date(props.loan.created).toDateString()}`"
            :status="!props.loan.borrower ? 'Open' : 'Active'"
            @update:go-back="$emit('update:closeOffer')"
          />
          <div class="flex flex-col">
            <div class="grid grid-cols-2 w-full items-center">
              <div class="flex flex-row space-x-[10px] item-center">
                <img :src="`./images/${props.loan.loanToken}.png`" class="w-[60px] h-[60px] rounded-full" />
                <div class="flex flex-col text-start justify-center">
                  <p class="text-[12px] text-core-light">LENDING</p>
                  <div class="flex flex-row items-center space-x-[10px] text-[18px]">
                    <p class="font-extrabold text-core-lightest">{{ props.loan.loanAmount }}</p>
                    <p class="text-core-light">{{ props.loan.loanToken }}</p>
                  </div>
                </div>
              </div>
              <div class="flex flex-row space-x-[10px] item-center">
                <div class="flex w-[60px] h-[60px] rounded-full bg-core-darkest items-center justify-center">
                  <font-awesome-icon :icon="['fal', 'receipt']" class="text-core-light text-[20px]" />
                </div>
                <div class="flex flex-col text-start justify-center">
                  <p class="text-[12px] text-core-light">
                    INTEREST {{ props.loan.interest }} {{ props.loan.loanToken }}
                  </p>
                  <div class="flex flex-row items-center space-x-[10px] text-[18px]">
                    <p class="font-extrabold text-core-lightest">
                      {{ calculateInterest().toFixed(2) }}
                    </p>
                    <p class="text-core-light">% APR</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="border-dashed border-r-2 border-accent-3 h-[20px] w-[30px]"></div>
            <div class="grid grid-cols-2 w-full items-center">
              <div class="flex flex-row space-x-[10px] item-center">
                <img :src="`./images/${props.loan.collateralToken}.png`" class="w-[60px] h-[60px] rounded-full" />
                <div class="flex flex-col text-start justify-center">
                  <p class="text-[12px] text-core-light">COLLATERAL</p>
                  <div class="flex flex-row items-center space-x-[10px] text-[18px]">
                    <p class="font-extrabold text-core-lightest">
                      {{ props.loan.collateralAmount }}
                    </p>
                    <p class="text-core-light">{{ props.loan.collateralToken }}</p>
                  </div>
                </div>
              </div>
              <div class="flex flex-row space-x-[10px] item-center">
                <div class="flex w-[60px] h-[60px] rounded-full bg-core-darkest items-center justify-center">
                  <font-awesome-icon :icon="['fal', 'calendar-days']" class="text-core-light text-[20px]" />
                </div>
                <div class="flex flex-col text-start justify-center">
                  <p class="text-[12px] text-core-light">DURATION</p>
                  <div class="flex flex-row items-center space-x-[10px] text-[18px]">
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
    </div>
    <ApproveWallet v-else @update:cancel="step--" @update:finished="$emit('update:closeOffer')" />
    <div class="flex flex-col bg-menu w-[40%] p-[30px] rounded-lg space-y-[30px]">
      <div class="flex flex-col">
        <p class="text-[22px] font-extrabold text-core-lightest">Loan information</p>
        <p class="text-[14px] text-core-light">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <div class="w-full bg-core-darkest p-[10px] flex flex-row justify-between items-center rounded-lg">
        <div class="flex flex-row space-x-[10px] items-center">
          <img :src="`./images/${props.loan.loanToken}.png`" class="w-[40px] h-[40px] rounded-full" />
          <div class="flex flex-col text-start justify-center">
            <p class="text-[10px] text-core-light">LENDING</p>
            <div class="flex flex-row items-center space-x-[10px] text-[14px]">
              <p class="font-extrabold text-core-lightest">{{ props.loan.loanAmount }}</p>
              <p class="text-core-light">{{ props.loan.loanToken }}</p>
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
        <LoanPreviewLabel :title="'P2P Fee'" :amount="'0.7 %'" />
        <HorizontalDivider />
        <LoanPreviewLabel
          :title="'You receive'"
          :amount="(0.993 * props.loan.loanAmount).toString()"
          :amount_description="props.loan.loanToken"
        />
        <HorizontalDivider />
        <LoanPreviewLabel :title="'Estimated time to create order'" :amount="'60'" :amount_description="'seconds'" />
      </div>
      <CustomButton :title="'Accept & Borrow now'" :class="'w-full'" @click="step++" />
      <div class="flex flex-row items-center text-center space-x-[4px] justify-center text-[12px]">
        <p class="text-core-light">By using this feature, you agree to LinxLabs</p>
        <button class="text-accent-3">Terms of Use</button>
      </div>
    </div>
  </section>
</template>
