import {
  web3,
  addressFromContractId,
  ONE_ALPH,
  contractIdFromAddress,
  binToHex,
  ALPH_TOKEN_ID,
  DUST_AMOUNT,
  MINIMAL_CONTRACT_DEPOSIT,
  InputAsset,
  Asset
} from '@alephium/web3'
import {
  expectAssertionError,
  getSigners,
  randomContractAddress,
  randomContractId,
  testAddress
} from '@alephium/web3-test'
import { LendingMarketplace, LendingMarketplaceTypes, LoanTypes, TestUpgradable } from '../../artifacts/ts'
import { ContractFixture, createLendingMarketplace, createLoan as createLoanFixture } from './fixtures'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import {
  contractBalanceOf,
  contractBalanceOfAlph,
  defaultGasFee,
  expandTo18Decimals,
  getContractState,
  getEvent,
  getOutput
} from '../../shared/utils'
import { ZERO_ADDRESS } from '@alephium/web3'

////////////////////////////////////
// -------- Test helpers -------- //
////////////////////////////////////

async function createLoan(
  marketplace: ContractFixture<LendingMarketplaceTypes.Fields>,
  lendingTokenId: string,
  lendingAmount: bigint,
  collateralTokenId: string,
  collateralAmount: bigint,
  interestRate: bigint,
  duration: bigint,
  lender: PrivateKeyWallet,
  blockTimeStamp?: number,
  initialFields?: LendingMarketplaceTypes.Fields,
  inputAssets?: InputAsset[]
) {
  const testArgs = { lendingTokenId, collateralTokenId, lendingAmount, collateralAmount, interestRate, duration }
  return LendingMarketplace.tests.createLoan({
    initialFields: initialFields ?? marketplace.selfState.fields,
    address: marketplace.address,
    existingContracts: marketplace.dependencies,
    inputAssets: inputAssets ?? [
      {
        address: lender.address,
        asset: {
          alphAmount: MINIMAL_CONTRACT_DEPOSIT + defaultGasFee,
          tokens: [{ id: lendingTokenId, amount: lendingAmount }]
        }
      }
    ],
    testArgs,
    blockTimeStamp
  })
}

async function cancelLoan(
  loanId: string,
  caller: PrivateKeyWallet,
  marketplace: ContractFixture<LendingMarketplaceTypes.Fields>,
  loan: ContractFixture<LoanTypes.Fields>
) {
  return LendingMarketplace.tests.cancelLoan({
    initialFields: marketplace.selfState.fields,
    address: marketplace.address,
    existingContracts: loan.states(),
    inputAssets: [{ address: caller.address, asset: { alphAmount: defaultGasFee } }],
    testArgs: { loanId }
  })
}

async function updateFee(
  marketplace: ContractFixture<LendingMarketplaceTypes.Fields>,
  newFee: bigint,
  caller: PrivateKeyWallet
) {
  return LendingMarketplace.tests.updateFeeRate({
    initialFields: marketplace.selfState.fields,
    address: marketplace.address,
    existingContracts: marketplace.dependencies,
    inputAssets: [{ address: caller.address, asset: { alphAmount: defaultGasFee } }],
    testArgs: { value: newFee }
  })
}

async function pauseLending(marketplace: ContractFixture<LendingMarketplaceTypes.Fields>, caller: PrivateKeyWallet) {
  return LendingMarketplace.tests.pauseLending({
    initialFields: marketplace.selfState.fields,
    address: marketplace.address,
    existingContracts: marketplace.dependencies,
    inputAssets: [{ address: caller.address, asset: { alphAmount: defaultGasFee } }]
  })
}

async function enableLending(
  marketplace: ContractFixture<LendingMarketplaceTypes.Fields>,
  caller: PrivateKeyWallet,
  initialFields?: LendingMarketplaceTypes.Fields
) {
  return LendingMarketplace.tests.enableLending({
    initialFields: initialFields ?? marketplace.selfState.fields,
    address: marketplace.address,
    existingContracts: marketplace.dependencies,
    inputAssets: [{ address: caller.address, asset: { alphAmount: defaultGasFee } }]
  })
}

async function borrow(
  marketplace: ContractFixture<LendingMarketplaceTypes.Fields>,
  loan: ContractFixture<LoanTypes.Fields>,
  borrower: PrivateKeyWallet,
  collateralTokenId: string,
  collateralAmount: bigint,
  loanId: string,
  blockTimeStamp?: number
) {
  return LendingMarketplace.tests.borrow({
    initialFields: marketplace.selfState.fields,
    address: marketplace.address,
    existingContracts: loan.states(),
    inputAssets: [
      {
        address: borrower.address,
        asset: {
          alphAmount: defaultGasFee + DUST_AMOUNT,
          tokens: [{ id: collateralTokenId, amount: collateralAmount }]
        }
      }
    ],
    testArgs: { loanId },
    blockTimeStamp
  })
}

