import {
  web3,
  TestContractParams,
  addressFromContractId,
  ONE_ALPH,
  contractIdFromAddress,
  binToHex,
  ContractState,
  ALPH_TOKEN_ID,
  DUST_AMOUNT,
  MINIMAL_CONTRACT_DEPOSIT
} from '@alephium/web3'
import { expectAssertionError, getSigners, randomContractId, testAddress } from '@alephium/web3-test'
import { LendingMarketplace, LendingMarketplaceTypes, LendingOfferTypes } from '../../artifacts/ts'
import { ContractFixture, createLendingMarketplace, createLendingOffer } from './fixtures'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { contractBalanceOf, contractBalanceOfAlph, defaultGasFee, expandTo18Decimals } from '../../shared/utils'
import { ZERO_ADDRESS } from '@alephium/web3'

async function testCreateLoan({
  fixture,
  lendingTokenId,
  lendingAmount,
  collateralTokenId,
  collateralAmount,
  interestRate,
  duration,
  lender
}: {
  fixture: ContractFixture<LendingMarketplaceTypes.Fields>
  lendingTokenId: string
  lendingAmount: bigint
  collateralTokenId: string
  collateralAmount: bigint
  interestRate: bigint
  duration: bigint
  lender: PrivateKeyWallet
}) {
  return LendingMarketplace.tests.createLendingOffer({
    initialFields: fixture.selfState.fields,
    address: fixture.address,
    existingContracts: fixture.dependencies,
    inputAssets: [
      {
        address: lender.address,
        asset: {
          alphAmount: MINIMAL_CONTRACT_DEPOSIT + defaultGasFee,
          tokens: [{ id: lendingTokenId, amount: lendingAmount }]
        }
      }
    ],
    testArgs: {
      lendingTokenId,
      collateralTokenId,
      lendingAmount,
      collateralAmount,
      interestRate,
      duration
    }
  })
}

