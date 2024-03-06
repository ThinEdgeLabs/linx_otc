import type { Token } from '.'

export interface Loan {
  loanId: string
  lender: string
  borrower?: string
  loanToken: Token['symbol']
  loanAmount: bigint
  interest: bigint
  collateralToken: Token['symbol']
  collateralAmount: bigint
  created: number
  startDate?: number
  duration: bigint
  minRating?: number
}