async function repayLoan(
  marketplace: ContractFixture<LendingMarketplaceTypes.Fields>,
  loan: ContractFixture<LoanTypes.Fields>,
  inputAssets: InputAsset[],
  loanId: string
) {
  return LendingMarketplace.tests.repayLoan({
    initialFields: marketplace.selfState.fields,
    address: marketplace.address,
    existingContracts: loan.states(),
    inputAssets: inputAssets,
    testArgs: { loanId }
  })
}

async function liquidateLoan(
  marketplace: ContractFixture<LendingMarketplaceTypes.Fields>,
  loan: ContractFixture<LoanTypes.Fields>,
  caller: PrivateKeyWallet,
  loanId: string,
  blockTimeStamp?: number
) {
  return LendingMarketplace.tests.liquidateLoan({
    initialFields: marketplace.selfState.fields,
    address: marketplace.address,
    existingContracts: loan.states(),
    inputAssets: [{ address: caller.address, asset: { alphAmount: defaultGasFee } }],
    testArgs: { loanId },
    blockTimeStamp
  })
}

async function withdraw(
  marketplace: ContractFixture<LendingMarketplaceTypes.Fields>,
  initialAsset: Asset,
  caller: PrivateKeyWallet,
  tokenId: string,
  amount: bigint,
  to: string,
  inputAssets: InputAsset[] = [{ address: caller.address, asset: { alphAmount: defaultGasFee } }]
) {
  return LendingMarketplace.tests.withdraw({
    initialFields: marketplace.selfState.fields,
    initialAsset: initialAsset,
    address: marketplace.address,
    existingContracts: marketplace.dependencies,
    inputAssets: inputAssets,
    testArgs: { tokenId, amount, to }
  })
}

// -------- Test cases --------

