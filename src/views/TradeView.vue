<script setup lang="ts">
import { ref } from 'vue'

import DashboardData from '@/components/DashboardData.vue'
import NewTrade from '@/components/trade/NewTrade.vue'

const step = ref(1)
</script>

<template>
  <section class="flex flex-col w-full space-y-[40px]">
    <DashboardData />
    <NewTrade />
  </section>
</template>
