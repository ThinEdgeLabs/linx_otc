import type { Loan } from './stores/loans'

const oneDay = 24 * 60 * 60 * 1000

export const dummyLoans: Array<Loan> = [
  {
    loanId: 1,
    lender: 'someaccount',
    loanToken: 'ALPH',
    borrower: undefined,
    loanAmount: 100.0,
    interest: 10,
    collateralToken: 'AYIN',
    collateralAmount: 400,
    created: Date.now() - 10 * oneDay,
    startDate: Date.now() - 1 * oneDay,
    duration: 7,
    minRating: 0
  },
  {
    loanId: 2,
    lender: 'someaccount',
    loanToken: 'BERRY',
    borrower: undefined,
    loanAmount: 100.0,
    interest: 10,
    collateralToken: 'AYIN',
    collateralAmount: 400,
    created: Date.now() - 5 * oneDay,
    startDate: Date.now(),
    duration: 14,
    minRating: 0
  },
  {
    loanId: 3,
    lender: 'someaccount',
    loanToken: 'ALPH',
    borrower: undefined,
    loanAmount: 100.0,
    interest: 10,
    collateralToken: 'NGU',
    collateralAmount: 400,
    created: Date.now() - 3 * oneDay,
    startDate: Date.now(),
    duration: 90,
    minRating: 0
  },
  {
    loanId: 4,
    lender: 'someaccount',
    loanToken: 'USDC',
    borrower: undefined,
    loanAmount: 100.0,
    interest: 10,
    collateralToken: 'ALPH',
    collateralAmount: 400,
    created: Date.now() - 1 * oneDay,
    startDate: Date.now(),
    duration: 60,
    minRating: 0
  }
]
