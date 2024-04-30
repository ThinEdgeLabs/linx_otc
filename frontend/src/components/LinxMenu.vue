<script setup lang="ts">
import { ref } from 'vue'
import LinxOTCLogo from '@/components/LinxOTCLogo.vue'
import MenuItem from '@/components/MenuItem.vue'
import WalletButton from '@/components/WalletButton.vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import { useLoginStore } from '@/stores/login'

const selectedMenuItem = ref('Home')
const showSideBar = ref(false)
const loginStore = useLoginStore()

const menuItems = [
  // {
  //   title: 'Dashboard',
  //   destination: '/dashboard'
  // },
  {
    title: 'P2P Trade',
    destination: '/trading'
  },
  {
    title: 'P2P Lending',
    destination: '/lending'
  },
  {
    title: 'Activity',
    destination: '/activity'
  },
  {
    title: 'Docs',
    destination: '/gitbook'
  },
  {
    title: 'FAQ',
    destination: '/faq'
  },
  {
    title: 'Contact',
    destination: '/contact'
  }
]

function goToDocs() {
  window.open('https://linx-labs.gitbook.io/linxotc-testnet/', '_blank')
}
</script>

<template>
  <div>
    <div class="flex flex-row items-center justify-between py-4 lg:hidden">
      <font-awesome-icon
        :icon="['fal', 'bars']"
        class="text-[28px] text-core-lightest hover:text-accent-3"
        @click="showSideBar = !showSideBar"
      />
      <RouterLink :to="'/'">
        <LinxOTCLogo @click="selectedMenuItem = 'Home'" />
      </RouterLink>
      <font-awesome-icon
        :icon="['fal', 'wallet']"
        class="text-[24px] text-core-lightest"
        @click="loginStore.toggleModal()"
      />
    </div>
    <nav
      class="absolute lg:pt-0 lg:px-0 sidebar fixed lg:relative lg:flex flex-row text-white items-center justify-between lg:w-full space-x-[20px] h-screen lg:h-auto overflow-y-auto transition-transform -translate-x-full lg:translate-x-0 space-y-[20px] z-20"
      :class="{
        'absolute -translate-x-0 left-[75%] w-[75%] top-0 bg-core-darkest': showSideBar,
        'left-0': !showSideBar
      }"
    >
      <RouterLink :to="'/'">
        <LinxOTCLogo :class="'invisible lg:visible lg:pt-[10px]'" @click="selectedMenuItem = 'Home'" />
      </RouterLink>
      <div @click="showSideBar = !showSideBar" class="visible lg:invisible flex items-center space-x-[17px]">
        <font-awesome-icon :icon="['fal', 'times']" class="text-core-lightest text-[28px]" />

        <div class="text-white font-extrabold text-[22px]">Menu</div>
      </div>

      <div
        class="flex flex-col lg:flex-row justify-center pl-[40px] space-y-[30px] pt-[30px] lg:pt-0 lg:pl-0 lg:space-x-[40px] lg:space-y-0 z-20"
      >
        <MenuItem
          @click="item.title === 'Docs' ? goToDocs() : (selectedMenuItem = item.title), (showSideBar = false)"
          v-for="item in menuItems"
          v-bind:key="menuItems.indexOf(item)"
          :title="item.title"
          :destination="item.destination"
          :is-selected="$route.fullPath === item.destination"
        ></MenuItem>
      </div>
      <div class="pr-[30px] lg:pr-0">
        <WalletButton @click="showSideBar = false" />
      </div>
    </nav>
    <HorizontalDivider :class="'relative invisible lg:visible -mt-[3px] z-10'" />
  </div>
</template>
