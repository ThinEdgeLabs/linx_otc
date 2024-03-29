import {
  web3,
  Project,
  TestContractParams,
  addressFromContractId,
  ONE_ALPH,
  contractIdFromAddress,
  binToHex,
  ContractState,
} from '@alephium/web3'
import { expectAssertionError, getSigners, randomContractId, testAddress } from '@alephium/web3-test'
import { LendingMarketplace, LendingMarketplaceTypes, LendingOfferTypes } from '../../artifacts/ts'
import { ContractFixture, createLendingMarketplace, createLendingOffer } from './fixtures'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { contractBalanceOf } from '../../shared/utils'

describe('LendingMarketplace', () => {
  let testContractId: string
  let testContractAddress: string

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    await Project.build()
  })

  describe('updateAdmin', () => {
    let testParamsFixture: TestContractParams<LendingMarketplaceTypes.Fields, { newAdmin: string }>

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
          fee: 100n,
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
    let fixture: ContractFixture<LendingMarketplaceTypes.Fields>
    let admin: PrivateKeyWallet

    beforeAll(async () => {
      [admin] = await getSigners(1, ONE_ALPH * 1000n, 0)
      fixture = createLendingMarketplace(admin.address)
    })

    it('updates the marketplace fee', async () => {
      const testResult = await LendingMarketplace.tests.updateFee({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [{ address: admin.address, asset: { alphAmount: ONE_ALPH } }],
        testArgs: { newFee: 300n }
      })
      const marketplaceState = testResult.contracts[1] as ContractState<LendingMarketplaceTypes.Fields>
      expect(marketplaceState.fields.fee).toEqual(300n)
    })
    it('fails if not admin', async () => {
      const notAdmin = testAddress
      const testResult = LendingMarketplace.tests.updateFee({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [{ address: notAdmin, asset: { alphAmount: ONE_ALPH } }],
        testArgs: { newFee: 300n }
      })
      await expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.AdminAllowedOnly)
      )
    })
  })

  describe('updateLendingEnabled', () => {
    let fixture: ContractFixture<LendingMarketplaceTypes.Fields>
    let admin: PrivateKeyWallet

    beforeAll(async () => {
      [admin] = await getSigners(1, ONE_ALPH * 1000n, 0)
      fixture = createLendingMarketplace(admin.address)
    })

    it('updates the lending enabled flag', async () => {
      expect(fixture.selfState.fields.lendingEnabled).toEqual(true)
      const testResult = await LendingMarketplace.tests.updateLendingEnabled({
        initialFields: fixture.selfState.fields,
        address: fixture.address,
        existingContracts: fixture.dependencies,
        inputAssets: [{ address: admin.address, asset: { alphAmount: ONE_ALPH }}],
        testArgs: { enabled: false }
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
        inputAssets: [{ address: notAdmin, asset: { alphAmount: ONE_ALPH }}],
        testArgs: { enabled: false }
      })
      await expectAssertionError(
        testResult,
        fixture.address,
        Number(LendingMarketplace.consts.ErrorCodes.AdminAllowedOnly)
      )
    })
  })

  describe('createLendingOffer', () => {
    let fixture: ContractFixture<LendingMarketplaceTypes.Fields>
    let admin: PrivateKeyWallet
    let lender: PrivateKeyWallet

    let lendingTokenId: string
    let collateralTokenId: string
    let lendingAmount: bigint
    let collateralAmount: bigint
    let interestRate: bigint
    let duration: bigint

    beforeAll(async () => {
      [admin, lender] = await getSigners(2, ONE_ALPH * 1000n, 0)
      fixture = createLendingMarketplace(admin.address)
      lendingTokenId = randomContractId()
      collateralTokenId = randomContractId()
      lendingAmount = 1000n ** 18n
      collateralAmount = 200n * 10n ** 18n
      interestRate = 2000n
      duration = 30n
    })

    it('creates a lending offer', async () => {
      const testResult = await LendingMarketplace.tests.createLendingOffer({
        initialFields: fixture.selfState.fields,
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
      expect(testResult.events.length).toEqual(2)
      const offerCreatedEvent = testResult.events.find((e) => e.name === 'OfferCreated') as LendingMarketplaceTypes.OfferCreatedEvent
      expect(offerCreatedEvent.fields).toEqual({
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender: lender.address,
        lendingOfferContractId: binToHex(contractIdFromAddress(testResult.returns))
      })

      const lendingOfferState = testResult.contracts[0] as ContractState<LendingOfferTypes.Fields>
      expect(lendingOfferState.fields).toEqual({
        lender: lender.address,
        lendingTokenId,
        collateralTokenId,
        marketplaceContractId: fixture.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower: lender.address,
        loanTimeStamp: 0n
      })
      expect(contractBalanceOf(lendingOfferState, lendingTokenId)).toEqual(lendingAmount)
      const marketplaceState = testResult.contracts[2] as ContractState<LendingMarketplaceTypes.Fields>
      expect(marketplaceState.fields.totalLendingOffers).toEqual(1n)
    })

    it('lending offers counter is incremented by one', async () => {
      const testResult = await LendingMarketplace.tests.createLendingOffer({
        initialFields: { ...fixture.selfState.fields, totalLendingOffers: 1n },
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
      expect(marketplaceState.fields.totalLendingOffers).toEqual(2n)
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
      await expect(
        testResult,
      ).rejects.toThrow(Error)
    })
    it('fails if lending is disabled', async () => {
      const lendingEnabled = false
      const fixture = createLendingMarketplace(admin.address, undefined, lendingEnabled)
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
    let marketplace: ContractFixture<LendingMarketplaceTypes.Fields>
    let admin: PrivateKeyWallet
    let lender: PrivateKeyWallet

    let lendingTokenId: string
    let collateralTokenId: string
    let lendingAmount: bigint
    let collateralAmount: bigint
    let interestRate: bigint
    let duration: bigint

    beforeAll(async () => {
      [admin, lender] = await getSigners(2, ONE_ALPH * 1000n, 0)
      marketplace = createLendingMarketplace(admin.address)
      lendingTokenId = randomContractId()
      collateralTokenId = randomContractId()
      lendingAmount = 1000n ** 18n
      collateralAmount = 200n * 10n ** 18n
      interestRate = 2000n
      duration = 30n
    })

    it('cancels an existing offer', async () => {
      const offer = createLendingOffer(lender.address, lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address,
        undefined, marketplace)

      const testResult = await LendingMarketplace.tests.cancelOffer({
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
          offerId: offer.contractId
        }
      })
      const offerCancelledEvent = testResult.events.find((e) => e.name === 'OfferCancelled') as LendingMarketplaceTypes.OfferCancelledEvent
      expect(offerCancelledEvent.fields.offerId).toEqual(offer.contractId)
      const contractDestroyedEvent = testResult.events.find((e) => e.name === 'ContractDestroyed')
      expect(contractDestroyedEvent?.fields['address']).toEqual(offer.address)
    })

    it('fails if caller is not the lender', async () => {
      const offer = createLendingOffer(lender.address, lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address,
        undefined, marketplace)

      const testResult = LendingMarketplace.tests.cancelOffer({
        initialFields: marketplace.selfState.fields,
        address: marketplace.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: admin.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          offerId: offer.contractId
        }
      })
      expectAssertionError(testResult, marketplace.address, Number(LendingMarketplace.consts.ErrorCodes.LenderAllowedOnly))
    })

    it('fails if offer does not exist', async () => {
      const offer = createLendingOffer(lender.address, lendingTokenId,
        collateralTokenId,
        marketplace.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address,
        undefined, marketplace)

      const testResult = LendingMarketplace.tests.cancelOffer({
        initialFields: marketplace.selfState.fields,
        address: marketplace.address,
        existingContracts: offer.states(),
        inputAssets: [
          {
            address: admin.address,
            asset: { alphAmount: ONE_ALPH }
          }
        ],
        testArgs: {
          offerId: randomContractId()
        }
      })
      await expect(testResult).rejects.toThrow(Error)
    })
  })
})
