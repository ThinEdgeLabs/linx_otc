export interface Token {
  symbol: string
  name: string
  contract: string
  decimals: number
}

export interface Activity {
  type: string
  id: number
  offerToken: Token['symbol']
  offerAmount: number
  interest?: number | undefined
  requestToken: Token['symbol']
  requestAmount: number
  status: string
  counterParty?: string | undefined
  txId?: string | undefined
  duration?: number | undefined
  remaining?: number | undefined
  created: number
}

export const tokens: Array<Token> = [
  {
    symbol: 'ALPH',
    name: 'Alephium',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'BERRY',
    name: 'Berry',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'BUBBLE',
    name: 'Bubble',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'CYXE',
    name: 'CYXE',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'DAI',
    name: 'DAI',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'JKL',
    name: 'Jekyll',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'NGU',
    name: 'Number Go Up',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'OGALF',
    name: 'OGAlf',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'PACA',
    name: 'ALPHPaca',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'TAIL',
    name: 'Montycoin',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'USDC',
    name: 'USDC',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'VIRL',
    name: 'Viral',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'VLAD',
    name: 'Vlad',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    contract: '0x000000',
    decimals: 18
  },
  {
    symbol: 'XAYIN',
    name: 'Ayin',
    contract: '0x000000',
    decimals: 18
  }
]
