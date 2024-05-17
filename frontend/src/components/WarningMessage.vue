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
    class="flex flex-col max-w-[90%] lg:max-w-[25%] rounded-lg bg-menu py-[30px] lg:py-[60px] px-[16px] lg:px-[30px] items-center text-center text-core-lightest"
  >
    <div class="flex flex-col space-y-[20px]">
      <font-awesome-icon
        v-if="popUp.showIcon"
        :icon="['fal', 'warning']"
        class="text-danger text-[24px] lg:text-[40px]"
      />
      <p class="text-[22px] font-extrabold text-core-lightest">{{ props.popUp.title }}</p>
      <p
        v-for="message in props.popUp.message"
        v-bind:key="message"
        class="text-[14px]"
        :class="message.includes('\b') ? 'font-extrabold text-core-lightest' : 'text-core-light'"
      >
        {{ message.replace('\b', '') }}
      </p>
    </div>

    <div class="flex flex-row justify-center items-center w-full mt-[40px]">
      <CustomButton :title="props.popUp.leftButtonTitle" @click="props.popUp.onAcknowledged()" :class="'lg:w-full'" />
      <CustomButton
        v-if="props.popUp.onCancel"
        :title="props.popUp.rightButtonTitle"
        :delete="true"
        :open="true"
        @click="props.popUp.onCancel()"
        :class="'lg:w-full'"
      />
    </div>
    <AgreeToTerms v-if="props.popUp.showTerms" :class="'mt-[20px]'" />
  </section>
</template>
