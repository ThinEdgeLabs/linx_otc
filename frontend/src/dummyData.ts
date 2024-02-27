import type { Activity } from '@/types'
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

export const dummyActivity: Array<Activity> = [
  {
    type: 'Loan',
    id: 8349,
    offerToken: 'ALPH',
    offerAmount: 1180.0,
    requestToken: 'USDC',
    requestAmount: 1500.0,
    interest: 55,
    status: 'Active',
    counterParty: '19tvYk2qzrSnb3SjVzqxE7EaybVrtxEGGpWYDC6dBcsMa',
    txId: undefined,
    duration: 60,
    remaining: 49,
    created: Date.now() - 10 * oneDay
  },
  {
    type: 'Trade',
    id: 1670,
    offerToken: 'ALPH',
    offerAmount: 750.0,
    requestToken: 'USDT',
    requestAmount: 1599.0,
    status: 'Open',
    counterParty: undefined,
    txId: undefined,
    duration: undefined,
    created: Date.now() - 1 * oneDay
  },
  {
    type: 'Trade',
    id: 1282,
    offerToken: 'DAI',
    offerAmount: 600.0,
    requestToken: 'ALPH',
    requestAmount: 298.0,
    status: 'Pending',
    counterParty: '5X3KS23ed2d32d2393jd0223d2saqq3WALQ9',
    txId: undefined,
    duration: undefined,
    created: Date.now() - 2 * oneDay
  },
  {
    type: 'Loan',
    id: 1234,
    offerToken: 'ALPH',
    offerAmount: 250.0,
    interest: 50,
    requestToken: 'ALPH',
    requestAmount: 260.0,
    status: 'Expired',
    counterParty: '5X3KS23ed2d32d2393jd0223d2saqq3WALQ9',
    txId: undefined,
    duration: 30,
    remaining: 0,
    created: Date.now() - 30 * oneDay
  }
]
