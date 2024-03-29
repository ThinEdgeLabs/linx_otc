<script setup lang="ts">
import type { Status } from '@/components/ApproveWallet.vue'
import PageTitle from '@/components/PageTitle.vue'
import TransactionError from '@/components/TransactionError.vue'
import ReviewTrade from '@/components/trade/ReviewTrade.vue'
import router from '@/router'
import type { Order } from '@/stores/tradeOrder'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import ApproveWallet from '@/components/ApproveWallet.vue'
import TradePreview from '@/components/trade/TradePreview.vue'
import { useAccountStore } from '@/stores/account'
import { waitTxConfirmed } from '@alephium/cli'
import { fetchLink } from '@/functions/utils'

interface TradeData {
  data: Order
  tx: {
    fromGroup: number
    gasAmount: number
    gasPrice: string
    toGroup: number
    txId: string
    unsignedTx: string
  }
  sigs: Array<String>
}

const account = useAccountStore()

const route = useRoute()
const status = ref<Status | undefined>(undefined)
const txId = ref<string | undefined>(undefined)
const order = ref<Order | undefined>(undefined)
const tradeData = ref<TradeData | undefined>(undefined)
const fetchingData = ref<boolean>(true)

const trade = route.params.trade

async function signAndSend() {
  status.value = 'approve'
  const tx = {
    signerAddress: order.value!.to!,
    unsignedTx: tradeData.value!.tx.unsignedTx
  }
  try {
    const sig = await account.signer!.signUnsignedTx(tx!)
    if (tradeData.value!.sigs.length != 3) {
      tradeData.value!.sigs.push(sig.signature)
    }

    const result = await account.signer!.nodeProvider?.multisig.postMultisigSubmit({
      unsignedTx: tradeData.value!.tx.unsignedTx,
      signatures: tradeData.value!.sigs as Array<string>
    })
    status.value = 'signed'
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await waitTxConfirmed(account.nodeProvider, result!.txId, 1, 5000)
    txId.value = result!.txId
    status.value = 'success'
  } catch (error) {
    console.log(error)
    status.value = 'denied'
    alert(error)
  }
}

async function fetchData() {
  if (fetchingData.value) {
    try {
      const encodedTrade = await fetchLink(trade as string)
      const parsedTrade = JSON.parse(atob(encodedTrade))
      order.value = parsedTrade.data
      tradeData.value = parsedTrade
    } catch (error) {
      console.log('error', error)
    }
  }

  fetchingData.value = false
}
</script>

<template>
  <section v-bind="fetchData()" class="flex flex-col w-full space-y-[40px] pt-[30px] leading-snug">
    <PageTitle
      :title="'Confirm P2P Order'"
      :description="'Check the trade offer you have received and confirm or reject the offer to continue.'"
    />
    <ReviewTrade
      v-if="order && !status"
      :trade-offer="order"
      @update:cancel="router.push('/')"
      @update:approve="signAndSend"
    />
    <TransactionError
      v-if="!order && !status && !fetchingData"
      @update:cancel="router.push('/')"
      :only-show-back="true"
      :description="'Could not decode the P2P Swap order, please check the URL with the sender of the link.'"
    />
    <section
      v-if="status && order"
      class="w-full flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 lg:space-x-[30px]"
    >
      <ApproveWallet
        :status="status"
        @update:retry="signAndSend"
        @update:cancel="router.push('/')"
        @update:finished="router.push('/')"
        :tx-id="txId"
      />
      <TradePreview :trade-offer="order" />
    </section>
    <section v-if="fetchingData" class="justify-center items-center text-center space-y-[30px]">
      <p class="text-[30px] text-core-lightest font-extrabold">Decoding the transaction</p>
      <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    </section>
  </section>
</template>
