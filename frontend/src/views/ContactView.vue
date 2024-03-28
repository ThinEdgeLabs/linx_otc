<script setup lang="ts">
import ContactCard from '@/components/ContactCard.vue'
import SectionTitle from '@/components/SectionTitle.vue'
</script>

<template>
  <section class="flex flex-col pt-[40px] space-y-[40px] leading-snug">
    <SectionTitle
      :title="'Contact us'"
      :description="'If you run into issues or have a question, feel free to reach out on the platforms below'"
    />
    <div class="flex flex-col lg:flex-row space-y-[30px] lg:space-y-0 lg:space-x-[30px] items-center">
      <ContactCard
        :title="'Discord'"
        :icon="'discord'"
        :description="'Come chat on discord and meet other LinxOTC users.'"
        :button-description="'Join us on Discord'"
        :destination="'https://discord.gg/g434BaWTFb'"
      />
      <ContactCard
        :title="'Telegram'"
        :icon="'telegram'"
        :description="'Come chat on Telegram and meet other LinxOTC users.'"
        :button-description="'Join us on Telegram'"
        :destination="'https://t.me/linx_wallet_chat'"
      />
      <ContactCard
        :title="'X'"
        :icon="'x-twitter'"
        :description="'Follow us on X and stay up to date on the latest Linx news.'"
        :button-description="'Join us on X'"
        :destination="'https://x.com/linx_labs?s=20'"
      />
    </div>
  </section>
</template>
