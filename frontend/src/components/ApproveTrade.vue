<script setup lang="ts">
import ProgressBar from '@/components/ProgressBar.vue'
import TransactionError from '@/components/TransactionError.vue'
import { computed } from 'vue'
import TransactionSuccess from './TransactionSuccess.vue'
import type { Status } from './ApproveWallet.vue'
import { shortenString } from '@/functions/stringUtils'
import CustomButton from './CustomButton.vue'
import { copyToClipboard } from '@/functions/utils'

defineEmits<{
  (e: 'update:cancel', value: number): void
  (f: 'update:finished'): void
  (f: 'update:retry'): void
}>()

const props = defineProps<{
  status: Status
  txId?: string
  link?: string
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
    v-if="status === 'approve'"
    class="flex flex-col w-full min-h-full bg-menu rounded-lg py-[30px] px-[20px] lg:px-0 lg:py-0 space-y-[30px] justify-center items-center"
  >
    <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    <div v-if="status === 'approve'">
      <div class="space-y-[10px] text-center">
        <div class="text-[22px] font-extrabold text-core-lightest">Confirm the order creation in your wallet</div>
        <div class="text-[16px]">Waiting for transaction confirmation</div>
      </div>
    </div>
    <ProgressBar :percentage-filled="percentageFilled" />
  </section>
  <section
    v-if="status === 'signed'"
    class="flex flex-col w-full min-h-full bg-menu rounded-lg py-[30px] px-[20px] lg:py-0 space-y-[30px] justify-center items-center text-center"
  >
    <div class="flex items-center justify-center rounded-full w-[60px] h-[60px] bg-ok">
      <font-awesome-icon :icon="['fal', 'check']" class="text-core-lightest text-[27px]" />
    </div>
    <p class="text-core-lightest font-extrabold text-[22px]">Your order was created and signed successfully</p>
    <p class="text-core-light text-[16px]">
      Please copy and share the link underneath with the counterparty so they can sign and submit the transaction.
    </p>
    <div
      @click="copyToClipboard(props.link!)"
      class="flex w-[80%] bg-core-lightest rounded-lg py-[20px] text-center items-center justify-center text-[14px] font-extrabold text-core-darkest"
    >
      {{ shortenString(props.link!, 48) }}
    </div>
    <div
      class="flex flex-col lg:flex-row items-center lg:justify-between space-y-[30px] lg:space-y-0 space-x-0 lg:space-x-[30px]"
    >
      <CustomButton :title="'Copy link'" :icon="'copy'" @click="copyToClipboard(props.link!)" />
      <CustomButton :title="'Close'" :open="true" @click="$emit('update:finished')" />
    </div>
  </section>
</template>
