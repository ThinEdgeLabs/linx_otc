<script setup lang="ts">
import { ref } from 'vue'

import LinxHubLogo from '@/components/LinxHubLogo.vue'
import MenuItem from '@/components/MenuItem.vue'
import WalletButton from '@/components/WalletButton.vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'

const selectedMenuItem = ref('Home')

const menuItems = [
  {
    title: 'Home',
    destination: '/'
  },
  {
    title: 'Trade',
    destination: '/trade'
  },
  {
    title: 'Transactions',
    destination: '/transactions'
  },
  {
    title: 'FAQ',
    destination: '/faq'
  },
  {
    title: 'About',
    destination: '/about'
  },
  {
    title: 'Contact',
    destination: '/contact'
  }
]
</script>

<template>
  <nav
    class="flex flex-row text-white items-center justify-between w-full space-x-[20px] lg:space-x-[40px]"
  >
    <LinxHubLogo />
    <div class="flex flex-row justify-center space-x-[40px]">
      <MenuItem
        @click="selectedMenuItem = item.title"
        v-for="item in menuItems"
        v-bind:key="menuItems.indexOf(item)"
        :title="item.title"
        :destination="item.destination"
        :is-selected="selectedMenuItem === item.title"
      ></MenuItem>
    </div>

    <WalletButton />
  </nav>
  <HorizontalDivider class="-mt-[3px]" />
</template>
