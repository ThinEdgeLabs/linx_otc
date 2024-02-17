import {
  web3,
  Project,
  TestContractParams,
  addressFromContractId,
  AssetOutput,
  DUST_AMOUNT,
  ONE_ALPH,
  subContractId,
  ContractState
} from '@alephium/web3'
import { expectAssertionError, getSigners, randomContractId, testAddress, testNodeWallet } from '@alephium/web3-test'
import { deployToDevnet } from '@alephium/cli'
import { LendingMarketplace, LendingMarketplaceTypes, LendingOffer, LendingOfferTypes } from '../../artifacts/ts'
import { ContractFixture, contractBalanceOf, createLendingOffer } from './fixtures'
import { create } from 'domain'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

describe('LendingOffer', () => {
  let testContractId: string
  let testContractAddress: string
  let sender: string
  let fixture: ContractFixture<LendingOfferTypes.Fields>

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    await Project.build()
  })

  beforeEach(async () => {
    sender = testAddress
    fixture = createLendingOffer()
  })

  it('getters', async () => {
    const lenderResult = await LendingOffer.tests.getLender({
      initialFields: fixture.selfState.fields,
      initialAsset: fixture.selfState.asset,
      address: fixture.address,
      existingContracts: fixture.dependencies
    })
    expect(lenderResult.returns).toEqual(fixture.selfState.fields.lender)

    const lendingTokenIdResult = await LendingOffer.tests.getLendingTokenId({
      initialFields: fixture.selfState.fields,
      initialAsset: fixture.selfState.asset,
      address: fixture.address,
      existingContracts: fixture.dependencies
    })
    expect(lendingTokenIdResult.returns).toEqual(fixture.selfState.fields.lendingTokenId)
  })

  describe('take', () => {
    let lender: PrivateKeyWallet
    let borrower: PrivateKeyWallet
    let lendingTokenId: string
    let collateralTokenId: string
    let lendingAmount: bigint
    let collateralAmount: bigint
    let interestRate: bigint
    let duration: bigint

    beforeAll(async () => {
      [lender, borrower] = await getSigners(2, ONE_ALPH * 1000n, 0)
      lendingTokenId = randomContractId()
      collateralTokenId = randomContractId()
      lendingAmount = 1000n ** 18n
      collateralAmount = 2000n ** 18n
      interestRate = 2000n
      duration = 30n
    })

    it('borrower provides collateral and receives the token', async () => {
      fixture = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address
      )

      const testResult = await LendingOffer.tests.take({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: 10n ** 18n, tokens: [{ id: collateralTokenId, amount: collateralAmount * 2n }] }
          }
        ],
        testArgs: { collateral: collateralAmount },
        address: fixture.address,
        existingContracts: fixture.dependencies
      })

      expect(testResult.events.length).toEqual(1)
      const offerTakenEvent = testResult.events[0] as LendingOfferTypes.OfferTakenEvent
      expect(offerTakenEvent.fields).toEqual({
        borrower: borrower.address,
        offerId: fixture.contractId
      })
      const state = testResult.contracts[0] as ContractState<LendingOfferTypes.Fields>
      expect(state.fields.borrower).toEqual(borrower.address)
      expect(contractBalanceOf(state, lendingTokenId)).toEqual(0n)
      expect(contractBalanceOf(state, collateralTokenId)).toEqual(collateralAmount)
    })

    it('fails if borrower provides less collateral', async () => {
      fixture = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address
      )
      const providedCollateral = collateralAmount / 2n
      const testResult = LendingOffer.tests.take({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: 10n ** 18n, tokens: [{ id: collateralTokenId, amount: providedCollateral }] }
          }
        ],
        testArgs: { collateral: providedCollateral },
        address: fixture.address,
        existingContracts: fixture.dependencies
      })
      expectAssertionError(testResult, fixture.address, Number(LendingOffer.consts.ErrorCodes.IncorrectCollateralAmount))
    })

    it('fails if the borrower provides more collateral', async () => {
      fixture = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lender.address
      )
      const providedCollateral = collateralAmount * 2n
      const testResult = LendingOffer.tests.take({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: 10n ** 18n, tokens: [{ id: collateralTokenId, amount: providedCollateral }] }
          }
        ],
        testArgs: { collateral: providedCollateral },
        address: fixture.address,
        existingContracts: fixture.dependencies
      })

      expectAssertionError(testResult, fixture.address, Number(LendingOffer.consts.ErrorCodes.IncorrectCollateralAmount))
    })

    it('fails if the offer is already taken', async () => {
      fixture = createLendingOffer(
        lender.address,
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        testAddress
      )
      const testResult = LendingOffer.tests.take({
        initialFields: fixture.selfState.fields,
        initialAsset: { ...fixture.selfState.asset, tokens: [{ id: lendingTokenId, amount: lendingAmount }] },
        inputAssets: [
          {
            address: borrower.address,
            asset: { alphAmount: 10n ** 18n, tokens: [{ id: collateralTokenId, amount: collateralAmount }] }
          }
        ],
        testArgs: { collateral: collateralAmount },
        address: fixture.address,
        existingContracts: fixture.dependencies
      })

      expectAssertionError(testResult, fixture.address, Number(LendingOffer.consts.ErrorCodes.NotTakenOfferOnly))
    })
  })

  // it('cancel', async () => {
  //   const marketContractId = randomContractId()
  //   console.log(fixture.selfState.fields)
  //   console.log(fixture.selfState.asset)
  //   const testResult = await LendingOffer.tests.cancel({
  //     initialFields: fixture.selfState.fields,
  //     initialAsset: fixture.selfState.asset,
  //     address: fixture.address,
  //     existingContracts: fixture.dependencies,
  //   })

  //   console.log(testResult)

  //   //expectAssertionError(testResult, fixture.address, Number(LendingOffer.consts.ErrorCodes.MarketplaceAllowedOnly))
  // })
})
