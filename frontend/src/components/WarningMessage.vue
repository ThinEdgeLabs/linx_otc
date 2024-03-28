<script setup lang="ts">
import AgreeToTerms from './AgreeToTerms.vue'
import CustomButton from './CustomButton.vue'

const props = defineProps({
  popUp: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section
    class="flex flex-col space-y-[30px] lg:space-y-[60px] max-w-[90%] lg:max-w-[50%] rounded-lg bg-menu py-[30px] lg:py-[60px] px-[16px] lg:px-[30px] items-center text-center text-core-lightest"
  >
    <div class="flex flex-col space-y-[30px]">
      <p class="text-[24px] lg:text-[40px] font-extrabold text-core-lightest">{{ props.popUp.title }}</p>
      <font-awesome-icon :icon="['fal', 'warning']" class="text-warning text-[24px] lg:text-[40px]" />

      <p
        v-for="message in props.popUp.message"
        v-bind:key="message"
        class="text-[14px] lg:text-[20px]"
        :class="message.includes('\b') ? 'font-extrabold text-core-lightest' : 'text-core-light'"
      >
        {{ message.replace('\b', '') }}
      </p>
    </div>

    <AgreeToTerms v-if="props.popUp.showTerms" :class="'text-[14px] lg:text-[20px]'" />
    <div class="flex flex-row space-x-[30px] justify-center items-center">
      <CustomButton :title="props.popUp.leftButtonTitle" @click="props.popUp.onAcknowledged()" />
      <CustomButton
        v-if="props.popUp.onCancel"
        :title="props.popUp.rightButtonTitle"
        :delete="true"
        :open="true"
        @click="props.popUp.onCancel()"
      />
    </div>
  </section>
</template>
