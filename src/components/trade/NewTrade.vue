<script setup lang="ts">
import { ref } from 'vue'

import PageTitle from '@/components/PageTitle.vue'
import AddressBar from '@/components/AddressBar.vue'
import TokenBar from '@/components/TokenBar.vue'

const walletConnected = ref(false)
</script>

<template>
  <section class="flex flex-col w-full p-[30px] bg-core-darker rounded-lg space-y-[30px]">
    <PageTitle
      :title="walletConnected ? 'Create P2P Order' : 'P2P Trade'"
      :description="'Make use of the atomic swap feature on Alephium to trade directly with someone.'"
    />
    <div class="flex flex-col lg:flex-row w-full lg:space-x-[30px] space-y-[30px] lg:space-y-0">
      <AddressBar :is-sender="true" :class="'lg:basis-1/2'" />
      <AddressBar :is-sender="false" :class="'lg:basis-1/2'" />
    </div>
    <div class="flex flex-col lg:flex-row w-full lg:space-x-[30px] space-y-[30px] lg:space-y-0">
      <TokenBar :is-sender="true" :class="'lg:basis-1/2'" />
      <TokenBar :is-sender="false" :class="'lg:basis-1/2'" />
    </div>
  </section>
</template>
