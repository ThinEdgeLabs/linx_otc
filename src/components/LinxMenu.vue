<script setup lang="ts">
import { ref } from 'vue'

import LinxOTCLogo from '@/components/LinxOTCLogo.vue'
import MenuItem from '@/components/MenuItem.vue'
import WalletButton from '@/components/WalletButton.vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import MenuButton from '@/components/MenuButton.vue'

const selectedMenuItem = ref('Trade')
const showSideBar = ref(false)

const menuItems = [
  {
    title: 'Home',
    destination: '/'
  },
  {
    title: 'P2P Trade',
    destination: '/trading'
  },
  {
    title: 'P2P Lending',
    destination: '/lending'
  },
  {
    title: 'My Activity',
    destination: '/activity'
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
  <div>
    <div class="flex items-center justify-between p-4 lg:invisible">
      <div @click="showSideBar = !showSideBar">
        <MenuButton />
      </div>
      <LinxHubLogo />
      <div></div>
    </div>
    <nav
      class="sidebar fixed lg:relative lg:flex flex-row text-white items-center justify-between w-56 lg:w-full bg-core-darkest space-x-[20px] h-screen lg:h-auto overflow-y-auto transition-transform -translate-x-full lg:translate-x-0 space-y-[20px]"
      :class="{ 'absolute -translate-x-0 left-56 ': showSideBar, 'left-0': !showSideBar }"
    >
      <LinxOTCLogo class="invisible lg:visible" />
      <div
        @click="showSideBar = !showSideBar"
        class="visible lg:invisible sm:h-0 flex items-center space-x-[17px] px-4 pb-[6px]"
      >
        <font-awesome-icon :icon="['fal', 'times']" class="text-lg text-white text-[28px]" />

        <div class="text-white font-extrabold text-[22px]">Menu</div>
      </div>

      <div
        class="flex flex-col lg:flex-row justify-center pl-[40px] lg:pl-0 lg:space-x-[40px] space-y-[20px] lg:space-y-0 -mb-[3px]"
      >
        <MenuItem
          @click="(selectedMenuItem = item.title), (showSideBar = false)"
          v-for="item in menuItems"
          v-bind:key="menuItems.indexOf(item)"
          :title="item.title"
          :destination="item.destination"
          :is-selected="selectedMenuItem === item.title"
        ></MenuItem>
      </div>

      <WalletButton />
    </nav>
    <HorizontalDivider :class="'invisible lg:visible'" />
  </div>
</template>
