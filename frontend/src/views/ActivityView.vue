<script setup lang="ts">
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import { useActivity } from '@/composables/activity'
import { useAccountStore } from '@/stores'
import DashboardLogin from '@/components/dashboard/DashboardLogin.vue'
import { shortenString } from '@/functions/stringUtils'

const { events, isLoading, error } = useActivity()
const accountStore = useAccountStore()
const explorerUrl = import.meta.env.VITE_ALPH_EXPLORER as string
</script>
<template>
  <section class="pt-[30px] space-y-[30px]">
    <div>
      <div class="flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 justify-between w-full">
        <div class="flex flex-col leading-snug">
          <p class="text-[32px] font-extrabold text-white">Activity</p>
          <p>Check out our FAQ to learn more about how P2P loans work</p>
        </div>
      </div>
    </div>
    <div class="w-full rounded-lg bg-menu p-[30px] relative z-10">
      <!-- <LoanFilters :view="view" :change-view="changeView" :class="'z-10 hidden lg:flex'" />
      <LoanHeaders v-if="view === 'list'" /> -->
      <div>
        <div class="py-4 px-[20px] flex flex-row text-[14px] font-bold text-core-light">
          <div class="grow">Details</div>
          <!-- <div class="grow">Status</div> -->
          <div class="grow">Date</div>
          <div class="grow">Transaction ID</div>
          <div class="grow"></div>
        </div>
        <HorizontalDivider />
        <DashboardLogin v-if="!accountStore.account?.isConnected" />
        <div
          v-if="error && accountStore.account?.isConnected"
          class="justify-center items-center text-center mt-[30px]"
        >
          <p class="text-[30px] text-core-lightest font-extrabold">Error</p>
        </div>
        <div
          v-if="isLoading && accountStore.account?.isConnected"
          class="justify-center items-center text-center mt-[30px]"
        >
          <p class="text-[30px] text-core-lightest font-extrabold mb-[20px]">Loading...</p>
          <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
        </div>
        <div v-if="!isLoading && accountStore.account?.isConnected && events.length === 0">
          <p class="text-center text-[14px] pt-4 text-core-lightest">You don't have any activity yet.</p>
        </div>
        <div class="space-y-4" v-for="event in events" v-bind:key="event.txId">
          <div class="group lg:hover:bg-core-darkest cursor-pointer">
            <div class="w-full flex flex-row items-center p-[20px]">
              <div class="w-full flex flex-row items-center space-x-[10px] text-[16px]">
                <div v-if="event.name === 'LoanCreated'" class="font-extrabold text-core-lightest">Created loan</div>
                <div v-if="event.name === 'LoanCancelled'" class="font-extrabold text-core-lightest">
                  Cancelled loan
                </div>
                <div v-if="event.name === 'LoanAccepted'" class="font-extrabold text-core-lightest">Borrowed</div>
                <div v-if="event.name === 'LoanPaid'" class="font-extrabold text-core-lightest">Paid loan</div>
                <div v-if="event.name === 'LoanLiquidated'" class="font-extrabold text-core-lightest">Paid loan</div>
              </div>
              <!-- <div class="w-full flex flex-row items-center space-x-[10px] text-[14px]">Event Status</div> -->
              <div class="w-full flex flex-row space-x-1">
                {{ new Date(Number(event.fields['timestamp'] as bigint)).toLocaleString() }}
              </div>
              <div class="w-full flex flex-col">
                {{ shortenString(event.txId, 12) }}
              </div>
              <div class="w-full">
                <a
                  class="invisible group-hover:visible py-[10px] px-[20px] rounded-[20px] text-[16px] justify-center items-center bg-gradient-to-r from-accent-1 to-accent-2 text-white hover:bg-none hover:bg-accent-2"
                  v-bind:href="`${explorerUrl}/transactions/${event.txId}`"
                  target="_blank"
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
