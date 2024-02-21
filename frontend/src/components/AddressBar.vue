<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import { useOrderStore } from '@/stores/tradeOrder'
import { useNodeStore } from '@/stores/node'
import TextInput from '@/components/TextInput.vue'

const orderStore = useOrderStore()

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

async function handleAddress(address: string) {
  // TODO: fetch group for address
  const nodeStore = useNodeStore()
  const group = await nodeStore.getGroupForAddress(address)
  nodeStore.getBalance(address, props.isSender)
  orderStore.setReceiver(address, group.group)
}
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px]">
    <div class="font-extrabold text-core-light">
      {{ props.isSender ? 'Your address' : 'Receiver address' }}
    </div>
    <div
      class="flex flex-row w-full p-[10px] rounded-lg bg-white justify-between items-center text-core"
    >
      <div class="flex flex-row space-x-[10px] items-center w-full">
        <img src="@/assets/alph.png" class="w-[32px] h-[32px] rounded-full" />

        <div v-if="isSender" class="flex flex-row justify-between w-full">
          <p class="font-extrabold text-core-darkest text-[14px]">
            {{
              orderStore.order?.from ? shortenString(orderStore.order?.from, 16) : 'Connect wallet'
            }}
          </p>
          <p v-if="orderStore.order?.groupFrom != undefined">
            {{ `Group ${orderStore.order.groupFrom}` }}
          </p>
        </div>
        <div v-else class="flex flex-row items-center justify-between w-full">
          <TextInput
            :modelValue="
              orderStore.order?.to != undefined ? shortenString(orderStore.order!.to, 16) : ''
            "
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
  </section>
</template>
@/stores/tradeOrder