<script setup lang="ts">
import FaqItem from './FaqItem.vue'

const props = defineProps({
  isHomeView: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="w-full flex flex-col space-y-[40px] leading-snug">
    <div class="flex flex-col w-full" :class="props.isHomeView ? 'lg:items-center' : ''">
      <p v-if="props.isHomeView" class="text-[14px] text-accent-1">FAQ</p>
      <p class="text-[28px] lg:text-[40px] font-extrabold text-core-lightest">Frequently Asked Questions</p>
      <p class="text-[16px] lg:text-[18px] text-core-light" :class="props.isHomeView ? 'lg:w-[35%]' : 'w-full'">
        Got a question? Your answer might be here. If you can't find what you're looking for, join our Discord and ask
        us directly.
      </p>
    </div>
    <div class="flex flex-col w-full space-y-[20px]">
      <FaqItem
        :question="'Lorem ipsum dolor sit ame?'"
        :answer="'Some random answer text to fill up the demo screen and explain what is going on.'"
      />
      <FaqItem
        :question="'Lorem ipsum dolor sit ame?'"
        :answer="'Some random answer text to fill up the demo screen and explain what is going on.'"
      />
      <FaqItem
        :question="'Lorem ipsum dolor sit ame?'"
        :answer="'Some random answer text to fill up the demo screen and explain what is going on.'"
      />
      <FaqItem
        :question="'Lorem ipsum dolor sit ame?'"
        :answer="'Some random answer text to fill up the demo screen and explain what is going on.'"
      />
      <FaqItem
        :question="'Lorem ipsum dolor sit ame?'"
        :answer="'Some random answer text to fill up the demo screen and explain what is going on.'"
      />
    </div>
  </div>
</template>
