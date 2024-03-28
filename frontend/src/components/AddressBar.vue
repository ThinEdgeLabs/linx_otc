<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import { useOrderStore } from '@/stores/tradeOrder'
import { useNodeStore } from '@/stores/node'
import TextInput from '@/components/TextInput.vue'
import { addressFromPublicKey } from '@alephium/web3'
import { useAccountStore } from '@/stores'
import { usePopUpStore } from '@/stores/popup'
import { ref } from 'vue'
import ValidationError from './ValidationError.vue'

const orderStore = useOrderStore()
const account = useAccountStore()
const popUpStore = usePopUpStore()

const errorMessage = ref<string | undefined>(undefined)
const inputValue = ref<string>('')

const props = defineProps({
  isSender: {
    type: Boolean,
    required: true
  }
})

function pasteAddress() {
  navigator.clipboard.readText().then((text) => {
    // TODO: Handle valid / invalid address
    handleAddress(text)
  })
}

async function handleAddress(pubKey: string) {
  if (pubKey.length === 66) {
    errorMessage.value = undefined
    const nodeStore = useNodeStore()
    const address = addressFromPublicKey(pubKey)
    const group = await nodeStore.getGroupForAddress(address)
    if (group.group != account.account?.group) {
      popUpStore.setPopUp({
        title: 'Address Groups Error',
        message: [
          'P2P trades can only be created between addresses on the same group.',
          `\bYour address is on Group ${account.account?.group}`,
          `\bThe public key you entered is on Group ${group.group}`,
          'You can move your balance to the group of the counterparty or ask the counterparty to move his/her funds.'
        ],
        onAcknowledged: () => popUpStore.closePopUp(),
        type: 'warning',
        showTerms: false,
        leftButtonTitle: 'OK'
      })
      inputValue.value = ''
      errorMessage.value = undefined
      return
    }
    nodeStore.getBalance(address, props.isSender)
    orderStore.setReceiver(address, group.group, pubKey)
  } else {
    inputValue.value = pubKey
    errorMessage.value = 'A public key has 66 characters'
  }
}
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px]">
    <div class="font-extrabold text-core-light">
      {{ props.isSender ? 'Your address' : orderStore.order?.to ? 'Receiver address' : 'Receiver Public Key' }}
    </div>
    <div class="flex flex-row w-full p-[10px] rounded-lg bg-white justify-between items-center text-core">
      <div class="flex flex-row space-x-[10px] items-center w-full">
        <img src="@/assets/alph.png" class="w-[32px] h-[32px] rounded-full" />

        <div v-if="isSender" class="flex flex-row justify-between w-full">
          <p class="font-extrabold text-core-darkest text-[14px]">
            {{ orderStore.order?.from ? shortenString(orderStore.order?.from, 16) : 'Connect wallet' }}
          </p>
          <p v-if="orderStore.order?.groupFrom != undefined">
            {{ `Group ${orderStore.order.groupFrom}` }}
          </p>
        </div>
        <div v-else class="flex flex-row items-center justify-between w-full">
          <TextInput
            :modelValue="orderStore.order?.to != undefined ? shortenString(orderStore.order!.to, 16) : inputValue"
            @update:modelValue="handleAddress($event)"
          />
          <p v-if="orderStore.order?.groupTo != undefined" class="w-full text-end pr-2">
            {{ `Group ${orderStore.order.groupTo}` }}
          </p>
        </div>
      </div>
      <font-awesome-icon
        @click="pasteAddress()"
        v-if="!props.isSender"
        :icon="['fal', 'clipboard']"
        class="text-[18px] text-accent-3 max-w-[20px]"
      />
    </div>
    <ValidationError :message="errorMessage" />
  </section>
</template>
