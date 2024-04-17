import { ALPH_TOKEN_ID, ONE_ALPH, addressFromContractId, web3 } from "@alephium/web3"
import { getSigners, testNodeWallet } from "@alephium/web3-test"
import { LendingMarketplaceHelper } from "../../shared/lending-marketplace"
import { balanceOf, deployTestToken, expandTo18Decimals, getToken } from "../../shared/utils"
import { LendingMarketplaceInstance, LendingOffer, LendingOfferInstance } from "../../artifacts/ts"
import { waitTxConfirmed } from "@alephium/cli"
import { NodeWallet, PrivateKeyWallet } from "@alephium/web3-wallet"

describe('LendingMarketplace', () => {
  let signer: NodeWallet
  let lendingTokenId: string
  let marketplace: LendingMarketplaceHelper
  web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)

  beforeAll(async () => {
    signer = await testNodeWallet()
    marketplace = new LendingMarketplaceHelper(signer)
    await marketplace.buildProject()
    await marketplace.create()
    expect(marketplace.contractId).toBeDefined()
    console.log('LendingMarketplace contractId:', marketplace.contractId)
    lendingTokenId = await deployTestToken(signer)
  })

  it('should create a lending offer', async () => {
    const provider = web3.getCurrentNodeProvider()
    const address = (await signer.getSelectedAccount()).address

    const balance = await balanceOf(lendingTokenId, address)
    console.log(`Lender balance: ${balance}`)

    const lendingAmount = 1000n
    const collateralAmount = 2000n
    const interestRate = 100n
    const duration = 30n
    const lender = address
    const loanTimeStamp = BigInt(Math.floor(Date.now() / 1000))
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
      lendingTokenId,
      collateralTokenId: ALPH_TOKEN_ID,
      marketplaceContractId: marketplace.contractId,
      lendingAmount,
      collateralAmount,
      interestRate,
      duration,
      borrower: lender,
      loanTimeStamp
    })
    expect(lendingOfferState.asset.tokens).toEqual([
      { id: lendingTokenId, amount: lendingAmount },
    ])
  })

  describe('cancel offer', () => {
    let lender: PrivateKeyWallet
    let borrower: PrivateKeyWallet
    const lendingAmount = expandTo18Decimals(1000n)
    const collateralAmount = expandTo18Decimals(2000n)
    const interestRate = 100n
    const duration = 30n
    const provider = web3.getCurrentNodeProvider()
    const startingAlphBalance  = 1000n

    beforeAll(async () => {
      web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch);
      [lender] = await getSigners(1, ONE_ALPH * startingAlphBalance, 0);
      [borrower] = await getSigners(1, ONE_ALPH * 3000n, 0);
    })

    beforeEach(async () => {
      await getToken(lender, lendingTokenId, expandTo18Decimals(1000n))
    })

    it('destroys the contract', async () => {
      expect(marketplace.contractId).toBeDefined()
      console.log('LendingMarketplace contractId:', marketplace.contractId)

      const { txId } = await marketplace.createOffer(lender, lendingTokenId, ALPH_TOKEN_ID, lendingAmount, collateralAmount, interestRate, duration)
      await waitTxConfirmed(provider, txId, 1, 1000)

      expect(await balanceOf(lendingTokenId, lender.address)).toEqual(0n)

      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address

      const { txId: cancelOfferTxId } = await marketplace.cancelOffer(lender, lendingOfferAddress)
      await waitTxConfirmed(provider, cancelOfferTxId, 1, 1000)

      expect(await balanceOf(lendingTokenId, lender.address)).toBeGreaterThan(0n)
      await expect(new LendingOfferInstance(lendingOfferAddress).fetchState()).rejects.toThrow(Error)
    })

    it('only the lender can cancel it', async () => {
      const { txId } = await marketplace.createOffer(lender, lendingTokenId, ALPH_TOKEN_ID, lendingAmount, collateralAmount, interestRate, duration)
      await waitTxConfirmed(provider, txId, 1, 1000)
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address
      await expect(marketplace.cancelOffer(borrower, lendingOfferAddress)).rejects.toThrow(Error)
    })

    it('an already taken offer cannot be cancelled', async () => {
      const { txId } = await marketplace.createOffer(lender, lendingTokenId, ALPH_TOKEN_ID, lendingAmount, collateralAmount, interestRate, duration)
      await waitTxConfirmed(provider, txId, 1, 1000)
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address
      const { txId: takeOfferTxId} = await marketplace.takeOffer(borrower, lendingOfferAddress, ALPH_TOKEN_ID, collateralAmount)
      await waitTxConfirmed(provider, takeOfferTxId, 1, 1000)
      await expect(marketplace.cancelOffer(lender, lendingOfferAddress)).rejects.toThrow(Error)
    })
  })
})