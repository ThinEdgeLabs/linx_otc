import {
  ALPH_TOKEN_ID,
  ZERO_ADDRESS,
  addressFromContractId,
  contractIdFromAddress,
  waitForTxConfirmation,
  web3
} from '@alephium/web3'
import { getSigners, randomContractId } from '@alephium/web3-test'
import { LendingMarketplaceHelper } from '../../shared/lending-marketplace'
import { balanceOf, deployTestToken, expandTo18Decimals, getToken } from '../../shared/utils'
import { LendingMarketplace, LendingMarketplaceInstance, LendingOffer, LendingOfferInstance } from '../../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

describe('LendingMarketplace', () => {
  let admin: PrivateKeyWallet
  let lendingTokenId: string
  let marketplaceHelper: LendingMarketplaceHelper
  let marketplaceInstance: LendingMarketplaceInstance
  let lender: PrivateKeyWallet
  let borrower: PrivateKeyWallet
  const group = 0
  const lendingAmount = expandTo18Decimals(10n)
  const collateralAmount = expandTo18Decimals(20n)
  const interestRate = 100n
  const duration = 30n

  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  beforeAll(async () => {
    ;[admin, lender, borrower] = await getSigners(3, expandTo18Decimals(100n), group)
    marketplaceHelper = new LendingMarketplaceHelper(admin)
    marketplaceInstance = (await marketplaceHelper.create()).contractInstance
    expect(marketplaceHelper.contractId).toBeDefined()
    lendingTokenId = await deployTestToken(admin)
    await getToken(lender, lendingTokenId, expandTo18Decimals(1000n))
  })

  describe('createLendingOffer', () => {
    it('should create a lending offer', async () => {
      const lender = (await admin.getSelectedAccount()).address
      const { txId } = await marketplaceHelper.createOffer(
        admin,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      await waitForTxConfirmation(txId, 1, 1000)
      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const loanAddress = txDetails.generatedOutputs[0].address
      const loanId = Buffer.from(contractIdFromAddress(loanAddress)).toString('hex')
      const lendingMarketplaceContractEvents = await web3
        .getCurrentNodeProvider()
        .events.getEventsContractContractaddress(addressFromContractId(marketplaceHelper.contractId!), {
          start: 0,
          group: 0
        })
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
        addressFromContractId(marketplaceHelper.contractId!)
      ).fetchState()
      expect(marketplaceContractState.fields.totalLendingOffers).toEqual(1n)

      const lendingOffer = LendingOffer.at(addressFromContractId(loanId))
      const lendingOfferState = await lendingOffer.fetchState()
      expect(lendingOfferState.fields).toEqual({
        id: 0n,
        lender,
        lendingTokenId,
        collateralTokenId: ALPH_TOKEN_ID,
        marketplaceContractId: marketplaceHelper.contractId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        borrower: ZERO_ADDRESS,
        loanTimeStamp: 0n
      })
      expect(lendingOfferState.asset.tokens).toEqual([{ id: lendingTokenId, amount: lendingAmount }])
    })
  })

  describe('cancel offer', () => {
    const provider = web3.getCurrentNodeProvider()
    const startingAlphBalance = expandTo18Decimals(1000n)

    it('destroys the contract', async () => {
      expect(marketplaceHelper.contractId).toBeDefined()

      const { txId } = await marketplaceHelper.createOffer(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      expect(await balanceOf(lendingTokenId, lender.address)).toEqual(startingAlphBalance - lendingAmount)

      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address

      await marketplaceHelper.cancelOffer(lender, lendingOfferAddress)

      expect(await balanceOf(lendingTokenId, lender.address)).toBeGreaterThan(0n)
      await expect(new LendingOfferInstance(lendingOfferAddress).fetchState()).rejects.toThrow(Error)
    })

    it('only the lender can cancel it', async () => {
      const { txId } = await marketplaceHelper.createOffer(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      await waitForTxConfirmation(txId, 1, 1000)
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address
      await expect(marketplaceHelper.cancelOffer(borrower, lendingOfferAddress)).rejects.toThrow(Error)
    })

    it('an already taken offer cannot be cancelled', async () => {
      const { txId } = await marketplaceHelper.createOffer(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const loanId = txDetails.generatedOutputs[0].address
      const { txId: takeOfferTxId } = await marketplaceHelper.borrow(borrower, loanId, ALPH_TOKEN_ID, collateralAmount)
      await waitForTxConfirmation(takeOfferTxId, 1, 1000)
      await expect(marketplaceHelper.cancelOffer(lender, loanId)).rejects.toThrow(Error)
    })
  })

  describe('borrow', () => {
    it('fee is not paid if the borrowed token is not among the fee tokens', async () => {
      let { txId } = await marketplaceHelper.createOffer(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const balanceBefore = await balanceOf(lendingTokenId, borrower.address)
      txId = (
        await marketplaceHelper.borrow(borrower, txDetails.generatedOutputs[0].address, ALPH_TOKEN_ID, collateralAmount)
      ).txId
      expect(await balanceOf(lendingTokenId, borrower.address)).toEqual(balanceBefore + lendingAmount)
    })
    it('borrower receives the tokens and fee is paid to the marketplace', async () => {
      await marketplaceHelper.addFeeToken(admin, lendingTokenId)
      let { txId } = await marketplaceHelper.createOffer(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )

      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const loanId = txDetails.generatedOutputs[0].address
      const loan = LendingOffer.at(loanId)
      const loanState = await loan.fetchState()
      const alphAmount = BigInt(loanState.asset.alphAmount)
      const balanceBefore = await balanceOf(lendingTokenId, borrower.address)
      txId = (
        await marketplaceHelper.borrow(borrower, txDetails.generatedOutputs[0].address, ALPH_TOKEN_ID, collateralAmount)
      ).txId
      const state = await marketplaceInstance.fetchState()
      const fee = (
        await LendingMarketplace.at(marketplaceInstance.address).view.calculateMarketplaceFee({
          args: {
            amount: lendingAmount,
            feeRateValue: state.fields.feeRate
          }
        })
      ).returns
      expect(state.asset.alphAmount).toEqual(fee)
      expect(await balanceOf(lendingTokenId, borrower.address)).toEqual(balanceBefore + lendingAmount - fee)
      const newLoanState = await loan.fetchState()
      expect(newLoanState.asset.alphAmount).toEqual(alphAmount + collateralAmount)
    })
  })

  describe('fee tokens', () => {
    const tokenId = randomContractId()

    test('only admin can add and remove a fee token', async () => {
      await expect(marketplaceHelper.addFeeToken(lender, tokenId)).rejects.toThrow(Error)
      await expect(marketplaceHelper.removeFeeToken(lender, tokenId)).rejects.toThrow(Error)
    })
    test('can add and remove a fee token', async () => {
      expect(
        (
          await LendingMarketplace.at(marketplaceInstance.address).view.isFeeToken({
            args: { tokenId: tokenId }
          })
        ).returns
      ).toBe(false)

      await marketplaceHelper.addFeeToken(admin, tokenId)

      expect(
        (
          await LendingMarketplace.at(marketplaceInstance.address).view.isFeeToken({
            args: { tokenId: tokenId }
          })
        ).returns
      ).toBe(true)

      await marketplaceHelper.removeFeeToken(admin, tokenId)

      expect(
        (
          await LendingMarketplace.at(marketplaceInstance.address).view.isFeeToken({
            args: { tokenId: tokenId }
          })
        ).returns
      ).toBe(false)
    })
  })
})
