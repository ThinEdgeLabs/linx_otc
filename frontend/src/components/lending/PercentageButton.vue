<script setup lang="ts">
import { useLoanOrderStore } from '@/stores/loanOrder'

const loanOrderStore = useLoanOrderStore()

const props = defineProps({
  interest: {
    type: Number,
    required: true
  }
})

function addInterest() {
  const add = props.interest / 100
  const currentInterest = loanOrderStore.order?.interest ?? 0
  const loan = loanOrderStore.order?.loanAmount ?? 0
  loanOrderStore.setInterest(currentInterest + loan * add)
}
</script>

<template>
  <button @click="addInterest" class="p-[8px] bg-core-lighter rounded-lg text-core-darkest text-[12px] font-semibold">
    + {{ props.interest }} %
  </button>
</template>
