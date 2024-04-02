<script setup lang="ts">
function openInNewTab(destination: string) {
  window.open(destination, '_blank')
}
</script>

<template>
  <div
    class="w-full flex flex-col space-y-[20px] lg:space-y-0 lg:flex-row justify-between items-center text-[14px] pt-[100px] pb-[30px]"
  >
    <div class="flex flex-row space-x-1">
      <p class="text-core-light">Made with ♥️ by</p>
      <p class="font-extrabold text-core-lightest">Linx Labs</p>
    </div>
    <div class="flex flex-row space-x-[10px] items-center">
      <p class="text-core-light">Stay up to date on:</p>
      <button class="w-[40px] h-[40px] rounded-full bg-accent-3" @click="openInNewTab('https://discord.gg/g434BaWTFb')">
        <img :src="'/images/discord.png'" />
      </button>
      <button class="w-[40px] h-[40px] rounded-full bg-accent-3" @click="openInNewTab('https://x.com/linx_labs?s=20')">
        <img :src="'/images/twitter.png'" />
      </button>
      <button class="w-[40px] h-[40px] rounded-full bg-accent-3" @click="openInNewTab('https://t.me/linx_wallet_chat')">
        <img :src="'/images/telegram.png'" />
      </button>
    </div>
  </div>
</template>
