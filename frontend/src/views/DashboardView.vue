<script setup lang="ts">
import DashboardButton from '@/components/dashboard/DashboardButton.vue'
import DashboardData from '@/components/dashboard/DashboardData.vue'
import DashboardLogin from '@/components/dashboard/DashboardLogin.vue'
import DashboardUserData from '@/components/dashboard/DashboardUserData.vue'
import { useAccountStore } from '@/stores/account'

const accountStore = useAccountStore()
</script>

<template>
  <main>
    <DashboardData />
    <section class="relative flex flex-col bg-menu rounded-lg p-[10px] lg:p-[30px] overflow-y-auto leading-snug">
      <div class="flex flex-row lg:w-full space-x-[30px] items-center overflow-x-auto overflow-y-hidden">
        <DashboardButton
          :icon="'arrow-up-arrow-down'"
          :title="'Create a P2P Trade'"
          :description="'Create your order in seconds'"
          :destination="'/trading'"
        />
        <DashboardButton
          :icon="'sack-dollar'"
          :title="'Create a P2P Loan'"
          :description="'Create your loan in seconds'"
          :destination="'/lending/create'"
        />
        <DashboardButton
          :icon="'list'"
          :title="'Explore P2P Loans'"
          :description="'Find a loan that suits YOU'"
          :destination="'/lending'"
        />
        <DashboardButton
          :icon="'comment-question'"
          :title="'FAQ'"
          :description="'Check the most asked questions'"
          :destination="'/faq'"
        />
      </div>
      <DashboardLogin v-if="!accountStore.account?.isConnected" />
      <DashboardUserData v-else />
    </section>
  </main>
</template>
