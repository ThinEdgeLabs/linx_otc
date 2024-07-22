import { web3, ONE_ALPH, ZERO_ADDRESS, InputAsset, Asset, MINIMAL_CONTRACT_DEPOSIT, DUST_AMOUNT } from '@alephium/web3'
import { expectAssertionError, getSigners, randomContractId, testAddress } from '@alephium/web3-test'
import { LendingMarketplaceTypes, Loan, LoanTypes } from '../../artifacts/ts'
import { ContractFixture, createLendingMarketplace, createLoan } from './fixtures'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import {
  contractBalanceOf,
  defaultGasFee,
  expandTo18Decimals,
  getContractState,
  getEvent,
  getOutput
} from '../../shared/utils'

// -------- Test helpers --------

async function getLender(loan: ContractFixture<LoanTypes.Fields>) {
  return Loan.tests.getLender({
    initialFields: loan.selfState.fields,
    initialAsset: loan.selfState.asset,
    address: loan.address,
    existingContracts: loan.dependencies
  })
}

async function getLendingTokenId(loan: ContractFixture<LoanTypes.Fields>) {
  return Loan.tests.getLendingTokenId({
    initialFields: loan.selfState.fields,
    initialAsset: loan.selfState.asset,
    address: loan.address,
    existingContracts: loan.dependencies
  })
}

async function calculateInterestPayment(loan: ContractFixture<LoanTypes.Fields>, loanTimeStamp: bigint) {
  return Loan.tests.calculateInterestPayment({
    initialFields: { ...loan.selfState.fields, loanTimeStamp },
    initialAsset: loan.selfState.asset,
    address: loan.address,
    existingContracts: loan.dependencies,
    testArgs: {
      currentBlockTimeStamp: BigInt(Math.floor(Date.now() / 1000)),
      loanTimestamp: loanTimeStamp,
      amount: loan.selfState.fields.lendingAmount,
      interest: loan.selfState.fields.interestRate,
      days: loan.selfState.fields.duration
    }
  })
}

async function borrow(
  loan: ContractFixture<LoanTypes.Fields>,
  borrower: PrivateKeyWallet,
  inputAssets: InputAsset[],
  initialAsset?: Asset,
  initialFields?: LoanTypes.Fields,
  blockTimeStamp?: number
) {
  return Loan.tests.borrow({
    initialFields: initialFields ?? loan.selfState.fields,
    initialAsset: initialAsset ?? {
      alphAmount: MINIMAL_CONTRACT_DEPOSIT,
      tokens: [{ id: loan.selfState.fields.lendingTokenId, amount: loan.selfState.fields.lendingAmount }]
    },
    inputAssets,
    callerAddress: loan.dependencies[1].address,
    testArgs: { caller: borrower.address },
    address: loan.address,
    existingContracts: loan.dependencies,
    blockTimeStamp
  })
}

async function cancel(loan: ContractFixture<LoanTypes.Fields>) {
  return Loan.tests.cancel({
    initialFields: loan.selfState.fields,
    initialAsset: {
      alphAmount: MINIMAL_CONTRACT_DEPOSIT,
      tokens: [{ id: loan.selfState.fields.lendingTokenId, amount: loan.selfState.fields.lendingAmount }]
    },
    inputAssets: [{ address: loan.selfState.fields.lender, asset: { alphAmount: defaultGasFee + DUST_AMOUNT } }],
    callerAddress: loan.dependencies[1].address,
    address: loan.address,
    existingContracts: loan.dependencies
  })
}

async function liquidate(loan: ContractFixture<LoanTypes.Fields>, initialFields?: LoanTypes.Fields) {
  return Loan.tests.liquidate({
    initialFields: initialFields ?? loan.selfState.fields,
    initialAsset: {
      alphAmount: MINIMAL_CONTRACT_DEPOSIT,
      tokens: [{ id: loan.selfState.fields.collateralTokenId, amount: loan.selfState.fields.collateralAmount }]
    },
    inputAssets: [
      {
        address: loan.selfState.fields.lender,
        asset: { alphAmount: defaultGasFee + DUST_AMOUNT }
      }
    ],
    address: loan.address,
    callerAddress: loan.dependencies[1].address,
    existingContracts: loan.dependencies
  })
}

