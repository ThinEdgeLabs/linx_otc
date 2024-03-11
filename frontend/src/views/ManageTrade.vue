<script setup lang="ts">
import type { Status } from '@/components/ApproveWallet.vue'
import PageTitle from '@/components/PageTitle.vue'
import TransactionError from '@/components/TransactionError.vue'
import ReviewTrade from '@/components/trade/ReviewTrade.vue'
import router from '@/router'
import { useNodeStore } from '@/stores/node'
import type { Order } from '@/stores/tradeOrder'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const status = ref<Status | undefined>(undefined)
const node = useNodeStore()
const order = ref<Order | undefined>(undefined)

const trade = route.params.trade

try {
  const tradeData = atob(trade as string)
  const parsedTrade = JSON.parse(tradeData)
  order.value = parsedTrade.data
} catch (error) {
  console.log('error', error)
}
</script>

<template>
  <section class="flex flex-col w-full space-y-[40px] pt-[30px] leading-snug">
    <PageTitle
      :title="'Confirm P2P Order'"
      :description="'Check the trade offer you have received and confirm or reject the offer to continue.'"
    />
    <ReviewTrade v-if="order" :trade-offer="order" />
    <TransactionError
      v-else
      @update:cancel="router.push('/')"
      :only-show-back="true"
      :description="'Could not decode the P2P Swap order, please check the URL with the sender of the link.'"
    />
  </section>
</template>
