<script setup lang="ts">
import DashboardData from '@/components/dashboard/DashboardData.vue'
import HeroItem from '@/components/landing/HeroItem.vue'
import Faq from '@/components/faq/FaqComponent.vue'
import LandingTitle from '@/components/landing/LandingTitle.vue'

//TODO: On mobile ignore parent x-padding for background image
</script>

<template>
  <div class="w-full flex flex-col space-y-[80px] lg:space-y-[150px] overflow-auto leading-snug items-center">
    <div class="flex flex-col relative w-full">
      <LandingTitle />
      <img
        class="w-full h-full object-cover lg:max-h-[800px] absolute top-0 left-0 lg:-z-1"
        :src="'/images/landing.png'"
      />
    </div>
    <DashboardData :class="'z-10'" :is-landing-page="true" />
    <HeroItem
      :leader="'P2P TRADING'"
      :title="'Easily create \'Over The Counter\' trades between 2 parties'"
      :description="'By making use of the atomic swap feature on Alephium, this is the safest way to exchange one token for another. No third party or smart contract in between, directly trade between 2 parties. If the 2 parties are known upfront you can create a private p2p trade, else you can add a trade offer to the p2p trade contract and open up your offer to anyone interested.'"
      :image="'trade.png'"
    />
    <HeroItem
      :leader="'P2P LOANS'"
      :title="'Borrow or Lend any token for the collateral you want'"
      :description="'Easily create competitive loans where you determine the amount of interest you would like to receive, the duration of the loan and the token + amount of collateral. If you don\'t want to sell your token, you can give it as collateral for a P2P Loan and select a loan that suits you.'"
      :image="'loan.png'"
      :image-right="false"
    />
    <Faq :is-home-view="true" />
    <LandingTitle :is-top="false" />
  </div>
</template>
