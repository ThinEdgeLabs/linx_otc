import type { Token } from "./token"

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