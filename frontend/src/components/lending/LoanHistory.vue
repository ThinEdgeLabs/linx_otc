<script setup lang="ts">
import { ContractEvent } from '@alephium/web3'
import { shortenString } from '@/functions/stringUtils'
import type { Loan } from '@/types/loan'

defineProps<{
  loan: Loan
  events: ContractEvent[]
}>()
const explorerUrl = import.meta.env.VITE_ALPH_EXPLORER as string
</script>

<template>
  <a
    v-for="event in events"
    v-bind:key="events.indexOf(event)"
    v-bind:href="`${explorerUrl}/transactions/${event.txId}`"
    target="_blank"
  >
    <div
      v-if="event.name == 'LoanCreated'"
      class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg mt-[20px] last:mb-[30px]"
    >
      <div class="flex flex-row space-x-[10px]">
        <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
          <font-awesome-icon :icon="['fal', 'pen']" class="text-core-light text-[20px]" />
        </div>
        <div class="flex flex-col text-start justify-center text-[10px]">
          <p class="text-core-light">CREATED BY</p>
          <div class="flex flex-row items-center space-x-[10px]">
            <p class="font-extrabold text-core-lightest">
              {{ shortenString(event.fields['by'] as string, 12) }}
            </p>
          </div>
        </div>
      </div>
      <div class="text-[10px] flex flex-col text-end">
        <p class="text-core-light">ON</p>
        <p class="font-extrabold text-core-lightest">
          {{ new Date(loan.created).toDateString() }}
        </p>
      </div>
    </div>

    <div
      v-if="event.name == 'LoanCancelled'"
      class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg last:mb-[30px]"
    >
      <div class="flex flex-row space-x-[10px]">
        <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
          <font-awesome-icon :icon="['fal', 'trash-can']" class="text-core-light text-[20px]" />
        </div>
        <div class="flex flex-col text-start justify-center text-[10px]">
          <p class="text-core-light">CANCELLED BY</p>
          <div class="flex flex-row items-center space-x-[10px]">
            <p class="font-extrabold text-core-lightest">
              {{ shortenString(event.fields['by'] as string, 12) }}
            </p>
          </div>
        </div>
      </div>
      <div class="text-[10px] flex flex-col text-end">
        <p class="text-core-light">ON</p>
        <p class="font-extrabold text-core-lightest">
          {{ new Date(Number(event.fields['timestamp'] as bigint)).toDateString() }}
        </p>
      </div>
    </div>

    <div
      v-if="event.name == 'LoanAccepted'"
      class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg last:mb-[30px]"
    >
      <div class="flex flex-row space-x-[10px]">
        <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
          <font-awesome-icon :icon="['fal', 'handshake']" class="text-core-light text-[20px]" />
        </div>
        <div class="flex flex-col text-start justify-center text-[10px]">
          <p class="text-core-light">ACCEPTED BY</p>
          <div class="flex flex-row items-center space-x-[10px]">
            <p class="font-extrabold text-core-lightest">
              {{ shortenString(event.fields['by'] as string, 12) }}
            </p>
          </div>
        </div>
      </div>
      <div class="text-[10px] flex flex-col text-end">
        <p class="text-core-light">ON</p>
        <p class="font-extrabold text-core-lightest">
          {{ new Date(Number(event.fields['timestamp'] as bigint)).toDateString() }}
        </p>
      </div>
    </div>

    <div
      v-if="event.name == 'LoanPaid'"
      class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg last:mb-[30px]"
    >
      <div class="flex flex-row space-x-[10px]">
        <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
          <font-awesome-icon :icon="['fal', 'money-from-bracket']" class="text-core-light text-[20px]" />
        </div>
        <div class="flex flex-col text-start justify-center text-[10px]">
          <p class="text-core-light">PAID BY</p>
          <div class="flex flex-row items-center space-x-[10px]">
            <p class="font-extrabold text-core-lightest">
              {{ shortenString(event.fields['by'] as string, 12) }}
            </p>
          </div>
        </div>
      </div>
      <div class="text-[10px] flex flex-col text-end">
        <p class="text-core-light">ON</p>
        <p class="font-extrabold text-core-lightest">
          {{ new Date(Number(event.fields['timestamp'] as bigint)).toDateString() }}
        </p>
      </div>
    </div>

    <div
      v-if="event.name == 'LoanLiquidated'"
      class="w-full bg-core-darkest px-[15px] py-[10px] flex flex-row justify-between items-center rounded-lg last:mb-[30px]"
    >
      <div class="flex flex-row space-x-[10px]">
        <div class="flex w-[40px] h-[40px] rounded-full bg-menu items-center justify-center">
          <font-awesome-icon :icon="['fal', 'gavel']" class="text-core-light text-[20px]" />
        </div>
        <div class="flex flex-col text-start justify-center text-[10px]">
          <p class="text-core-light"></p>
          <div class="flex flex-row items-center space-x-[10px]">
            <p class="font-extrabold text-core-lightest">
              {{ shortenString(event.fields['by'] as string, 12) }}
            </p>
          </div>
        </div>
      </div>
      <div class="text-[10px] flex flex-col text-end">
        <p class="text-core-light">ON</p>
        <p class="font-extrabold text-core-lightest">
          {{ new Date(Number(event.fields['timestamp'] as bigint)).toDateString() }}
        </p>
      </div>
    </div>

    <div
      v-if="events.indexOf(event) !== events.length - 1"
      class="border-dashed border-l border-accent-3 h-[30px] ms-[30px]"
    ></div>
  </a>
</template>
