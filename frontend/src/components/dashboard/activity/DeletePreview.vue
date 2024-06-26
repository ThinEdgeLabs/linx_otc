<script setup lang="ts">
import PreviewTitle from './preview/PreviewTitle.vue'
import OpenOfferBanner from './preview/OpenOfferBanner.vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import LoanPreviewLabel from '@/components/lending/LoanPreviewLabel.vue'
import CustomButton from '@/components/CustomButton.vue'
import { usePopUpStore } from '@/stores/popup'

const emits = defineEmits<{
  (e: 'update:stepUp'): void
}>()

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const popUpStore = usePopUpStore()

function showWarningPopUp() {
  popUpStore.setPopUp({
    title: `You are about to delete ${props.activity.type} offer #${props.activity.id}`,
    type: 'warning',
    message: ['\bThis action cannot be undone. The offer will be permanently deleted.'],
    onAcknowledged: agreeDelete,
    onCancel: popUpStore.closePopUp,
    showTerms: false,
    leftButtonTitle: 'Yes, Delete this',
    rightButtonTitle: 'Cancel',
    showIcon: true
  })
}

function agreeDelete() {
  popUpStore.closePopUp()
  emits('update:stepUp')
}
</script>

<template>
  <div class="flex flex-col bg-menu w-full lg:w-[40%] p-[10px] lg:p-[30px] rounded-lg space-y-[30px]">
    <PreviewTitle
      :title="`Delete ${props.activity.type} Offer #${props.activity.id}`"
      :description="`As long as your offer has not been accepted you can delete the offer.`"
    />
    <OpenOfferBanner :activity="props.activity" />

    <div class="flex flex-col space-y-[15px]">
      <HorizontalDivider />
      <LoanPreviewLabel :title="'P2P Fee'" :amount="'FREE'" />
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
      :open="true"
      :delete="true"
      @click="showWarningPopUp()"
    />
    <div class="flex flex-row items-center text-center space-x-[4px] justify-center text-[12px]">
      <p class="text-core-light">By using this feature, you agree to Linx Labs</p>
      <button class="text-accent-3">Terms of Use</button>
    </div>
  </div>
</template>
