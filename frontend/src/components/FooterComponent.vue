<template>
  <div class="w-full flex flex-row justify-between items-center text-[14px] pt-[100px] pb-[30px]">
    <div class="flex flex-row space-x-1">
      <p class="text-core-light">Made with ♥️ by</p>
      <p class="font-extrabold text-core-lightest">Linx Labs</p>
    </div>
    <div class="flex flex-row space-x-[10px] items-center">
      <p class="text-core-light">Stay up to date on:</p>
      <div class="w-[40px] h-[40px] rounded-full bg-accent-3">
        <img :src="'./images/discord.png'" />
      </div>
      <div class="w-[40px] h-[40px] rounded-full bg-accent-3">
        <img :src="'./images/twitter.png'" />
      </div>
      <div class="w-[40px] h-[40px] rounded-full bg-accent-3">
        <img :src="'./images/telegram.png'" />
      </div>
    </div>
  </div>
</template>
