<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import activityPreviewLabel from '@/components/lending/LoanPreviewLabel.vue'
import CustomButton from '@/components/CustomButton.vue'
import { ref } from 'vue'
import ApproveWallet from '@/components/ApproveWallet.vue'
import PaybackPreview from './PaybackPreview.vue'
import LiquidatePreview from './LiquidatePreview.vue'
import DeletePreview from './DeletePreview.vue'
import LendingDetails from './LendingDetails.vue'
import TradeDetails from './TradeDetails.vue'

defineEmits<{
  (e: 'update:closeActivity'): void
}>()

const step = ref(0)

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section class="w-full h-full flex flex-col lg:flex-row space-y-[30px] lg:space-y-0 lg:space-x-[30px]">
    <div v-if="step === 0" class="flex flex-col bg-menu w-full p-[10px] lg:p-[30px] space-y-[30px] rounded-lg">
      <LendingDetails
        v-if="props.activity.type === 'Loan'"
        :activity="props.activity"
        @update:close-activity="$emit('update:closeActivity')"
      />
      <TradeDetails v-else :activity="props.activity" @update:close-activity="$emit('update:closeActivity')" />
    </div>
    <ApproveWallet v-else @update:cancel="step--" @update:finished="$emit('update:closeActivity')" />
    <PaybackPreview
      v-if="$props.activity.type === 'Loan' && $props.activity.status === 'Active'"
      :activity="props.activity"
      @update:step-up="step++"
    />
    <LiquidatePreview
      v-if="$props.activity.type === 'Loan' && $props.activity.status === 'Expired'"
      :activity="$props.activity"
      @update:step-up="step++"
    />
    <DeletePreview v-if="$props.activity.status === 'Open'" :activity="$props.activity" @update:step-up="step++" />
  </section>
</template>
