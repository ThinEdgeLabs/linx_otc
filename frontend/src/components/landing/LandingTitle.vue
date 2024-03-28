<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import { NetworkId } from '@alephium/web3'

const props = defineProps({
  isTop: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <section
    class="flex flex-col z-10 space-y-[20px] w-[75%] lg:w-[35%]"
    :class="props.isTop ? ' pt-[200px]' : 'items-center text-center'"
  >
    <p class="w-full text-[14px] text-accent-3 hidden lg:visible">LINX OTC</p>
    <p class="w-full text-[28px] lg:text-[50px] font-extrabold text-core-lightest">
      Peer to Peer (P2P) platform on the Alephium blockchain.
    </p>
    <p class="text-[18px] text-core-light">
      LinxOTC makes uses of the atomic swap feature on Alephium to enable p2p trading.
    </p>
    <RouterLink :to="'/trading'">
      <CustomButton :title="'Open App'" :class="'w-[194px]'" />
    </RouterLink>
  </section>
</template>
