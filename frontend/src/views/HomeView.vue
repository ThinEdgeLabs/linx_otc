<script setup lang="ts">
import DashboardData from '@/components/dashboard/DashboardData.vue'
import HeroItem from '@/components/landing/HeroItem.vue'
import Faq from '@/components/faq/FaqComponent.vue'
import LandingTitle from '@/components/landing/LandingTitle.vue'
</script>

<template>
  <div class="w-full flex flex-col space-y-[150px] overflow-auto leading-snug items-center">
    <div class="flex flex-col relative w-full">
      <LandingTitle />
      <img class="w-full max-h-[800px] absolute top-0 left-0 -z-1" :src="'./images/landing.png'" />
    </div>
    <DashboardData :class="'z-10'" :is-landing-page="true" />
    <HeroItem
      :leader="'LOREM'"
      :title="'Lorem ipsum dolor sit amet, consectetur elit.'"
      :description="'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse pulvinar eros massa, vitae cursus nulla cursus ac. Vestibulum tristique felis ac diam posuere pharetra. Nunc ipsum metus, varius vitae faucibus a, dictum ut quam.'"
      :image="''"
    />
    <HeroItem
      :leader="'LOREM'"
      :title="'Lorem ipsum dolor sit amet, consectetur elit.'"
      :description="'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse pulvinar eros massa, vitae cursus nulla cursus ac. Vestibulum tristique felis ac diam posuere pharetra. Nunc ipsum metus, varius vitae faucibus a, dictum ut quam.'"
      :image="''"
      :image-right="false"
    />
    <HeroItem
      :leader="'LOREM'"
      :title="'Lorem ipsum dolor sit amet, consectetur elit.'"
      :description="'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse pulvinar eros massa, vitae cursus nulla cursus ac. Vestibulum tristique felis ac diam posuere pharetra. Nunc ipsum metus, varius vitae faucibus a, dictum ut quam.'"
      :image="''"
    />
    <Faq :is-home-view="true" />
    <LandingTitle :is-top="false" />
  </div>
</template>
