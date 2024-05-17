<script setup lang="ts">
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import ActivityStatus from './ActivityStatus.vue'
import ActivityFromToVue from './ActivityFromTo.vue'
import { shortenString } from '@/functions/stringUtils'
import CustomButton from '../CustomButton.vue'
import type { Activity } from '@/types'
import ActivityID from './ActivityID.vue'
import { onMounted } from 'vue'
import { useLoanStore } from '@/stores/loans'
import { useAccountStore } from '@/stores'

const loanStore = useLoanStore()
const accountStore = useAccountStore()

onMounted(async () => {
  if (accountStore.account) {
    await loanStore.getLoansForUser(accountStore.account.address)
  }
})

function getButtonTitle(activity: Activity): string {
  if (activity.status === 'Open') {
    return 'Delete'
  } else if (activity.status === 'Expired') {
    return 'Claim'
  } else if (activity.counterParty === accountStore.account?.address) {
    return 'Payback'
  } else {
    return 'View'
  }
}
</script>

<template>
  <section v-if="loanStore.isLoading" class="justify-center items-center text-center space-y-[30px] pt-[30px]">
    <p class="text-[30px] text-core-lightest font-extrabold">Loading...</p>
    <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
  </section>
  <div
    v-if="!loanStore.isLoading && loanStore.userLoans.length === 0"
    class="flex flex-col w-full h-full py-[15%] items-center"
  >
    <font-awesome-icon :icon="['fat', 'bell']" class="text-[38px] text-accent-3 pb-[30px]" />
    <div class="text-[22px] font-extrabold text-core-lightest">No active trades or loans</div>
    <div class="pb-[30px] text-core-light text-[14px]">Create a new loan or trade</div>
  </div>
  <div v-else class="w-full flex flex-col">
    <div class="flex flex-col space-y-0 py-[30px]">
      <div class="text-[22px] font-extrabold text-core-lightest">Activity Overview</div>
      <div class="text-[14px] text-core-light">All your current activity in one page</div>
    </div>
    <HorizontalDivider />
    <div v-for="activity in loanStore.userLoans" v-bind:key="activity.id">
      <div
        class="w-full flex flex-col lg:flex-row lg:items-center py-[20px] lg:px-[20px] lg:space-x-[30px] space-y-[20px] lg:space-y-0"
      >
        <div class="w-full flex flex-row justify-between items-center">
          <ActivityID :date="new Date(activity.created)" :id="activity.id" :type="activity.type" />
          <ActivityStatus :status="activity.status" />
        </div>
        <div class="w-full flex flex-row justify-between items-center">
          <ActivityFromToVue
            :token="activity.offerToken"
            :amount="activity.offerAmount"
            :title="activity.type === 'Trade' ? 'Sending' : 'Loan'"
          />
          <ActivityFromToVue
            :token="activity.requestToken"
            :amount="activity.requestAmount"
            :title="activity.type === 'Trade' ? 'Receiving' : 'Collateral'"
          />
        </div>

        <div v-if="activity.type === 'Loan'" class="w-full hidden lg:flex flex-col">
          <div class="text-[10px] text-core-light">DURATION</div>
          <div class="flex flex-row items-center text-[14px] space-x-[4px]">
            <div class="font-extrabold" :class="activity.remaining === 0 ? 'text-danger' : 'text-core-lightest'">
              {{ activity.status === 'Open' ? activity.duration : activity.remaining }}
            </div>
          </div>
        </div>
        <div v-else class="w-full hidden lg:flex flex-col" :class="activity.counterParty ? 'visible' : 'invisible'">
          <div class="text-[10px] text-core-light">TO</div>
          <div class="text-[14px] font-extrabold text-core-lightest">
            {{ shortenString(activity.counterParty || '', 12) }}
          </div>
        </div>
        <CustomButton
          :class="activity.status != 'Pending' ? 'w-full lg:max-w-[134px] visible ' : 'invisible'"
          :title="getButtonTitle(activity)"
          :open="activity.status === 'Active' || activity.status === 'Open'"
          :delete="activity.status === 'Open'"
          @click="$router.push(`/lending/${activity.contractId}?return=dashboard`)"
        />
      </div>
      <HorizontalDivider />
    </div>
  </div>
</template>
