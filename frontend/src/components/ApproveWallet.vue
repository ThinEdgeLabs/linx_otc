<script setup lang="ts">
import ProgressBar from '@/components/ProgressBar.vue'
import TransactionError from '@/components/TransactionError.vue'
import { computed } from 'vue'
import TransactionSuccess from './TransactionSuccess.vue'

defineEmits<{
  (e: 'update:cancel', value: number): void
  (f: 'update:finished'): void
  (f: 'update:retry'): void
}>()

export type Status = 'approve' | 'signed' | 'timeout' | 'denied' | 'success'

const props = defineProps<{
  status: Status,
  txId?: string
}>()

const percentageFilled = computed(() => {
  if (props.status === 'approve') {
    return 25
  } else if (props.status === 'signed') {
    return 50
  } else {
    return 100
  }
})

</script>

<template>
  <!-- <TransactionError
    v-if="status === 'timeout'"
    :description="'Did not receive a response from the wallet'"
    @update:cancel="$emit('update:cancel', 0)"
    @update:retry="retryTransaction()"
  /> -->
  <TransactionError
    v-if="status === 'denied'"
    :description="'Transaction was rejected'"
    @update:cancel="$emit('update:cancel', 0)"
    @update:retry="$emit('update:retry')"
  />
  <TransactionSuccess
    v-if="status === 'success'"
    :title="`Your transaction was confirmed`"
    :description="'Click the transaction ID to open in the explorer'"
    :tx-id="txId!"
    @update:finished="$emit('update:finished')"
  />
  <section
    v-if="status === 'approve' || status === 'signed'"
    class="flex flex-col w-full min-h-full bg-menu rounded-lg py-[30px] px-[20px] lg:px-0 lg:py-0 space-y-[30px] justify-center items-center"
  >
    <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    <div v-if="status === 'approve'">
      <div class="space-y-[10px] text-center">
        <div class="text-[22px] font-extrabold text-core-lightest">Confirm the order creation in your wallet</div>
        <div class="text-[16px]">Waiting for transaction confirmation</div>
      </div>
    </div>
    <div v-if="status === 'signed'">
      <div class="space-y-[10px] text-center">
        <div class="text-[22px] font-extrabold text-core-lightest">Received and sent signed transaction</div>
        <div class="text-[16px]">Waiting for network confirmation</div>
      </div>
    </div>
    <ProgressBar :percentage-filled="percentageFilled" />
  </section>
</template>
