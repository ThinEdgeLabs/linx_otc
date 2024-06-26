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
import { useGasPayer } from '@/config'
import { usePopUpStore } from '@/stores/popup'
import { useGasPayerStore } from '@/stores/gasPayer'
import { registerLink } from '@/functions/utils'

const account = useAccountStore()
const loginStore = useLoginStore()
const tradeStore = useOrderStore()
const popUpStore = usePopUpStore()

const status = ref<Status | undefined>(undefined)
const txId = ref<string | undefined>(undefined)
const tradeLink = ref<string | undefined>(undefined)

function reset() {
  status.value = undefined
  txId.value = undefined
  tradeStore.resetOrder()
}

async function createTrade() {
  if (
    tradeStore.order?.amountFrom &&
    tradeStore.order.amountTo &&
    tradeStore.order.to &&
    tradeStore.order.tokenFrom &&
    tradeStore.order.tokenTo &&
    tradeStore.order.toPubKey
  ) {
    try {
      status.value = 'approve'
      const trade = await tradeStore.createOrder(useGasPayer)
      const unsignedTx = {
        signerAddress: tradeStore.order!.from,
        unsignedTx: trade.unsignedTx
      }
      const gasPayerStore = useGasPayerStore()
      const gasSig = await gasPayerStore.gasPayer?.signUnsignedTx({
        unsignedTx: trade.unsignedTx,
        signerAddress: gasPayerStore.gasPayer.account!.address
      })
      try {
        const sig = await account.signer!.signUnsignedTx(unsignedTx)
        const encodedTx = btoa(
          JSON.stringify({
            data: tradeStore.order,
            tx: trade,
            sigs: useGasPayer ? [gasSig!.signature, sig.signature] : [sig.signature]
          })
        )
        //const hash = hashLink(encodedTx)
        //instead of hashing the data, use txid
        const hash = trade.txId
        const sendLink = await registerLink(hash, encodedTx)
        if (sendLink) {
          tradeLink.value = `${location.host}/trading/${hash}`
          status.value = 'signed'
        } else {
          throw Error('Could not register transaction')
        }
      } catch (e) {
        console.log(e)
        status.value = 'denied'
      }
      // Create the request and open wallet
    } catch (e) {
      console.error('error', e)
      popUpStore.setPopUp({
        title: 'Oops, something went wrong!',
        onAcknowledged: popUpStore.closePopUp,
        leftButtonTitle: 'OK',
        type: 'warning',
        message: apiErrorHandler(e as string),
        showTerms: false,
        showIcon: true
      })
      status.value = 'denied'
    }
  } else {
    popUpStore.setPopUp({
      title: "Can't complete the trade offer",
      onAcknowledged: popUpStore.closePopUp,
      leftButtonTitle: 'OK',
      type: 'warning',
      message: createErrorMessage(),
      showTerms: false,
      showIcon: true
    })
  }
}

function apiErrorHandler(error: string): Array<string> {
  if (error.toString().includes('Not enough balance')) {
    return [
      'Not enough ALPH balance. Each account in the trade needs at least 0.002 ALPH in their wallet to complete the trade'
    ]
  } else {
    return ['Unknow error, please contact us on Discord and share this error:', error.toString()]
  }
}

function createErrorMessage(): Array<string> {
  const errorList = []
  if (tradeStore.order?.tokenFrom === undefined) {
    errorList.push('Please select a token to send.')
  }
  if (!tradeStore.order?.amountFrom) {
    errorList.push('Please set an amount to send.')
  }
  if (tradeStore.order?.tokenTo === undefined) {
    errorList.push('Please select the token you want to receive.')
  }
  if (!tradeStore.order?.amountTo) {
    errorList.push('Please set an amount you want to receive.')
  }
  if (!tradeStore.order?.to) {
    errorList.push('Please enter the address of the counterparty')
  }
  if (!tradeStore.order?.toPubKey) {
    errorList.push('Please enter the public key of the counterparty')
  }
  return errorList
}
</script>

<template>
  <section v-if="status === undefined" class="p-[10px] lg:p-[30px] bg-core-darker rounded-lg space-y-[30px]">
    <PageTitle
      :title="account.account?.isConnected ? 'Create P2P Order' : 'P2P Trade'"
      :description="'OTC trade directly via Alephium\'s atomic swap, no escrow needed.'"
      :description-right="'OTC trades are only possible between accounts in the same group.'"
      :icon="['fal', 'circle-info']"
    />
    <div class="flex flex-col lg:flex-row w-full lg:space-x-[30px] space-y-[30px] lg:space-y-0">
      <AddressBar :is-sender="true" :class="'lg:basis-1/2'" />
      <AddressBar :is-sender="false" :class="'lg:basis-1/2'" />
    </div>
    <div class="flex flex-col lg:flex-row w-full lg:space-x-[30px] space-y-[30px] lg:space-y-0">
      <TokenBar :is-sender="true" :offer-type="'trade'" :class="'lg:basis-1/2'" :validate-input="true" />
      <TokenBar
        :is-sender="false"
        :offer-type="'trade'"
        :class="'lg:basis-1/2'"
        :account-address="tradeStore.order?.to"
        :validate-input="true"
      />
    </div>
    <HorizontalDividerVue />
    <div class="lg:flex flex-row justify-between items-center">
      <CustomButton
        :title="account.account?.isConnected ? 'Create Order' : 'Connect wallet'"
        :open="false"
        :class="'flex-initial'"
        @click="account.account?.isConnected ? createTrade() : loginStore.toggleModal()"
      />
      <AgreeToTerms :class="'mt-[20px] lg:mt-0 text-center'" />
    </div>
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
