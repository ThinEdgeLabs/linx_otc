<script setup lang="ts">
const props = defineProps({
  leader: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  imageRight: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <section id="mobile" class="lg:hidden flex flex-col">
    <div class="w-full flex flex-col w-full space-y-[20px] py-[48px]">
      <div class="flex flex-col">
        <p class="text-[14px] text-accent-3">{{ props.leader }}</p>
        <p class="text-[40px] text-core-lightest font-extrabold">{{ props.title }}</p>
      </div>
      <img :src="`./images/${props.image}`" />
      <p class="text-[18px] text-core-light">{{ props.description }}</p>
    </div>
  </section>
  <section id="large" class="hidden lg:flex w-full flex-row space-x-[134px] z-10 leading-snug items-center">
    <div v-if="!imageRight" class="max-w-[490px]">
      <img :src="`./images/${props.image}`" />
    </div>
    <div class="w-full flex flex-col w-full space-y-[20px] py-[48px]">
      <div class="flex flex-col">
        <p class="text-[14px] text-accent-3">{{ props.leader }}</p>
        <p class="text-[40px] text-core-lightest font-extrabold">{{ props.title }}</p>
      </div>
      <p class="text-[18px] text-core-light">{{ props.description }}</p>
    </div>
    <div v-if="imageRight" class="max-w-[490px]">
      <img :src="`./images/${props.image}`" />
    </div>
  </section>
</template>
