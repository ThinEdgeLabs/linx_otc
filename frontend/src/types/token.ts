export interface Balance {
  balance: string
  balanceHint: string
}

export interface Token {
  symbol: string
  name: string
  contractId: string
  decimals: number
  logoUri: string
  balance?: Balance
}
