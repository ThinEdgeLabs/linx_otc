<script setup lang="ts">
import PreviewTitle from './preview/PreviewTitle.vue'
import LiquidateBanner from './preview/LiquidateBanner.vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import LoanPreviewLabel from '@/components/lending/LoanPreviewLabel.vue'
import CustomButton from '@/components/CustomButton.vue'

defineEmits<{
  (e: 'update:stepUp'): void
}>()

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col bg-menu w-full lg:w-[40%] p-[10px] lg:p-[30px] rounded-lg space-y-[30px]">
    <PreviewTitle
      :title="'Liquidate Loan'"
      :description="`Your loan has expired. This mean you have lost your loan + interest, but can claim the collateral. The borrower's rating has been reset to 0 stars for letting the loan expire.`"
    />
    <LiquidateBanner
      :amount="$props.activity.requestAmount"
      :token="$props.activity.requestToken"
      :address="$props.activity.counterParty"
    />

    <div class="flex flex-col space-y-[15px]">
      <HorizontalDivider />
      <LoanPreviewLabel :title="'P2P Fee'" :amount="'FREE'" />
      <HorizontalDivider />
      <LoanPreviewLabel
        :title="'Total Claim'"
        :amount="props.activity.requestAmount"
        :amount_description="props.activity.requestToken"
      />
      <HorizontalDivider />
      <LoanPreviewLabel :title="'Estimated time to create order'" :amount="'16'" :amount_description="'seconds'" />
    </div>
    <CustomButton
      :title="
        props.activity.status === 'Active'
          ? 'Confirm Payback'
          : props.activity.status === 'Open'
            ? 'Delete'
            : 'Claim Collateral'
      "
      :class="'w-full'"
      @click="$emit('update:stepUp')"
    />
    <div class="flex flex-row items-center text-center space-x-[4px] justify-center text-[12px]">
      <p class="text-core-light">By using this feature, you agree to Linx Labs</p>
      <button class="text-accent-3">Terms of Use</button>
    </div>
  </div>
</template>