async function repay(loan: ContractFixture<LoanTypes.Fields>, interest: bigint) {
  return Loan.tests.repay({
    initialFields: loan.selfState.fields,
    initialAsset: {
      alphAmount: MINIMAL_CONTRACT_DEPOSIT,
      tokens: [{ id: loan.selfState.fields.collateralTokenId, amount: loan.selfState.fields.collateralAmount }]
    },
    inputAssets: [
      {
        address: loan.selfState.fields.borrower,
        asset: {
          alphAmount: defaultGasFee + DUST_AMOUNT,
          tokens: [{ id: loan.selfState.fields.lendingTokenId, amount: loan.selfState.fields.lendingAmount + interest }]
        }
      }
    ],
    address: loan.address,
    callerAddress: loan.dependencies[1].address,
    existingContracts: loan.dependencies
  })
}

// -------- Test cases ----------

describe('LendingOffer', () => {
  let fixture: ContractFixture<LoanTypes.Fields>
  let marketplace: ContractFixture<LendingMarketplaceTypes.Fields>
  let admin: string
  let lender: PrivateKeyWallet
  let borrower: PrivateKeyWallet
  const lendingTokenId = randomContractId()
  const collateralTokenId = randomContractId()
  const lendingAmount = expandTo18Decimals(1000n)
  const collateralAmount = expandTo18Decimals(2000n)
  const interestRate = 2000n // 20%
  const duration = 30n // 30 days
  const feeRate: bigint = 100n

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    admin = testAddress
    marketplace = createLendingMarketplace(admin, feeRate)
    fixture = createLoan()
    ;[lender, borrower] = await getSigners(2, ONE_ALPH * 100n, 0)
  })

  it('getters', async () => {
    expect((await getLender(fixture)).returns).toEqual(fixture.selfState.fields.lender)
    expect((await getLendingTokenId(fixture)).returns).toEqual(fixture.selfState.fields.lendingTokenId)
  })

  describe('calculateInterestPayment', () => {
    it('returns the interest payment', async () => {
      const loanTimeStamp = Math.floor(Date.now() / 1000) - 86400 * 10 // 10 days old
      const testResult = await calculateInterestPayment(fixture, BigInt(loanTimeStamp))
      expect(testResult.returns).toEqual(66666666666666666666n)
    })
  })

  describe('borrow', () => {
    beforeAll(async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        ZERO_ADDRESS,
        undefined,
        0n,
        undefined,
        marketplace
      )
    })

    it('borrower provides collateral and receives the amount', async () => {
      const blockTimeStamp = Date.now()
      const loanTimeStamp = BigInt(Math.floor(blockTimeStamp / 1000))
      const inputAssets = [
        {
          address: borrower.address,
          asset: {
            alphAmount: defaultGasFee + DUST_AMOUNT,
            tokens: [{ id: collateralTokenId, amount: collateralAmount }]
          }
        }
      ]
      const testResult = await borrow(fixture, borrower, inputAssets, undefined, undefined, blockTimeStamp)

      expect(fixture.selfState.fields.loanTimeStamp).toBe(0n)
      const state = getContractState<LoanTypes.Fields>(testResult.contracts, fixture.contractId)
      expect(state.fields.borrower).toEqual(borrower.address)
      expect(state.fields.loanTimeStamp).toEqual(loanTimeStamp)
      expect(contractBalanceOf(state, lendingTokenId)).toEqual(0n)
      expect(contractBalanceOf(state, collateralTokenId)).toEqual(collateralAmount)

      const output = getOutput(testResult.txOutputs, 'AssetOutput', borrower.address)
      expect(output.tokens?.find((t) => t.id === lendingTokenId)?.amount).toEqual(lendingAmount)
    })

    it('fails if borrower provides less collateral', async () => {
      const providedCollateral = collateralAmount / 2n
      const inputAssets = [
        {
          address: borrower.address,
          asset: {
            alphAmount: defaultGasFee + DUST_AMOUNT,
            tokens: [{ id: collateralTokenId, amount: providedCollateral }]
          }
        }
      ]
      const testResult = borrow(fixture, borrower, inputAssets)
      expect(testResult).rejects.toThrowError()
    })

    it('fails if the loan is already active', async () => {
      const inputAssets = [
        {
          address: borrower.address,
          asset: {
            alphAmount: defaultGasFee + DUST_AMOUNT,
            tokens: [{ id: collateralTokenId, amount: collateralAmount }]
          }
        }
      ]
      const initialFields = { ...fixture.selfState.fields, borrower: borrower.address }
      const testResult = borrow(fixture, borrower, inputAssets, undefined, initialFields)

      expectAssertionError(testResult, fixture.address, Number(Loan.consts.ErrorCodes.LoanIsActive))
    })
  })

  describe('cancel', () => {
    it('contract is destroyed and lender receives back the funds', async () => {
      const testResult = await cancel(fixture)
      const output = getOutput(testResult.txOutputs, 'AssetOutput', lender.address)
      expect(output.tokens?.find((t) => t.id === lendingTokenId)?.amount).toEqual(lendingAmount)
      expect(getEvent(testResult.events, 'ContractDestroyed')).toBeDefined()
    })
  })

  describe('liquidate', () => {
    const ONE_DAY = 86400
    const NOW = Math.floor(Date.now() / 1000)

    beforeAll(async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower.address,
        undefined,
        undefined,
        undefined,
        marketplace
      )
    })

    it('lender receives collateral and loan is terminated', async () => {
      const unixTimeInPast = NOW - (ONE_DAY * Number(duration) + 1)
      const initialFields = { ...fixture.selfState.fields, loanTimeStamp: BigInt(unixTimeInPast) }
      const testResult = await liquidate(fixture, initialFields)

      expect(getEvent(testResult.events, 'ContractDestroyed')).toBeDefined()
      const output = getOutput(testResult.txOutputs, 'AssetOutput', lender.address)
      expect(output.tokens?.find((t) => t.id === collateralTokenId)?.amount).toEqual(collateralAmount)
    })

    it('fails if the loan is not overdue', async () => {
      const loanTimeStamp = NOW - ONE_DAY // 1 day old, duration is 30 days, so it's not overdue
      const initialFields = { ...fixture.selfState.fields, loanTimeStamp: BigInt(loanTimeStamp) }
      const testResult = liquidate(fixture, initialFields)
      expectAssertionError(testResult, fixture.address, Number(Loan.consts.ErrorCodes.LoanNotOverdue))
    })

    it('fails if loan is not active', async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        ZERO_ADDRESS,
        undefined,
        undefined,
        undefined,
        marketplace
      )
      const testResult = liquidate(fixture)
      expectAssertionError(testResult, fixture.address, Number(Loan.consts.ErrorCodes.LoanNotActive))
    })
  })

  describe('repay', () => {
    it('lender receives the token + interest, borrower gets the collateral and loan is terminated', async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower.address,
        undefined,
        undefined,
        undefined,
        marketplace
      )
      const interest = (lendingAmount * interestRate) / 10000n
      const testResult = await repay(fixture, interest)
      expect(getEvent(testResult.events, 'ContractDestroyed')).toBeDefined()

      const lenderReceives = getOutput(testResult.txOutputs, 'AssetOutput', lender.address)
      expect(lenderReceives.tokens?.find((t) => t.id === lendingTokenId)?.amount).toEqual(lendingAmount + interest)

      const borrowerReceives = getOutput(testResult.txOutputs, 'AssetOutput', borrower.address)
      expect(borrowerReceives.tokens?.find((t) => t.id === collateralTokenId)?.amount).toEqual(collateralAmount)
    })
  })
})