describe('LendingMarketplace', () => {
  let lendingTokenId: string
  let collateralTokenId: string
  let lendingAmount: bigint
  let collateralAmount: bigint
  let interestRate: bigint
  let duration: bigint
  let fixture: ContractFixture<LendingMarketplaceTypes.Fields>
  let admin: PrivateKeyWallet
  let lender: PrivateKeyWallet
  let borrower: PrivateKeyWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    ;[admin, lender, borrower] = await getSigners(3, ONE_ALPH * 1000n, 0)
    fixture = createLendingMarketplace(admin.address)

    lendingTokenId = randomContractId()
    collateralTokenId = randomContractId()
    lendingAmount = 1000n * 10n ** 18n
    collateralAmount = 200n * 10n ** 18n
    interestRate = 2000n
    duration = 30n
  })

  describe('updateAdmin', () => {
    let testParamsFixture: TestContractParams<LendingMarketplaceTypes.Fields, { newAdmin: string }>
    let testContractId: string
    let testContractAddress: string

    beforeAll(async () => {
      testContractId = randomContractId()
      testContractAddress = addressFromContractId(testContractId)
      const [signer] = await getSigners(1, ONE_ALPH * 1000n, 0)

      testParamsFixture = {
        address: testContractAddress,
        initialFields: {
          lendingOfferTemplateId: randomContractId(),
          admin: testAddress,
          totalLendingOffers: 0n,
          feeRate: 100n,
          lendingEnabled: true
        },
        inputAssets: [{ address: testAddress, asset: { alphAmount: 10n ** 18n } }],
        testArgs: { newAdmin: signer.address }
      }
    })

    it('as admin', async () => {
      const testParams = testParamsFixture
      const testResult = await LendingMarketplace.tests.updateAdmin(testParams)

      const contractState = testResult.contracts[0] as LendingMarketplaceTypes.State
      expect(contractState.fields.admin).toEqual(testParams.testArgs.newAdmin)
      expect(testResult.events.length).toEqual(1)

      const event = testResult.events[0] as LendingMarketplaceTypes.AdminUpdatedEvent
      expect(event.name).toEqual('AdminUpdated')
      expect(event.fields.previous).toEqual(testAddress)
      expect(event.fields.new).toEqual(testParams.testArgs.newAdmin)
    })

    it('not as admin', async () => {
      const [notAdmin] = await getSigners(1, ONE_ALPH * 1000n, 0)
      const testParams = {
        ...testParamsFixture,
        inputAssets: [{ address: notAdmin.address, asset: { alphAmount: 10n ** 18n } }]
      }

      await expectAssertionError(
        LendingMarketplace.tests.updateAdmin(testParams),
        testContractAddress,
        Number(LendingMarketplace.consts.ErrorCodes.AdminAllowedOnly)
      )
    })
  })

  describe('updateFee', () => {
    it('updates the marketplace fee', async () => {
      const testResult = await LendingMarketplace.tests.updateFeeRate({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [{ address: admin.address, asset: { alphAmount: ONE_ALPH } }],
        testArgs: { value: 300n }
      })
      const marketplaceState = testResult.contracts[1] as ContractState<LendingMarketplaceTypes.Fields>
      expect(marketplaceState.fields.feeRate).toEqual(300n)
    })
    it('fails if not admin', async () => {
      const notAdmin = testAddress
      const testResult = LendingMarketplace.tests.updateFeeRate({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [{ address: notAdmin, asset: { alphAmount: ONE_ALPH } }],
        testArgs: { value: 300n }
      })
      await expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.AdminAllowedOnly)
      )
    })
  })

  describe('updateLendingEnabled', () => {
    it('updates the lending enabled flag', async () => {
      expect(fixture.selfState.fields.lendingEnabled).toEqual(true)
      const testResult = await LendingMarketplace.tests.updateLendingEnabled({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [{ address: admin.address, asset: { alphAmount: ONE_ALPH } }],
        testArgs: { value: false }
      })
      const marketplaceState = testResult.contracts[1] as ContractState<LendingMarketplaceTypes.Fields>
      expect(marketplaceState.fields.lendingEnabled).toEqual(false)
    })

    it('fails if not admin', async () => {
      const notAdmin = testAddress
      const testResult = LendingMarketplace.tests.updateLendingEnabled({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [{ address: notAdmin, asset: { alphAmount: ONE_ALPH } }],
        testArgs: { value: false }
      })
      await expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.AdminAllowedOnly)
      )
    })
  })

  describe('createLoan', () => {
    it('fails if lending amount is invalid', async () => {
      const lendingAmount = 0n
      const testResult = testCreateLoan({
        fixture,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      })
      expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.InvalidLendingAmount)
      )
    })
    it('fails if collateral amount is invalid', async () => {
      const collateralAmount = 0n
      const testResult = testCreateLoan({
        fixture,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      })
      expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.InvalidCollateralAmount)
      )
    })
    it('fails if interest rate is invalid', async () => {
      const interestRate = 0n
      const testResult = testCreateLoan({
        fixture,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      })
      expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.InvalidInterestRate)
      )
    })
    it('fails if duration is invalid', async () => {
      const duration = 0n
      const testResult = testCreateLoan({
        fixture,
        lendingTokenId,
        lendingAmount,
        collateralTokenId,
        collateralAmount,
        interestRate,
        duration,
        lender
      })
      expectAssertionError(testResult, fixture.address, Number(LendingMarketplace.consts.ErrorCodes.InvalidDuration))
    })

    it('creates a lending offer', async () => {
      const blockTimeStamp = Date.now()
      const totalLoans = 1n
      const testResult = await LendingMarketplace.tests.createLendingOffer({
        initialFields: { ...fixture.selfState.fields, totalLendingOffers: totalLoans },
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: ONE_ALPH * 2n, tokens: [{ id: lendingTokenId, amount: lendingAmount }] }
          }
        ],
        testArgs: {
          lendingTokenId,
          collateralTokenId,
          lendingAmount,
          collateralAmount,
          interestRate,
          duration
        },
        blockTimeStamp
      })

      expect(testResult.events.length).toEqual(3)
      const loanDetailsEvent = testResult.events.find(
        (e) => e.name === 'LoanDetails'
      ) as LendingMarketplaceTypes.LoanDetailsEvent
      expect(loanDetailsEvent.fields).toEqual({
        loanId: binToHex(contractIdFromAddress(testResult.returns)),
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender: lender.address
      })

      const loanCreatedEvent = testResult.events.find(
        (e) => e.name === 'LoanCreated'
      ) as LendingMarketplaceTypes.LoanCreatedEvent
      expect(loanCreatedEvent.fields).toEqual({
        loanId: binToHex(contractIdFromAddress(testResult.returns)),
        id: totalLoans,
        by: lender.address,
        timestamp: BigInt(blockTimeStamp)
      })

      const lendingOfferState = testResult.contracts[0] as ContractState<LendingOfferTypes.Fields>
      expect(lendingOfferState.fields).toEqual({
        id: totalLoans,
        lender: lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplaceContractId: fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower: ZERO_ADDRESS,
        loanTimeStamp: 0n
      })
      expect(contractBalanceOf(lendingOfferState, lendingTokenId)).toEqual(lendingAmount)
      const marketplaceState = testResult.contracts[2] as ContractState<LendingMarketplaceTypes.Fields>
      expect(marketplaceState.fields.totalLendingOffers).toEqual(totalLoans + 1n)
    })

    it('lending offers counter is incremented by one', async () => {
      const totalLoans = 1n
      const testResult = await LendingMarketplace.tests.createLendingOffer({
        initialFields: { ...fixture.selfState.fields, totalLendingOffers: totalLoans },
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: ONE_ALPH * 2n, tokens: [{ id: lendingTokenId, amount: lendingAmount }] }
          }
        ],
        testArgs: {
          lendingTokenId,
          collateralTokenId,
          lendingAmount,
          collateralAmount,
          interestRate,
          duration
        }
      })
      const marketplaceState = testResult.contracts[2] as ContractState<LendingMarketplaceTypes.Fields>
      expect(marketplaceState.fields.totalLendingOffers).toEqual(totalLoans + 1n)
    })

    it('fails if the interest calculation overflows', async () => {
      const testResult = LendingMarketplace.tests.createLendingOffer({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: ONE_ALPH * 2n, tokens: [{ id: lendingTokenId, amount: 1n << 255n }] }
          }
        ],
        testArgs: {
          lendingTokenId,
          collateralTokenId,
          lendingAmount: 1n << 255n,
          collateralAmount,
          interestRate,
          duration: 365n
        }
      })
      await expect(testResult).rejects.toThrow(Error)
    })
    it('fails if lending is disabled', async () => {
      const lendingEnabled = false
      const fixture = createLendingMarketplace(admin.address, undefined, undefined, lendingEnabled)
      const testResult = LendingMarketplace.tests.createLendingOffer({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: ONE_ALPH * 2n, tokens: [{ id: lendingTokenId, amount: 1n << 255n }] }
          }
        ],
        testArgs: {
          lendingTokenId,
          collateralTokenId,
          lendingAmount: 1n << 255n,
          collateralAmount,
          interestRate,
          duration: 365n
        }
      })
      expectAssertionError(testResult, fixture.address, Number(LendingMarketplace.consts.ErrorCodes.LendingDisabled))
    })
  })

  describe('cancelOffer', () => {
    it('cancels an existing offer', async () => {
      const offer = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        ZERO_ADDRESS,
        undefined,
        undefined,
        undefined,
        fixture
      )

      const testResult = await LendingMarketplace.tests.cancelOffer({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          loanId: offer.contractId
        }
      })
      const loanCancelledEvent = testResult.events.find(
        (e) => e.name === 'LoanCancelled'
      ) as LendingMarketplaceTypes.LoanCancelledEvent
      expect(loanCancelledEvent.fields.loanId).toEqual(offer.contractId)
      const contractDestroyedEvent = testResult.events.find((e) => e.name === 'ContractDestroyed')
      expect(contractDestroyedEvent?.fields['address']).toEqual(offer.address)
    })

    it('fails if caller is not the lender', async () => {
      const offer = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address,
        undefined,
        undefined,
        undefined,
        fixture
      )

      const testResult = LendingMarketplace.tests.cancelOffer({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: admin.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          loanId: offer.contractId
        }
      })
      expectAssertionError(testResult, fixture.address, Number(LendingMarketplace.consts.ErrorCodes.LenderAllowedOnly))
    })

    it('fails if offer does not exist', async () => {
      const offer = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address,
        undefined,
        undefined,
        undefined,
        fixture
      )

      const testResult = LendingMarketplace.tests.cancelOffer({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: admin.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          loanId: randomContractId()
        }
      })
      await expect(testResult).rejects.toThrow(Error)
    })
  })

  describe('borrow', () => {
    it('fails if borrower is the lender', async () => {
      const offer = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower.address,
        undefined,
        undefined,
        undefined,
        fixture
      )

      const testResult = LendingMarketplace.tests.borrow({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          offerId: offer.contractId
        }
      })
      await expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.LenderNotAllowed)
      )
    })

    it('fails if the offer does not exist', async () => {
      const offerId = randomContractId()
      const testResult = LendingMarketplace.tests.borrow({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          offerId
        }
      })
      const error = `[API Error] - VM execution error: Contract ${addressFromContractId(offerId)} does not exist`
      expect(testResult).rejects.toThrowError(error)
    })

    it('borrower receives tokens, collateral is locked, emits LoanAccepted event', async () => {
      const offer = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        ZERO_ADDRESS,
        undefined,
        undefined,
        { alphAmount: ONE_ALPH, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        fixture
      )
      const blockTimeStamp = Math.floor(Date.now())
      const testResult = await LendingMarketplace.tests.borrow({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: collateralTokenId, amount: collateralAmount }] }
          }
        ],
        testArgs: {
          offerId: offer.contractId
        },
        blockTimeStamp
      })
      const loanStartedEvent = testResult.events.find(
        (e) => e.name === 'LoanAccepted'
      ) as LendingMarketplaceTypes.LoanAcceptedEvent
      expect(loanStartedEvent.fields.loanId).toEqual(offer.contractId)
      expect(loanStartedEvent.fields.by).toEqual(borrower.address)
      expect(loanStartedEvent.fields.timestamp).toEqual(BigInt(blockTimeStamp))
      const contractBalance = testResult.txOutputs[0]
      expect(contractBalance.tokens![0]).toEqual({
        id: collateralTokenId,
        amount: collateralAmount
      })
      const borrowerBalance = testResult.txOutputs[1]
      expect(borrowerBalance.tokens![0]).toEqual({
        id: lendingTokenId,
        amount: lendingAmount
      })
    })
  })

  describe('paybackLoan', () => {
    it('emits LoanPaid event', async () => {
      const NOW = Math.floor(Date.now() / 1000)
      const offer = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower.address,
        undefined,
        BigInt(NOW),
        { alphAmount: ONE_ALPH, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        fixture
      )
      const interest = (lendingAmount * interestRate * duration) / 10000n
      const testResult = await LendingMarketplace.tests.paybackLoan({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: lendingTokenId, amount: lendingAmount + interest }] }
          }
        ],
        testArgs: {
          loanId: offer.contractId
        }
      })
      const loanPaidEvent = testResult.events.find(
        (e) => e.name === 'LoanPaid'
      ) as LendingMarketplaceTypes.LoanPaidEvent
      expect(loanPaidEvent.fields.loanId).toEqual(offer.contractId)
      const contractDestroyedEvent = testResult.events.find((e) => e.name === 'ContractDestroyed')
      expect(contractDestroyedEvent?.fields['address']).toEqual(offer.address)
    })

    it('fails if not borrower', async () => {
      const offer = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower.address,
        undefined,
        undefined,
        undefined,
        fixture
      )

      const testResult = LendingMarketplace.tests.paybackLoan({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: admin.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          loanId: offer.contractId
        }
      })
      await expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.BorrowerAllowedOnly)
      )
    })
    it('fails if loan does not exist', async () => {
      const randomOfferId = randomContractId()
      const testResult = LendingMarketplace.tests.paybackLoan({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [
          {
            address: admin.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          loanId: randomOfferId
        }
      })
      const errorMessage = `[API Error] - VM execution error: Contract ${addressFromContractId(randomOfferId)} does not exist`
      await expect(testResult).rejects.toThrowError(errorMessage)
    })
  })

  describe('liquidateLoan', () => {
    let marketplace: ContractFixture<LendingMarketplaceTypes.Fields>
    let admin: PrivateKeyWallet
    let lender: PrivateKeyWallet
    let borrower: PrivateKeyWallet

    beforeAll(async () => {
      ;[admin, lender, borrower] = await getSigners(3, ONE_ALPH * 1000n, 0)
      marketplace = createLendingMarketplace(admin.address)
    })

    it('emits LoanLiquidated event', async () => {
      const offer = createLendingOffer(
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
        { alphAmount: ONE_ALPH, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        marketplace
      )

      const testResult = await LendingMarketplace.tests.liquidateLoan({
        initialFields: marketplace.selfState.fields,
        address: marketplace.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: lender.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          loanId: offer.contractId
        }
      })

      const event = testResult.events.find(
        (e) => e.name == 'LoanLiquidated'
      ) as LendingMarketplaceTypes.LoanLiquidatedEvent
      expect(event.fields.loanId).toEqual(offer.contractId)
    })

    it('fails if caller is not lender', async () => {
      const offer = createLendingOffer(
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
        { alphAmount: ONE_ALPH, tokens: [{ id: collateralTokenId, amount: collateralAmount }] },
        marketplace
      )

      const testResult = LendingMarketplace.tests.liquidateLoan({
        initialFields: marketplace.selfState.fields,
        address: marketplace.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          loanId: offer.contractId
        }
      })
      expectAssertionError(
        testResult,
        marketplace.address,
        Number(LendingMarketplace.consts.ErrorCodes.LenderAllowedOnly)
      )
    })

    it('fails if loan does not exist', async () => {
      const testResult = LendingMarketplace.tests.liquidateLoan({
        initialFields: marketplace.selfState.fields,
        address: marketplace.address,
        existingContracts: marketplace.dependencies,
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          loanId: randomContractId()
        }
      })

      expect(testResult).rejects.toThrowError()
    })
  })

  describe('blockTimeStampInSeconds', () => {
    it('returns the current block timestamp in seconds', async () => {
      const timestamp = Date.now()
      const testResult = await LendingMarketplace.tests.blockTimeStampInSeconds({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
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
      const inputAmount = ONE_ALPH

      const result = await LendingMarketplace.tests.withdraw({
        initialFields: fixture.selfState.fields,
        initialAsset: { alphAmount: initialBalance },
        inputAssets: [{ address: admin.address, asset: { alphAmount: inputAmount } }],
        testArgs: {
          to: to,
          tokenId: ALPH_TOKEN_ID,
          amount: amount
        }
      })
      expect(contractBalanceOfAlph(result.contracts[0])).toEqual(initialBalance - amount)
      const output = result.txOutputs[0]
      expect(output.address).toEqual(to)
      expect(output.alphAmount).toEqual(inputAmount - defaultGasFee + amount)
      expect(output.tokens).toEqual([])
    })

    it('withdraws tokens from the contract to a diff address than caller', async () => {
      const randomTokenId = randomContractId()
      const initialTokenBalance = expandTo18Decimals(10)
      const initialAlphBalance = ONE_ALPH * 5n
      const inputAmount = ONE_ALPH * 2n
      const to = withdrawer.address
      const amount = expandTo18Decimals(5)
      const result = await LendingMarketplace.tests.withdraw({
        address: fixture.address,
        initialFields: fixture.selfState.fields,
        initialAsset: { alphAmount: initialAlphBalance, tokens: [{ id: randomTokenId, amount: initialTokenBalance }] },
        inputAssets: [{ address: admin.address, asset: { alphAmount: inputAmount } }],
        testArgs: {
          to: to,
          tokenId: randomTokenId,
          amount: amount
        }
      })
      expect(contractBalanceOf(result.contracts[0], randomTokenId)).toEqual(initialTokenBalance - amount)
      const tokenOutput = result.txOutputs[0]
      expect(tokenOutput.address).toEqual(to)
      expect(tokenOutput.alphAmount).toEqual(DUST_AMOUNT)
      expect(tokenOutput.tokens).toEqual([{ id: randomTokenId, amount: amount }])
      const alphOutput = result.txOutputs[1]
      expect(alphOutput.address).toEqual(admin.address)
      expect(alphOutput.alphAmount).toEqual(inputAmount - defaultGasFee - DUST_AMOUNT)
      expect(alphOutput.tokens).toEqual([])
    })

    it('fails if not admin', async () => {
      const to = withdrawer.address
      const result = LendingMarketplace.tests.withdraw({
        address: fixture.address,
        initialFields: fixture.selfState.fields,
        initialAsset: { alphAmount: ONE_ALPH * 2n },
        inputAssets: [{ address: withdrawer.address, asset: { alphAmount: ONE_ALPH } }],
        testArgs: {
          to: to,
          tokenId: ALPH_TOKEN_ID,
          amount: ONE_ALPH
        }
      })
      await expectAssertionError(result, fixture.address, Number(LendingMarketplace.consts.ErrorCodes.AdminAllowedOnly))
    })
  })
})
