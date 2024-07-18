import { web3, ONE_ALPH, ContractState, ZERO_ADDRESS } from '@alephium/web3'
import { expectAssertionError, getSigners, randomContractId, testAddress } from '@alephium/web3-test'
import { LendingMarketplaceTypes, Loan, LoanTypes } from '../../artifacts/ts'
import { ContractFixture, createLendingMarketplace, createLoan } from './fixtures'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { contractBalanceOf, expandTo18Decimals } from '../../shared/utils'

describe('LendingOffer', () => {
  let fixture: ContractFixture<LoanTypes.Fields>
  let marketplace: ContractFixture<LendingMarketplaceTypes.Fields>
  let admin: string
  let lender: PrivateKeyWallet
  let borrower: PrivateKeyWallet
  let lendingTokenId: string
  let collateralTokenId: string
  let lendingAmount: bigint
  let collateralAmount: bigint
  let interestRate: bigint
  let duration: bigint
  const feeRate: bigint = 100n

  beforeAll(async () => {
    admin = testAddress
    marketplace = createLendingMarketplace(admin, feeRate)
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  })

  beforeEach(async () => {
    ;[lender, borrower] = await getSigners(2, ONE_ALPH * 100n, 0)
    lendingTokenId = randomContractId()
    collateralTokenId = randomContractId()
    lendingAmount = expandTo18Decimals(1000n)
    collateralAmount = expandTo18Decimals(2000n)
    interestRate = 2000n
    duration = 30n
  })

  it('getters', async () => {
    fixture = createLoan()
    const lenderResult = await Loan.tests.getLender({
      initialFields: fixture.selfState.fields,
      initialAsset: fixture.selfState.asset,
      address: fixture.address,
      existingContracts: fixture.dependencies
    })
    expect(lenderResult.returns).toEqual(fixture.selfState.fields.lender)

    const lendingTokenIdResult = await Loan.tests.getLendingTokenId({
      initialFields: fixture.selfState.fields,
      initialAsset: fixture.selfState.asset,
      address: fixture.address,
      existingContracts: fixture.dependencies
    })
    expect(lendingTokenIdResult.returns).toEqual(fixture.selfState.fields.lendingTokenId)
  })

  describe('calculateInterestPayment', () => {
    it('returns the interest payment', async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower.address
      )
      const loanTimeStamp = Math.floor(Date.now() / 1000) - 86400 * 10 // 10 days old
      const testResult = await Loan.tests.calculateInterestPayment({
        initialFields: { ...fixture.selfState.fields, loanTimeStamp: BigInt(loanTimeStamp) },
        initialAsset: fixture.selfState.asset,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        testArgs: {
          currentBlockTimeStamp: BigInt(Math.floor(Date.now() / 1000)),
          loanTimestamp: BigInt(loanTimeStamp),
          amount: fixture.selfState.fields.lendingAmount,
          interest: fixture.selfState.fields.interestRate,
          days: fixture.selfState.fields.duration
        }
      })
      expect(testResult.returns).toEqual(66666666666666666666n)
    })
  })

  describe('borrow', () => {
    it('borrower provides collateral and receives the amount', async () => {
      const loanTimeStamp = BigInt(Math.floor(Date.now() / 1000))

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
      expect(fixture.selfState.fields.loanTimeStamp).toBe(0n)
      const testResult = await Loan.tests.borrow({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: collateralTokenId, amount: collateralAmount }] }
          }
        ],
        callerAddress: marketplace.address,
        testArgs: { caller: borrower.address },
        address: fixture.address,
        existingContracts: fixture.dependencies
      })

      const state = testResult.contracts.find(
        (c) => c.contractId === fixture.contractId
      ) as ContractState<LoanTypes.Fields>
      expect(state.fields.borrower).toEqual(borrower.address)
      expect(contractBalanceOf(state, lendingTokenId)).toEqual(0n)
      expect(contractBalanceOf(state, collateralTokenId)).toEqual(collateralAmount)
      expect(state.fields.loanTimeStamp).toEqual(loanTimeStamp)
      expect(
        testResult.txOutputs.findIndex(
          (o) => o.address === borrower.address && o.tokens?.[0].amount === lendingAmount
        ) !== -1
      ).toBeTruthy()
    })

    it('fails if borrower provides less collateral', async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address
      )
      const providedCollateral = collateralAmount / 2n
      const testResult = Loan.tests.borrow({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: 10n ** 18n, tokens: [{ id: collateralTokenId, amount: providedCollateral }] }
          }
        ],
        testArgs: { caller: borrower.address },
        callerAddress: marketplace.address,
        address: fixture.address,
        existingContracts: fixture.dependencies
      })
      expect(testResult).rejects.toThrowError()
    })

    it('fails if the offer is already taken', async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        testAddress
      )
      const testResult = Loan.tests.borrow({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: 10n ** 18n, tokens: [{ id: collateralTokenId, amount: collateralAmount }] }
          }
        ],
        testArgs: { caller: borrower.address },
        callerAddress: marketplace.address,
        address: fixture.address,
        existingContracts: fixture.dependencies
      })

      expectAssertionError(testResult, fixture.address, Number(Loan.consts.ErrorCodes.LoanIsActive))
    })
  })

  describe('cancel', () => {
    it('cancels the offer', async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        ZERO_ADDRESS
      )

      const testResult = await Loan.tests.cancel({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: 10n ** 18n }
          }
        ],
        callerAddress: marketplace.address,
        address: fixture.address,
        existingContracts: fixture.dependencies
      })
      expect(testResult.events.find((e) => e.name === 'ContractDestroyed')).toBeDefined()
    })
  })

  describe('liquidate', () => {
    const ONE_DAY = 86400
    const NOW = Math.floor(Date.now() / 1000)

    it('lender receives collateral and loan is terminated', async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower.address
      )
      const unixTimeInPast = NOW - (ONE_DAY * Number(duration) + 1)
      const testResult = await Loan.tests.liquidate({
        initialFields: { ...fixture.selfState.fields, loanTimeStamp: BigInt(unixTimeInPast) },
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: 10n ** 18n }
          }
        ],
        address: fixture.address,
        callerAddress: marketplace.address,
        existingContracts: fixture.dependencies
      })

      expect(testResult.events.length).toEqual(1)
      expect(testResult.events.find((e) => e.name === 'ContractDestroyed')).toBeDefined()
      const receivedCollateral = testResult.txOutputs[0].tokens?.find((t) => t.id === collateralTokenId)
      expect(receivedCollateral?.amount).toEqual(collateralAmount)
    })

    it('fails if the loan is not overdue', async () => {
      fixture = createLoan(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower.address
      )
      const loanTimeStamp = NOW - ONE_DAY // 1 day old, duration is 30 days, so it's not overdue
      const testResult = Loan.tests.liquidate({
        initialFields: { ...fixture.selfState.fields, loanTimeStamp: BigInt(loanTimeStamp) },
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: 10n ** 18n }
          }
        ],
        address: fixture.address,
        callerAddress: marketplace.address,
        existingContracts: fixture.dependencies
      })
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
        ZERO_ADDRESS
      )
      const testResult = Loan.tests.liquidate({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: 10n ** 18n }
          }
        ],
        address: fixture.address,
        callerAddress: marketplace.address,
        existingContracts: fixture.dependencies
      })
      expectAssertionError(testResult, fixture.address, Number(Loan.consts.ErrorCodes.LoanNotActive))
    })
  })

  describe('payback', () => {
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
        borrower.address
      )
      const interestPayment = (lendingAmount * interestRate) / 10000n
      const paybackResult = await Loan.tests.payback({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: 10n ** 18n, tokens: [{ id: lendingTokenId, amount: lendingAmount + interestPayment }] }
          }
        ],
        address: fixture.address,
        callerAddress: marketplace.address,
        existingContracts: fixture.dependencies
      })
      expect(paybackResult.events.length).toEqual(1)
      expect(paybackResult.events.find((e) => e.name === 'ContractDestroyed')).toBeDefined()

      const lenderReceives = paybackResult.txOutputs.filter((o) => o.address === lender.address)
      expect(lenderReceives.map((o) => BigInt(o.alphAmount)).reduce((a, b) => a + b, 0n)).toEqual(ONE_ALPH)
      const lenderReceivesTokens = lenderReceives[0].tokens?.find((t) => t.id === lendingTokenId)
      expect(lenderReceivesTokens?.amount).toBeGreaterThanOrEqual(lendingAmount + interestPayment)
      const borrowerReceives = paybackResult.txOutputs.filter((o) => o.address === borrower.address)
      const returnedCollateral = borrowerReceives[0].tokens![0]
      expect(returnedCollateral).toEqual({
        id: collateralTokenId,
        amount: collateralAmount
      })
    })
  })
})
