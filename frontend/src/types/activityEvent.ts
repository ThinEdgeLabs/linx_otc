import { Token } from '.'

export interface ActivityEvent {
  details: string
  timestamp: number
  txId: string
  tokens: Token[]
}
