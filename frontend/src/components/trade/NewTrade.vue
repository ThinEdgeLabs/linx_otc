<script setup lang="ts">
import { useAccountStore } from '@/stores/account'

import PageTitle from '@/components/PageTitle.vue'
import AddressBar from '@/components/AddressBar.vue'
import TokenBar from '@/components/TokenBar.vue'
import HorizontalDividerVue from '@/components/HorizontalDivider.vue'
import CustomButton from '@/components/CustomButton.vue'
import AgreeToTerms from '@/components/AgreeToTerms.vue'
import TradePreview from '@/components/trade/TradePreview.vue'
import ApproveTrade from '@/components/ApproveTrade.vue'
import { useLoginStore } from '@/stores/login'
import { ref } from 'vue'
import { useOrderStore } from '@/stores/tradeOrder'
import type { Status } from '../ApproveWallet.vue'
import { domainURL } from '@/config'

const account = useAccountStore()
const loginStore = useLoginStore()
const tradeStore = useOrderStore()

const status = ref<Status | undefined>(undefined)
const txId = ref<string | undefined>(undefined)
const tradeLink = ref<string | undefined>(undefined)

function reset() {
  status.value = undefined
  txId.value = undefined
  tradeStore.resetOrder()
}

async function createTrade() {
  try {
    status.value = 'approve'
    const trade = await tradeStore.createOrder()
    const unsignedTx = {
      signerAddress: tradeStore.order!.from,
      unsignedTx: trade.tx.unsignedTx
    }

    try {
      const sig = await account.signer!.signUnsignedTx(unsignedTx)
      trade.sigs.push(sig.signature)
      const encodedTx = btoa(
        JSON.stringify({
          data: tradeStore.order,
          txData: trade
        })
      )
      tradeLink.value = `${domainURL}/trading/${encodedTx}`
      status.value = 'signed'
    } catch (e) {
      console.log(e)
      status.value = 'denied'
    }
    // Create the request and open wallet
  } catch (e) {
    console.error(e)
    status.value = 'denied'
  }
}
</script>

<template>
  <section
    v-if="status === undefined"
    class="flex flex-col w-full p-[10px] lg:p-[30px] bg-core-darker rounded-lg space-y-[30px]"
  >
    <PageTitle
      :title="account.account?.isConnected ? 'Create P2P Order' : 'P2P Trade'"
      :description="'Make use of the atomic swap feature on Alephium to trade directly with someone.'"
    />
    <div class="flex flex-col lg:flex-row w-full lg:space-x-[30px] space-y-[30px] lg:space-y-0">
      <AddressBar :is-sender="true" :class="'lg:basis-1/2'" />
      <AddressBar :is-sender="false" :class="'lg:basis-1/2'" />
    </div>
    <div class="flex flex-col lg:flex-row w-full lg:space-x-[30px] space-y-[30px] lg:space-y-0">
      <TokenBar :is-sender="true" :offer-type="'trade'" :class="'lg:basis-1/2'" />
      <TokenBar :is-sender="false" :offer-type="'trade'" :class="'lg:basis-1/2'" />
    </div>
    <HorizontalDividerVue />
    <CustomButton
      :title="account.account?.isConnected ? 'Create Order' : 'Connect wallet'"
      :open="false"
      :class="'w-full lg:w-[228px]'"
      @click="account.account?.isConnected ? createTrade() : loginStore.toggleModal()"
    />
    <AgreeToTerms />
  </section>
  <section v-else class="w-full flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
    <ApproveTrade
      :status="status ?? 'approve'"
      @update:cancel="reset"
      @update:finished="reset"
      @update:retry="createTrade"
      :link="tradeLink"
    />
    <TradePreview :trade-offer="tradeStore.order!" />
  </section>
</template>
