import { ALPH_TOKEN_ID, Project, addressFromContractId, web3 } from "@alephium/web3"
import { testNodeWallet } from "@alephium/web3-test"
import { LendingMarketplaceHelper } from "../../shared/lending-marketplace"
import { balanceOf, deployTestToken } from "../../shared/utils"
import { LendingMarketplaceInstance, LendingOffer } from "../../artifacts/ts"
import { waitTxConfirmed } from "@alephium/cli"


describe('LendingMarketplace', () => {
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should create a lending offer', async () => {
    const signer = await testNodeWallet()
    const provider = web3.getCurrentNodeProvider()
    const address = (await signer.getSelectedAccount()).address

    const marketplace = new LendingMarketplaceHelper(signer)
    await marketplace.buildProject()
    await marketplace.create()
    expect(marketplace.contractId).toBeDefined()
    console.log('LendingMarketplace contractId:', marketplace.contractId)

    const tokenId = await deployTestToken(signer)
    const balance = await balanceOf(tokenId, address)
    console.log(balance)

    const lendingTokenId = tokenId
    const lendingAmount = 1000n
    const collateralAmount = 2000n
    const interestRate = 100n
    const duration = 30n
    const lender = address
    const { txId } = await marketplace.createOffer(signer, lendingTokenId, ALPH_TOKEN_ID, lendingAmount, collateralAmount, interestRate, duration)
    await waitTxConfirmed(provider, txId, 1, 1000)

    const lendingMarketplaceContractEvents = await web3.getCurrentNodeProvider().events.getEventsContractContractaddress(
      addressFromContractId(marketplace.contractId!),
      { start: 0, group: 0 }
    )
    expect(lendingMarketplaceContractEvents.events.length).toEqual(1)
    const offerCreatedEventFields = lendingMarketplaceContractEvents.events[0].fields
    expect(offerCreatedEventFields[0].value).toEqual(lendingTokenId)
    expect(offerCreatedEventFields[1].value).toEqual(ALPH_TOKEN_ID)
    expect(BigInt(+offerCreatedEventFields[2].value)).toEqual(lendingAmount)
    expect(BigInt(+offerCreatedEventFields[3].value)).toEqual(collateralAmount)
    expect(BigInt(+offerCreatedEventFields[4].value)).toEqual(interestRate)
    expect(BigInt(+offerCreatedEventFields[5].value)).toEqual(duration)
    expect(offerCreatedEventFields[6].value).toEqual(lender)

    const marketplaceContractState = await new LendingMarketplaceInstance(addressFromContractId(marketplace.contractId!)).fetchState()
    expect(marketplaceContractState.fields.totalLendingOffers).toEqual(1n)

    const offerId = offerCreatedEventFields[7].value
    const lendingOffer = LendingOffer.at(addressFromContractId(offerId.toString()))
    const lendingOfferState = await lendingOffer.fetchState()
    expect(lendingOfferState.fields).toEqual({
      lender,
      lendingTokenId: tokenId,
      collateralTokenId: ALPH_TOKEN_ID,
      lendingAmount,
      collateralAmount,
      interestRate,
      duration,
      borrower: lender
    })
    expect(lendingOfferState.asset.tokens).toEqual([
      { id: lendingTokenId, amount: lendingAmount },
    ])
  })
})