describe('LendingMarketplace', () => {
  let lendingTokenId: string
  let collateralTokenId: string
  let lendingAmount: bigint
  let collateralAmount: bigint
  let interestRate: bigint
  let duration: bigint
  let marketplace: ContractFixture<LendingMarketplaceTypes.Fields>
  let admin: PrivateKeyWallet
  let notAdmin: PrivateKeyWallet
  let lender: PrivateKeyWallet
  let borrower: PrivateKeyWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    ;[admin, lender, borrower, notAdmin] = await getSigners(4, ONE_ALPH * 1000n, 0)
    marketplace = createLendingMarketplace(admin.address)

    lendingTokenId = randomContractId()
    collateralTokenId = randomContractId()
    lendingAmount = 1000n * 10n ** 18n
    collateralAmount = 200n * 10n ** 18n
    interestRate = 2000n // 20%
    duration = 30n
  })

  describe('updateFee', () => {
    it('marketplace fee is set', async () => {
      const oldFee = marketplace.selfState.fields.feeRate
      const newFee = 300n
      const testResult = await updateFee(marketplace, newFee, admin)
      const state = getContractState<LendingMarketplaceTypes.Fields>(
        testResult.contracts,
        marketplace.contractId
      )!.fields
      expect(oldFee).not.toEqual(newFee)
      expect(state.feeRate).toEqual(newFee)
    })
    it('fails if not admin', async () => {
      const testResult = updateFee(marketplace, 300n, notAdmin)
      await expectAssertionError(
        testResult,
        marketplace.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.Forbidden)
      )
    })
  })

  describe('pauseLending', () => {
    it('lending is paused', async () => {
      const testResult = await pauseLending(marketplace, admin)
      const state = getContractState<LendingMarketplaceTypes.Fields>(
        testResult.contracts,
        marketplace.contractId
      )!.fields
      expect(marketplace.selfState.fields.lendingEnabled).toEqual(true)
      expect(state.lendingEnabled).toEqual(false)
    })

    it('fails if not admin', async () => {
      const testResult = pauseLending(marketplace, notAdmin)
      await expectAssertionError(
        testResult,
        marketplace.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.Forbidden)
      )
    })
  })

  describe('enableLending', () => {
    it('lending is enabled', async () => {
      const testResult = await enableLending(marketplace, admin, {
        ...marketplace.selfState.fields,
        lendingEnabled: false
      })
      const state = getContractState<LendingMarketplaceTypes.Fields>(
        testResult.contracts,
        marketplace.contractId
      )!.fields
      expect(state.lendingEnabled).toEqual(true)
    })

    it('fails if not admin', async () => {
      const testResult = enableLending(marketplace, notAdmin)
      await expectAssertionError(
        testResult,
        marketplace.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.Forbidden)
      )
    })
  })

  describe('createLoan', () => {
    it('fails if lending amount is invalid', async () => {
      const lendingAmount = 0n
      const testResult = createLoan(
        marketplace,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      )
      expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.InvalidLendingAmount)
      )
    })
    it('fails if collateral amount is invalid', async () => {
      const collateralAmount = 0n
      const testResult = createLoan(
        marketplace,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      )
      expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.InvalidCollateralAmount)
      )
    })
    it('fails if interest rate is invalid', async () => {
      const interestRate = 0n
      const testResult = createLoan(
        marketplace,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      )
      expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.InvalidInterestRate)
      )
    })
    it('fails if duration is invalid', async () => {
      const duration = 0n
      const testResult = createLoan(
        marketplace,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      )
      expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.InvalidDuration)
      )
    })

    it('new loan is created', async () => {
      const blockTimeStamp = Date.now()
      const totalLoans = 1n
      const testResult = await createLoan(
        marketplace,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender,
        blockTimeStamp,
        { ...marketplace.selfState.fields, totalLoans: totalLoans }
      )
      const loanId = binToHex(contractIdFromAddress(testResult.returns))

      const loanDetailsEvent = getEvent(testResult.events, 'LoanDetails')
      expect(loanDetailsEvent.fields).toEqual({
        loanId: loanId,
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender: lender.address
      })

      const loanCreatedEvent = getEvent(testResult.events, 'LoanCreated')
      expect(loanCreatedEvent.fields).toEqual({
        loanId: loanId,
        id: totalLoans,
        by: lender.address,
        timestamp: BigInt(blockTimeStamp)
      })

      const loanState = getContractState(testResult.contracts, loanId)!
      expect(loanState.fields).toEqual({
        id: totalLoans,
        lender: lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplaceContractId: marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower: ZERO_ADDRESS,
        loanTimeStamp: 0n
      })
      expect(contractBalanceOf(loanState, lendingTokenId)).toEqual(lendingAmount)

      const marketplaceState = getContractState(testResult.contracts, marketplace.contractId)!
      expect(marketplaceState.fields.totalLoans).toEqual(totalLoans + 1n)
    })

    it('loans counter is incremented by one', async () => {
      const totalLoans = 3n
      const testResult = await createLoan(
        marketplace,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender,
        undefined,
        { ...marketplace.selfState.fields, totalLoans: totalLoans }
      )
      const marketplaceState = getContractState(testResult.contracts, marketplace.contractId)!
      expect(marketplaceState.fields.totalLoans).toEqual(totalLoans + 1n)
    })

    it('fails if the interest calculation overflows', async () => {
      const veryLargeLendingAmount = 1n << 255n
      const testResult = createLoan(
        marketplace,
        lendingTokenId,
        veryLargeLendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      )
      await expect(testResult).rejects.toThrow(Error)
    })
    it('fails if lending is disabled', async () => {
      const initialFields = { ...marketplace.selfState.fields, lendingEnabled: false }
      const testResult = createLoan(
        marketplace,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender,
        undefined,
        initialFields
      )
      expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.LendingDisabled)
      )
    })
  })

  describe('cancelLoan', () => {
    let loan: ContractFixture<LoanTypes.Fields>

    beforeAll(async () => {
      loan = createLoanFixture(
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
    })

    it('loan is cancelled', async () => {
      const testResult = await cancelLoan(loan.contractId, lender, marketplace, loan)
      expect(getEvent(testResult.events, 'LoanCancelled')?.fields.loanId).toEqual(loan.contractId)
      expect(getEvent(testResult.events, 'ContractDestroyed')?.fields.address).toEqual(loan.address)
    })

    it('fails if caller is not the lender', async () => {
      const testResult = cancelLoan(loan.contractId, admin, marketplace, loan)
      expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.LenderAllowedOnly)
      )
    })

    it('fails if loan does not exist', async () => {
      const randomLoanAddress = randomContractAddress()
      const randomLoanId = binToHex(contractIdFromAddress(randomLoanAddress))
      const testResult = cancelLoan(randomLoanId, lender, marketplace, loan)
      await expect(testResult).rejects.toThrowError(
        `[API Error] - VM execution error: Contract ${randomLoanAddress} does not exist`
      )
    })
  })

  describe('borrow', () => {
    let loan: ContractFixture<LoanTypes.Fields>

    beforeAll(async () => {
      loan = createLoanFixture(
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
        { alphAmount: ONE_ALPH, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        marketplace
      )
    })

    it('fails if borrower is the lender', async () => {
      const caller = lender
      const testResult = borrow(marketplace, loan, caller, collateralTokenId, collateralAmount, loan.contractId)
      await expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.LenderNotAllowed)
      )
    })

    it('fails if the loan does not exist', async () => {
      const loanId = randomContractId()
      const testResult = borrow(marketplace, loan, borrower, collateralTokenId, collateralAmount, loanId)
      const error = `[API Error] - VM execution error: Contract ${addressFromContractId(loanId)} does not exist`
      expect(testResult).rejects.toThrowError(error)
    })

    it('borrower receives tokens, collateral is transferred to contract, emits LoanAccepted event', async () => {
      const blockTimeStamp = Math.floor(Date.now())
      const testResult = await borrow(
        marketplace,
        loan,
        borrower,
        collateralTokenId,
        collateralAmount,
        loan.contractId,
        blockTimeStamp
      )

      const loanAcceptedEvent = getEvent(testResult.events, 'LoanAccepted')
      expect(loanAcceptedEvent.fields).toEqual({
        loanId: loan.contractId,
        by: borrower.address,
        timestamp: BigInt(blockTimeStamp)
      })

      const loanState = getContractState<LoanTypes.Fields>(testResult.contracts, loan.contractId)!
      expect(loanState.asset.tokens).toEqual([{ id: collateralTokenId, amount: collateralAmount }])
      expect(loanState.fields.loanTimeStamp).toEqual(BigInt(Math.floor(blockTimeStamp / 1000)))
      expect(loanState.fields.borrower).toEqual(borrower.address)

      const borrowerTxOutput = getOutput(testResult.txOutputs, 'AssetOutput', borrower.address)
      expect(borrowerTxOutput.tokens).toEqual([{ id: lendingTokenId, amount: lendingAmount }])
    })
  })

  describe('repayLoan', () => {
    let loan: ContractFixture<LoanTypes.Fields>
    const loanTimeStamp = BigInt(Math.floor(Date.now() / 1000))

    beforeAll(async () => {
      loan = createLoanFixture(
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
        loanTimeStamp,
        { alphAmount: MINIMAL_CONTRACT_DEPOSIT, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        marketplace
      )
    })
    it('emits LoanPaid event', async () => {
      const interest = (lendingAmount * interestRate) / 10000n
      const inputAssets = [
        {
          address: borrower.address,
          asset: {
            alphAmount: defaultGasFee + DUST_AMOUNT * 2n,
            tokens: [{ id: lendingTokenId, amount: lendingAmount + interest }]
          }
        }
      ]
      const testResult = await repayLoan(marketplace, loan, inputAssets, loan.contractId)

      const loanPaidEvent = getEvent<LendingMarketplaceTypes.LoanPaidEvent>(testResult.events, 'LoanPaid')
      expect(loanPaidEvent.fields.loanId).toEqual(loan.contractId)

      const contractDestroyedEvent = getEvent(testResult.events, 'ContractDestroyed')
      expect(contractDestroyedEvent.fields.address).toEqual(loan.address)

      // Borrower receives back the collateral
      const borrowerOutputs = testResult.txOutputs.filter((o) => o.address === borrower.address)
      expect(borrowerOutputs.find((o) => o.tokens && o.tokens[0].id === collateralTokenId)?.tokens).toEqual([
        { id: collateralTokenId, amount: collateralAmount }
      ])
      // Lender receives the lent amount plus the interest
      const lenderOutputs = testResult.txOutputs.filter((o) => o.address === lender.address)
      expect(lenderOutputs.find((o) => o.tokens && o.tokens[0].id === lendingTokenId)?.tokens).toEqual([
        { id: lendingTokenId, amount: lendingAmount + interest }
      ])
    })

    it('fails if not borrower', async () => {
      const inputAssets = [{ address: testAddress, asset: { alphAmount: defaultGasFee } }]
      const testResult = repayLoan(marketplace, loan, inputAssets, loan.contractId)
      await expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.BorrowerAllowedOnly)
      )
    })
    it('fails if loan does not exist', async () => {
      const inputAssets = [{ address: testAddress, asset: { alphAmount: defaultGasFee } }]
      const randomLoanId = randomContractId()
      const testResult = repayLoan(marketplace, loan, inputAssets, randomLoanId)
      const errorMessage = `[API Error] - VM execution error: Contract ${addressFromContractId(randomLoanId)} does not exist`
      await expect(testResult).rejects.toThrowError(errorMessage)
    })
  })

  describe('liquidateLoan', () => {
    let loan: ContractFixture<LoanTypes.Fields>

    beforeAll(async () => {
      loan = createLoanFixture(
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
        { alphAmount: MINIMAL_CONTRACT_DEPOSIT, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        marketplace
      )
    })

    it('emits LoanLiquidated event', async () => {
      const blockTimeStamp = Date.now()
      const testResult = await liquidateLoan(marketplace, loan, lender, loan.contractId, blockTimeStamp)
      const event = getEvent<LendingMarketplaceTypes.LoanLiquidatedEvent>(testResult.events, 'LoanLiquidated')
      expect(event.fields).toEqual({ loanId: loan.contractId, by: lender.address, timestamp: BigInt(blockTimeStamp) })
    })

    it('fails if caller is not lender', async () => {
      const testResult = liquidateLoan(marketplace, loan, borrower, loan.contractId)
      expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.LenderAllowedOnly)
      )
    })

    it('fails if loan does not exist', async () => {
      const testResult = liquidateLoan(marketplace, loan, lender, randomContractId())
      expect(testResult).rejects.toThrowError()
    })
  })

  describe('blockTimeStampInSeconds', () => {
    it('returns the current block timestamp in seconds', async () => {
      const timestamp = Date.now()
      const testResult = await LendingMarketplace.tests.blockTimeStampInSeconds({
        initialFields: marketplace.selfState.fields,
        address: marketplace.address,
        blockTimeStamp: timestamp
      })
      expect(testResult.returns).toEqual(BigInt(Math.floor(timestamp / 1000)))
    })
  })

  describe('widthdraw', () => {
    let withdrawer: PrivateKeyWallet

    beforeAll(async () => {
      ;[withdrawer] = await getSigners(1, ONE_ALPH * 1000n, 0)
    })

    it('withdraws ALPH from the contract to caller', async () => {
      const initialBalance = ONE_ALPH * 5n
      const amount = ONE_ALPH
      const to = admin.address
      const testResult = await withdraw(marketplace, { alphAmount: initialBalance }, admin, ALPH_TOKEN_ID, amount, to)

      const state = getContractState<LendingMarketplaceTypes.Fields>(testResult.contracts, marketplace.contractId)!
      expect(contractBalanceOfAlph(state)).toEqual(initialBalance - amount)

      const output = getOutput(testResult.txOutputs, 'AssetOutput', to)
      expect(output.address).toEqual(to)
      expect(output.alphAmount).toEqual(amount)
      expect(output.tokens).toEqual([])
    })

    it('withdraws tokens from the contract to a diff address than caller', async () => {
      const randomTokenId = randomContractId()
      const initialTokenBalance = expandTo18Decimals(10)
      const initialAlphBalance = ONE_ALPH * 5n
      const to = withdrawer.address
      const withdrawnAmount = expandTo18Decimals(5)
      const initialAsset = {
        alphAmount: initialAlphBalance,
        tokens: [{ id: randomTokenId, amount: initialTokenBalance }]
      }
      const inputAssets = [{ address: admin.address, asset: { alphAmount: defaultGasFee + DUST_AMOUNT } }]
      const result = await withdraw(marketplace, initialAsset, admin, randomTokenId, withdrawnAmount, to, inputAssets)

      const state = getContractState<LendingMarketplaceTypes.Fields>(result.contracts, marketplace.contractId)!
      expect(contractBalanceOf(state, randomTokenId)).toEqual(initialTokenBalance - withdrawnAmount)
      expect(contractBalanceOfAlph(state)).toEqual(initialAlphBalance)

      const tokenOutput = getOutput(result.txOutputs, 'AssetOutput', to)
      expect(tokenOutput.alphAmount).toEqual(DUST_AMOUNT)
      expect(tokenOutput.tokens).toEqual([{ id: randomTokenId, amount: withdrawnAmount }])
    })

    it('fails if not admin', async () => {
      const initialAsset = { alphAmount: ONE_ALPH * 5n }
      const result = withdraw(marketplace, initialAsset, notAdmin, ALPH_TOKEN_ID, ONE_ALPH, withdrawer.address)
      await expectAssertionError(result, marketplace.address, Number(TestUpgradable.consts.UpgradeErrorCodes.Forbidden))
    })
  })
})
