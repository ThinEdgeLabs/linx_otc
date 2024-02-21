<script setup lang="ts">
import { dummyActivity } from '@/dummyData'
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import ActivityStatus from './ActivityStatus.vue'
import ActivityFromToVue from './ActivityFromTo.vue'
import { shortenString } from '@/functions/stringUtils'
import CustomButton from '../CustomButton.vue'
import type { Activity } from '@/config'

const activities = dummyActivity

function getButtonTitle(activity: Activity): string {
  if (activity.status === 'Open') {
    return 'Edit'
  } else if (activity.status === 'Completed' || activity.status === 'Expired') {
    return 'Claim'
  } else {
    return 'Payback'
  }
}
</script>

<template>
  <div v-if="activities.length === 0" class="flex flex-col w-full h-full py-[15%] items-center">
    <div class="text-[22px] font-extrabold text-core-lightest">No active trades or loans</div>
    <div class="pb-[30px] text-core-light text-[14px]">Create a new loan or trade</div>
  </div>
  <div v-else class="w-full flex flex-col">
    <div class="flex flex-col space-y-0 py-[30px]">
      <div class="text-[22px] font-extrabold text-core-lightest">Activity Overview</div>
      <div class="text-[14px] text-core-light">All your current activity in one page</div>
    </div>
    <HorizontalDivider />
    <div v-for="activity in activities" v-bind:key="activity.id">
      <div class="w-full flex flex-row p-[30px] items-center space-x-[30px]">
        <ActivityID :date="new Date(activity.created)" :id="activity.id" :type="activity.type" />
        <ActivityStatus :status="activity.status" />
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
        <div v-if="activity.type === 'Loan'" class="w-full flex flex-col">
          <div class="text-[10px] text-core-light">DURATION</div>
          <div class="flex flex-row items-center text-[14px] space-x-[4px]">
            <div class="font-extrabold" :class="activity.duration === 0 ? 'text-danger' : 'text-core-lightest'">
              {{ activity.duration }}
            </div>
            <div class="text-core-light">DAYS</div>
          </div>
        </div>
        <div v-else class="w-full flex flex-col" :class="activity.counterParty ? 'visible' : 'invisible'">
          <div class="text-[10px] text-core-light">TO</div>
          <div class="text-[14px] font-extrabold text-core-lightest">
            {{ shortenString(activity.counterParty || '', 12) }}
          </div>
        </div>
        <CustomButton
          :class="activity.status != 'Pending' ? 'min-w-[134px] visible ' : 'invisible'"
          :title="getButtonTitle(activity)"
          :open="activity.status === 'Active'"
        />
      </div>
      <HorizontalDivider />
    </div>
  </div>
</template>
