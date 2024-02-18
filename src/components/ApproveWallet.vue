<template>
  <section class="flex flex-col w-full min-h-full bg-menu rounded-lg space-y-[30px] justify-center">
    <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    <div class="space-y-[10px] text-center">
      <div class="text-[22px] font-extrabold text-core-lightest">
        Confirm the order creation in your wallet
      </div>
      <div class="text-[16px]">Waiting for transaction confirmation</div>
    </div>

    <div
      id="progressBar"
      class="flex flex-row items-center px-[30px] pt-[10px] pb-[20px] justify-center"
    >
      <div class="h-[20px] w-[20px] rounded-full bg-accent-1" />
      <div class="h-[5px] w-[50%] bg-core-light" />
      <div class="h-[20px] w-[20px] rounded-full bg-core-light" />
    </div>
  </section>
</template>
