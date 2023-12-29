<script setup lang="ts">
const props = defineProps({
  isSender: {
    type: Boolean,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  setReceiver: {
    type: Function,
    required: false
  }
})
</script>

<template>
  <section class="flex flex-col space-y-[10px] text-[14px]">
    <div class="font-extrabold text-core-light">
      {{ props.isSender ? 'Your address' : 'Receiver address' }}
    </div>
    <div
      class="flex flex-row w-full p-[10px] rounded-lg bg-white justify-between items-center text-core"
    >
      <div class="flex flex-row space-x-[10px] items-center">
        <img src="@/assets/alph.png" class="w-[20px] h-[20px] rounded-full" />
        <p v-if="isSender">{{ props.address ? props.address : 'Connect wallet' }}</p>
        <p v-else>{{ props.address ? props.address : 'Enter receiver address' }}</p>
      </div>
      <font-awesome-icon
        v-if="!props.isSender"
        :icon="['fal', 'clipboard']"
        class="text-[18px] text-accent-3"
      />
    </div>
  </section>
</template>
