import { ALPH_TOKEN_ID, ONE_ALPH, addressFromContractId, contractIdFromAddress, web3 } from '@alephium/web3'
import { getSigners, testNodeWallet } from '@alephium/web3-test'
import { LendingMarketplaceHelper } from '../../shared/lending-marketplace'
import { balanceOf, deployTestToken, expandTo18Decimals, getToken } from '../../shared/utils'
import { LendingMarketplaceInstance, LendingOffer, LendingOfferInstance } from '../../artifacts/ts'
import { waitTxConfirmed } from '@alephium/cli'
import { NodeWallet, PrivateKeyWallet } from '@alephium/web3-wallet'

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
    const { txId } = await marketplace.createOffer(
      signer,
      lendingTokenId,
      ALPH_TOKEN_ID,
      lendingAmount,
      collateralAmount,
      interestRate,
      duration
    )
    await waitTxConfirmed(provider, txId, 1, 1000)
    const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
    const loanAddress = txDetails.generatedOutputs[0].address
    const loanId = Buffer.from(contractIdFromAddress(loanAddress)).toString('hex')
    const lendingMarketplaceContractEvents = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(addressFromContractId(marketplace.contractId!), { start: 0, group: 0 })
    expect(lendingMarketplaceContractEvents.events.length).toEqual(2)
    const loanDetailsEventFields = lendingMarketplaceContractEvents.events[0].fields
    expect(loanDetailsEventFields[0].value).toEqual(loanId)
    expect(loanDetailsEventFields[1].value).toEqual(lendingTokenId)
    expect(loanDetailsEventFields[2].value).toEqual(ALPH_TOKEN_ID)
    expect(BigInt(+loanDetailsEventFields[3].value)).toEqual(lendingAmount)
    expect(BigInt(+loanDetailsEventFields[4].value)).toEqual(collateralAmount)
    expect(BigInt(+loanDetailsEventFields[5].value)).toEqual(interestRate)
    expect(BigInt(+loanDetailsEventFields[6].value)).toEqual(duration)
    expect(loanDetailsEventFields[7].value).toEqual(lender)

    const marketplaceContractState = await new LendingMarketplaceInstance(
      addressFromContractId(marketplace.contractId!)
    ).fetchState()
    expect(marketplaceContractState.fields.totalLendingOffers).toEqual(1n)

    const lendingOffer = LendingOffer.at(addressFromContractId(loanId))
    const lendingOfferState = await lendingOffer.fetchState()
    expect(lendingOfferState.fields).toEqual({
      id: 0n,
      lender,
      lendingTokenId,
      collateralTokenId: ALPH_TOKEN_ID,
      marketplaceContractId: marketplace.contractId,
      lendingAmount,
      collateralAmount,
      interestRate,
      duration,
      borrower: lender,
      loanTimeStamp: 0n
    })
    expect(lendingOfferState.asset.tokens).toEqual([{ id: lendingTokenId, amount: lendingAmount }])
  })

  describe('cancel offer', () => {
    let lender: PrivateKeyWallet
    let borrower: PrivateKeyWallet
    const lendingAmount = expandTo18Decimals(10n)
    const collateralAmount = expandTo18Decimals(20n)
    const interestRate = 100n
    const duration = 30n
    const provider = web3.getCurrentNodeProvider()
    const startingAlphBalance = expandTo18Decimals(1000n)
    const group = 0

    beforeAll(async () => {
      web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
      ;[lender, borrower] = await getSigners(2, startingAlphBalance, group)
    })

    beforeEach(async () => {
      await getToken(lender, lendingTokenId, expandTo18Decimals(1000n))
    })

    it('destroys the contract', async () => {
      expect(marketplace.contractId).toBeDefined()

      const { txId } = await marketplace.createOffer(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      await waitTxConfirmed(provider, txId, 1, 1000)

      expect(await balanceOf(lendingTokenId, lender.address)).toEqual(startingAlphBalance - lendingAmount)

      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address

      const { txId: cancelOfferTxId } = await marketplace.cancelOffer(lender, lendingOfferAddress)
      await waitTxConfirmed(provider, cancelOfferTxId, 1, 1000)

      expect(await balanceOf(lendingTokenId, lender.address)).toBeGreaterThan(0n)
      await expect(new LendingOfferInstance(lendingOfferAddress).fetchState()).rejects.toThrow(Error)
    })

    it('only the lender can cancel it', async () => {
      const { txId } = await marketplace.createOffer(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      await waitTxConfirmed(provider, txId, 1, 1000)
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address
      await expect(marketplace.cancelOffer(borrower, lendingOfferAddress)).rejects.toThrow(Error)
    })

    it('an already taken offer cannot be cancelled', async () => {
      const { txId } = await marketplace.createOffer(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      await waitTxConfirmed(provider, txId, 1, 1000)
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const loanId = txDetails.generatedOutputs[0].address
      const balance = await balanceOf(ALPH_TOKEN_ID, borrower.address)
      console.log(`Borrower ALPH balance: ${balance}`)
      const { txId: takeOfferTxId } = await marketplace.takeOffer(borrower, loanId, ALPH_TOKEN_ID, collateralAmount)
      await waitTxConfirmed(provider, takeOfferTxId, 1, 1000)
      await expect(marketplace.cancelOffer(lender, loanId)).rejects.toThrow(Error)
    })
  })
})
