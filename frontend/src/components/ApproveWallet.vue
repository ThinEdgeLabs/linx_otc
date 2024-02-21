<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import TransactionError from '@/components/TransactionError.vue'
import { ref, onMounted } from 'vue'
import TransactionSuccess from './TransactionSuccess.vue'

defineEmits<{
  (e: 'update:cancel', value: number): void
  (f: 'update:finished'): void
}>()

onMounted(() => startTimer())

const status = ref('approve')
const timer = ref(5)
const order = ref(0)

async function startTimer() {
  while (timer.value > 0) {
    //TODO: Set timeout to 60 seconds once everything is ready
    await new Promise((resolve) => setTimeout(resolve, 1000))
    timer.value--
  }
  if (status.value === 'approve') {
    status.value = 'timeout'
  }
}

function retryTransaction() {
  timer.value = 5
  status.value = 'success'
  order.value = 3565
  startTimer()
}
</script>

<template>
  <TransactionError
    v-if="status === 'timeout'"
    :description="'Did not receive a response from the wallet'"
    @update:cancel="$emit('update:cancel', 0)"
    @update:retry="retryTransaction()"
  />
  <TransactionError
    v-if="status === 'denied'"
    :description="'User did not sign the transaction'"
    @update:cancel="$emit('update:cancel', 0)"
    @update:retry="retryTransaction()"
  />
  <TransactionSuccess
    v-if="status === 'success'"
    :title="`Your order #${order} was created succesfully`"
    :description="'Click the transaction ID to open in the explorer'"
    :tx-id="'23nd832bndi2902j3ndklwdn329023ndo'"
    @update:finished="$emit('update:finished')"
  />
  <section
    v-if="status === 'approve' || status === 'signed'"
    class="flex flex-col w-full min-h-full bg-menu rounded-lg space-y-[30px] justify-center items-center"
  >
    <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    <div v-if="status === 'approve'">
      <div class="space-y-[10px] text-center">
        <div class="text-[22px] font-extrabold text-core-lightest">
          Confirm the order creation in your wallet
        </div>
        <div class="text-[16px]">Waiting for transaction confirmation</div>
      </div>
    </div>
    <div v-if="status === 'signed'">
      <div class="space-y-[10px] text-center">
        <div class="text-[22px] font-extrabold text-core-lightest">
          Received and sent signed transaction
        </div>
        <div class="text-[16px]">Waiting for network confirmation</div>
      </div>
    </div>

    <ProgressBar :percentage-filled="20" />
    <CustomButton
      :open="true"
      :title="'Cancel'"
      @click="$emit('update:cancel', 0)"
      :class="'border-0 bg-core-darkest text-core-lightest'"
    />
  </section>
</template>
