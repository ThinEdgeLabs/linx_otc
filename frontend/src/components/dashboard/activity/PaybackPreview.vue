<script setup lang="ts">
import PreviewTitle from './preview/PreviewTitle.vue'
import PaybackBanner from './preview/PaybackBanner.vue'
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

function calculateInterest() {
  const minDuration = 0.5 * props.activity.duration
  if (props.activity.remaining > minDuration) {
    return 0.5 * props.activity.interest
  } else {
    return ((props.activity.duration - props.activity.remaining) / props.activity.duration) * props.activity.interest
  }
}
</script>

<template>
  <div class="flex flex-col bg-menu w-full lg:w-[40%] p-[30px] rounded-lg space-y-[30px]">
    <PreviewTitle
      :title="'Payback Loan'"
      :description="`You have ${props.activity.remaining} days to payback the loan. The interest is calculated per day, the sooner paid back the less interest you owe.`"
    />
    <PaybackBanner
      :amount="$props.activity.offerAmount"
      :token="$props.activity.offerToken"
      :address="$props.activity.counterParty"
    />

    <div class="flex flex-col space-y-[15px]">
      <HorizontalDivider />
      <LoanPreviewLabel
        :title="'Interest Due'"
        :amount="calculateInterest().toString()"
        :amount_description="$props.activity.offerToken"
      />
      <HorizontalDivider />
      <LoanPreviewLabel
        :title="'Total Payback'"
        :amount="(props.activity.offerAmount + calculateInterest()).toString()"
        :amount_description="props.activity.offerToken"
      />
      <HorizontalDivider />
      <LoanPreviewLabel :title="'Estimated time to create order'" :amount="'60'" :amount_description="'seconds'" />
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
      <p class="text-core-light">By using this feature, you agree to LinxLabs</p>
      <button class="text-accent-3">Terms of Use</button>
    </div>
  </div>
</template>
