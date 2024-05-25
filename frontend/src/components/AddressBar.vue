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
import { getPubKeyFromAddress } from '@/functions/utils'

const orderStore = useOrderStore()
const account = useAccountStore()
const popUpStore = usePopUpStore()

const errorMessage = ref<string | undefined>(undefined)
const pubKeyErrorMessage = ref<string | undefined>(undefined)
const inputValue = ref<string>('')
const inputPubKey = ref<string>('')
const getPubKey = ref<boolean>(false)
const addressGroup = ref<number | undefined>(undefined)

const props = defineProps({
  isSender: {
    type: Boolean,
    required: true
  }
})

function pasteAddress(isAddress: boolean) {
  navigator.clipboard.readText().then((text) => {
    // TODO: Handle valid / invalid address
    if (isAddress) {
      handleAddress(text)
    } else {
      handlePubKey(text)
    }
  })
}

async function handleAddress(address: string) {
  inputPubKey.value = ''
  getPubKey.value = false
  errorMessage.value = undefined
  pubKeyErrorMessage.value = undefined

  if (address.length === 45) {
    const nodeStore = useNodeStore()
    const group = await nodeStore.getGroupForAddress(address)
    if (group.group != account.account?.group) {
      popUpStore.setPopUp({
        title: 'Invalid Address Group',
        message: [
          'P2P trades can only be created between addresses in the same group.',
          `\bYour address is in Group ${account.account?.group}`,
          `\bThe address you entered is in Group ${group.group}`,
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
    } else {
      addressGroup.value = group.group
    }
    const pubKey = await getPubKeyFromAddress(address)
    if (!pubKey) {
      console.log('no public key found for address')
      getPubKey.value = true
      inputValue.value = address
      errorMessage.value = 'Could not find public key, please ask for a public key for this address and paste it below.'
      return
    } else {
      errorMessage.value = undefined
      orderStore.setReceiver(address, group.group, pubKey)
    }
  } else {
    inputValue.value = address
    errorMessage.value = 'Invalid Address'
  }
}

async function handlePubKey(pubKey: string) {
  if (pubKey.length === 66) {
    const address = addressFromPublicKey(pubKey)
    if (address != inputValue.value) {
      pubKeyErrorMessage.value = 'This publicKey does not belong to the entered address.'
      inputPubKey.value = ''
      return
    } else {
      orderStore.setReceiver(address, addressGroup.value!, pubKey)
      getPubKey.value = false
      errorMessage.value = undefined
      pubKeyErrorMessage.value = undefined
    }
  } else {
    inputPubKey.value = pubKey
    errorMessage.value = 'Invalid Public Key'
  }
}
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px]">
    <div class="flex flex-row space-x-[10px] justify-between">
      <div class="font-extrabold text-core-light">
        {{ props.isSender ? 'Your address' : 'Receiver address' }}
      </div>
    </div>

    <div class="flex flex-row w-full p-[10px] rounded-lg bg-white justify-between items-center text-core max-h-[52px]">
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
        @click="pasteAddress(true)"
        v-if="!props.isSender"
        :icon="['fal', 'clipboard']"
        class="text-[18px] text-accent-3 max-w-[20px]"
      />
    </div>
    <div class="flex-col space-y-8 lg:space-y-2" :class="errorMessage ? 'flex' : 'hidden'">
      <ValidationError :message="errorMessage" />
      <a
        v-if="getPubKey"
        href="https://docs.linxlabs.org/linx-otc/p2p-trading/how-to-find-your-public-key"
        target="_blank"
        class="text-accent-3 text-[10px]"
        >How to find the publickey</a
      >
    </div>

    <div
      v-if="getPubKey"
      class="flex flex-row w-full p-[10px] rounded-lg bg-white justify-between items-center text-core max-h-[52px]"
    >
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
            :fieldType="'publicKey'"
            :modelValue="
              orderStore.order?.toPubKey != undefined ? shortenString(orderStore.order!.toPubKey, 16) : inputPubKey
            "
            @update:modelValue="handlePubKey($event)"
          />
        </div>
      </div>
      <font-awesome-icon
        @click="pasteAddress(false)"
        v-if="!props.isSender"
        :icon="['fal', 'clipboard']"
        class="text-[18px] text-accent-3 max-w-[20px]"
      />
    </div>
    <ValidationError :message="pubKeyErrorMessage" v-if="pubKeyErrorMessage" />
  </section>
</template>
