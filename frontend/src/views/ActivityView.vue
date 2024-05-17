<script setup lang="ts">
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import { useActivity } from '@/composables/activity'
import { useAccountStore } from '@/stores'
import DashboardLogin from '@/components/dashboard/DashboardLogin.vue'
import { shortenString } from '@/functions/stringUtils'
import { copyToClipboard } from '@/functions/utils'
import OrderStatusSelector from '@/components/activity/OrderStatusSelector.vue'
import OrderTypeSelector from '@/components/activity/OrderTypeSelector.vue'
const { filteredEvents, isLoading, error, setTypeFilter } = useActivity()
const accountStore = useAccountStore()
const explorerUrl = import.meta.env.VITE_ALPH_EXPLORER as string

function openInExplorer(txId: string) {
  window.open(`${explorerUrl}/transactions/${txId}`, '_blank')
}
</script>

<template>
  <section class="pt-[30px] space-y-[30px]">
    <div>
      <div class="flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 justify-between w-full">
        <div class="flex flex-col leading-snug">
          <p class="text-[32px] font-extrabold text-white">Activity</p>
        </div>
      </div>
    </div>
    <div class="w-full rounded-lg bg-menu p-[10px] lg:p-[30px] relative z-10">
      <div
        class="flex flex-col lg:flex-row items-center w-full space-y-[20px] lg:space-y-0 lg:space-x-[30px] text-[14px] font-bold text-core-lightest"
      >
        <div class="flex flex-col space-y-[10px] w-full">
          <p>Order type</p>
          <OrderTypeSelector @update:tx-type="setTypeFilter($event)" />
        </div>
        <!-- <div class="flex flex-col space-y-[10px] min-w-[386px]">
          <p>Order Status</p>
          <OrderStatusSelector />
        </div> -->
      </div>
      <div>
        <div
          class="py-4 lg:px-[20px] px-[10px] grid lg:grid-cols-4 grid-cols-2 gap-x-3 items-stretch text-[14px] font-bold text-core-light"
        >
          <div class="grow">Details</div>
          <div class="lg:block hidden grow">Date</div>
          <div class="grow text-right lg:text-left">Transaction ID</div>
          <div class="grow lg:block hidden">Action</div>
        </div>
        <HorizontalDivider />
        <DashboardLogin v-if="!accountStore.account?.isConnected" />
        <div
          v-if="error && accountStore.account?.isConnected"
          class="flex flex-col w-full h-full py-[15%] items-center text-center"
        >
          <font-awesome-icon :icon="['fat', 'face-disappointed']" class="text-[38px] text-accent-3 pb-[30px]" />
          <div class="text-[22px] font-extrabold text-core-lightest mb-[10px]">Oops, something went wrong</div>
          <div class="lg:flex text-core-light text-[14px]">
            Please try again later or reach out to us if the issue persists.
          </div>
        </div>
        <div
          v-if="isLoading && accountStore.account?.isConnected"
          class="justify-center items-center text-center mt-[30px]"
        >
          <p class="text-[30px] text-core-lightest font-extrabold mb-[20px]">Loading...</p>
          <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
        </div>
        <div
          v-if="!error && !isLoading && accountStore.account?.isConnected && filteredEvents.length === 0"
          class="flex flex-col w-full h-full py-[15%] items-center text-center"
        >
          <font-awesome-icon :icon="['fat', 'bell']" class="text-[38px] text-accent-3 pb-[30px]" />
          <div class="text-[22px] font-extrabold text-core-lightest mb-[10px]">You don't have any activity yet.</div>
          <!-- <div class="lg:flex text-core-light text-[14px]">

          </div> -->
        </div>
        <div
          class="space-y-4"
          v-for="event in filteredEvents"
          v-bind:key="event.txId"
          @click="openInExplorer(event.txId)"
        >
          <div class="group lg:hover:bg-core-darkest cursor-pointer">
            <div class="grid lg:grid-cols-4 grid-cols-3 gap-x-1 items-stretch py-[10px] lg:p-[20px]">
              <div class="col-span-2 lg:col-span-1 flex flex-row items-center text-[16px]">
                <img
                  v-if="event.tokens[0]"
                  :src="`${event.tokens[0].logoUri}`"
                  class="w-[40px] h-[40px] rounded-full"
                />
                <img
                  v-if="event.tokens[1]"
                  :src="`${event.tokens[1].logoUri}`"
                  class="w-[40px] h-[40px] ms-[-10px] rounded-full"
                />
                <div class="ms-[10px] font-extrabold text-core-lightest">{{ event.details }}</div>
              </div>
              <div class="flex-row space-x-1 text-core-light lg:flex hidden items-center">
                {{ new Date(event.timestamp).toLocaleString() }}
              </div>
              <div class="w-full flex flex-row space-x-[10px] text-core-light items-center">
                <font-awesome-icon :icon="['fal', 'copy']" @click="copyToClipboard(event.txId)" class="mt-[2px]" />
                <div>{{ shortenString(event.txId, 8) }}</div>
              </div>
              <div class="lg:flex hidden grow items-center">
                <a
                  class="invisible group-hover:visible py-[10px] px-[20px] rounded-[20px] text-[16px] justify-center items-center bg-gradient-to-r from-accent-1 to-accent-2 text-white hover:bg-none hover:bg-accent-2"
                  >View in explorer</a
                >
              </div>
            </div>
            <HorizontalDivider />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
