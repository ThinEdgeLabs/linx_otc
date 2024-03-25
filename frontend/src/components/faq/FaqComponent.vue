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
        :question="'What is a P2P Trade?'"
        :answer="'It is a trade of tokens between 2 people. This can happen in a direct trade or through a smart contract, where it resembles an order book trade. The direct trade is a so called atomic swap, a single transaction where the trade is executed and can only succeed if both parties sign and have the required tokens. An order book trade is first created in a smart contract and can get settled/executed once a counterparty sends the required token to the contract.'"
      />
      <FaqItem
        :question="'What is a P2P Loan?'"
        :answer="'It is a direct loan between 2 people, registered in an unique smart contract. The lender determines the conditions of the loan and receives back his loan + interest after the counterparty paid back the loan and collects the collateral, before the loan expires. If the loan expires, the lender can withdrawl the collateral that the borrower had to put up to take the loan.'"
      />
      <!-- <FaqItem
        :question="'What is the borrower rating?'"
        :answer="'Every new borrower starts with a 0 rating. For every loan that the borrower pay\'s back succesfully, the rating get\'s increased. In case the borrower let the loan expire, the rating will be reset to 0. As a lender you can choose to only loan to borrowers with a specific minimum rating to decrease the risk of not getting your loan + interest paid.'"
      /> -->
      <FaqItem
        :question="'How can I find people to create a trade or loan?'"
        :answer="'In the Linx Labs discord server there is a special chat channel for discussing loans and trades. Here you can discuss offers and once you found a counterparty you can create the transaction on LinxOTC. You can also just post an offer on the LinxOTC platform and wait for someone to accept it.'"
      />
      <FaqItem
        :question="'Is LinxOTC safe to use?'"
        :answer="'Direct trade with a counterparty is safe, as there are no contracts. The order book trading or lending is managed by smart contracts though. While we have done our absolute best in making the contracts watertight, there might be unknown vulnerabilites. That\'s why LinxOTC is in a so called Beta phase. Please be aware of this and limit your risks. '"
      />
      <FaqItem
        :question="'What are the risks as a lender?'"
        :answer="'As a lender you ask for collateral, in the case that the borrower does not pay back the loan before it expires. The value of the collateral can change over time and at some point might become less valuable than the given loan. It is important to keep this in consideration while setting the duration and required amount of collateral for your loan.'"
      />
      <FaqItem
        :question="'What are the risks as a borrower?'"
        :answer="'A borrower can lose his collateral if he does not pay back the loan+interest before the epiry date of the loan. In this case the borrower will not only lose his collateral, but also his rating will be reset to 0 which could limit his options in taking loans in the future.'"
      />
      <FaqItem
        :question="'Can a loan get liquidated?'"
        :answer="'As there is no price oracle used to track the value of the collateral, there is no way that a loan can get liquidated before the exiration date of the loan. After the expiration date the lender can liquidate the loan and take posession of the collateral.'"
      />
      <FaqItem
        :question="'Can I use the app on a mobile phone?'"
        :answer="'Yes, in your mobile browser you can connect to your wallet through WalletConnect.'"
      />
      <FaqItem
        :question="'Is there a fee involved in lending?'"
        :answer="'Yes, when a new loan is created and paid out to the borrower, a fee of 2% is deducted from the loan. Let\'s say a borrower takes on a loan of 100 ALPH he will get paid out 98 ALPH. Before the expiration date though, the borrower would need to pay back the full amount (100 ALPH) + interest.'"
      />
      <FaqItem
        :question="'Is there a fee involved on trading?'"
        :answer="'Yes, on every trade there is a 1% total fee taken, 0.5% per trader. If the trade would be 100 ALPH for 300 USDT, the payout would be 99.5 ALPH and 298.5 USDT'"
      />
      <FaqItem
        :question="'I have some idea\'s to improve LinxOTC where can I share them?'"
        :answer="'We appreciate all the feedback we can get, feel free to come and chat in our Discord server or on Telegram.'"
      />
    </div>
  </div>
</template>
