<script setup lang="ts">
import SectionTitle from '../SectionTitle.vue'
import ManageActivityDetails from '@/components/dashboard/activity/ManageActivityDetails.vue'

defineEmits<{
  (e: 'update:cancel'): void
}>()

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="w-full flex flex-col leading-snug">
    <SectionTitle
      :class="'p-[30px]'"
      :title="`Manage your P2P Contracts`"
      :description="'Check out out FAQ section to learn more about how P2P loans work.'"
    />
    <ManageActivityDetails :activity="props.activity" @update:close-activity="$emit('update:cancel')" />
  </div>
</template>
