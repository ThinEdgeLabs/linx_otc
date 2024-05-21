import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Token } from '@/types'



export const useTokenStore = defineStore('tokens', () => {
  const tokens = ref<Array<Token>>([])

  async function initTokens(network: string) {
    try {
        const res = await fetch(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`)
        if (res.ok) {
            const tokensList = await res.json()
            for (const token of tokensList.tokens) {
                tokens.value.push({
                    symbol: token.symbol,
                    name: token.name,
                    contractId: token.id,
                    decimals: token.decimals,
                    logoUri: token.logoURI
                })
            }
        }
        // Add custom token not on the github repository
        if (network === 'testnet') {
            tokens.value.push({ 
                symbol: 'TST-1',
                name: 'TestToken-1',
                contractId: '2e18c64cc2d8aa88b7f0d9de7254f4f5283ec4ce1e94434b9a97c03266406901',
                decimals: 18,
                logoUri: '/images/tokens/nologo.png'
          })
        }
    } catch (error) {
        console.log('Unable to get tokens list', error)
    }
  }

  async function getTokens(network: string) {
    if (!tokens.value) {
        await initTokens(network)
    }
    return tokens.value
  }

  return { tokens, getTokens, initTokens }

})