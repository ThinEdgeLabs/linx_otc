import { ALPH_TOKEN_ID, MINIMAL_CONTRACT_DEPOSIT, NodeProvider, ONE_ALPH, web3 } from '@alephium/web3'
import { getSigners, randomContractId } from '@alephium/web3-test'
import { LendingMarketplaceHelper } from '../../shared/lending-marketplace'
import { balanceOf, deployTestToken, expandTo18Decimals, getToken } from '../../shared/utils'
import { LendingMarketplace, LendingMarketplaceInstance, LoanInstance } from '../../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

describe('LendingMarketplace', () => {
  let admin: PrivateKeyWallet
  let lendingTokenId: string
  let testTokenId: string
  let marketplaceHelper: LendingMarketplaceHelper
  let marketplaceInstance: LendingMarketplaceInstance
  let lender: PrivateKeyWallet
  let borrower: PrivateKeyWallet
  let provider: NodeProvider

  const group = 0
  const lendingAmount = expandTo18Decimals(10n)
  const collateralAmount = expandTo18Decimals(20n)
  const interestRate = 1000n // 10%
  const duration = 30n // 30 days
  const initialAlphBalance = ONE_ALPH * 100n
  const initialTokenBalance = expandTo18Decimals(1000n)

  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  beforeAll(async () => {
    ;[admin, lender, borrower] = await getSigners(3, initialAlphBalance, group)
    marketplaceHelper = new LendingMarketplaceHelper(admin)
    marketplaceInstance = (await marketplaceHelper.create()).contractInstance
    testTokenId = await deployTestToken(admin)
    lendingTokenId = testTokenId
    await getToken(lender, lendingTokenId, initialTokenBalance)
    provider = web3.getCurrentNodeProvider()
  })

  describe('createLoan', () => {
    it('should create a loan', async () => {
      const collateralTokenId = ALPH_TOKEN_ID
      const alphBalanceBefore = await balanceOf(ALPH_TOKEN_ID, lender.address)
      const tokenBalanceBefore = await balanceOf(lendingTokenId, lender.address)
      const { txId } = await marketplaceHelper.createLoan(
        lender,
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)

      const gasFee = BigInt(txDetails.unsigned.gasAmount) * BigInt(txDetails.unsigned.gasPrice)
      expect(await balanceOf(ALPH_TOKEN_ID, lender.address)).toEqual(
        alphBalanceBefore - MINIMAL_CONTRACT_DEPOSIT - gasFee
      )
      expect(await balanceOf(lendingTokenId, lender.address)).toEqual(tokenBalanceBefore - lendingAmount)

      const loanAddress = txDetails.generatedOutputs[0].address
      const contractBalance = await balanceOf(lendingTokenId, loanAddress)
      expect(contractBalance).toEqual(lendingAmount)
    })
  })

  describe('cancel loan', () => {
    it('destroys the contract', async () => {
      const { txId } = await marketplaceHelper.createLoan(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const loanAddress = txDetails.generatedOutputs[0].address

      const tokenBalanceBefore = await balanceOf(lendingTokenId, lender.address)
      const alphBalanceBefore = await balanceOf(ALPH_TOKEN_ID, lender.address)

      const { txId: cancelTxId } = await marketplaceHelper.cancelLoan(lender, loanAddress)
      const cancelTxDetails = await provider.transactions.getTransactionsDetailsTxid(cancelTxId)
      const gasFee = BigInt(cancelTxDetails.unsigned.gasAmount) * BigInt(cancelTxDetails.unsigned.gasPrice)

      expect(await balanceOf(lendingTokenId, lender.address)).toEqual(tokenBalanceBefore + lendingAmount)
      expect(await balanceOf(ALPH_TOKEN_ID, lender.address)).toEqual(
        alphBalanceBefore + MINIMAL_CONTRACT_DEPOSIT - gasFee
      )
      await expect(new LoanInstance(loanAddress).fetchState()).rejects.toThrow(Error)
    })

    it('only the lender can cancel it', async () => {
      const { txId } = await marketplaceHelper.createLoan(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const loanAddress = txDetails.generatedOutputs[0].address
      await expect(marketplaceHelper.cancelLoan(borrower, loanAddress)).rejects.toThrow(Error)
    })

    it('an already taken offer cannot be cancelled', async () => {
      const { txId } = await marketplaceHelper.createLoan(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const loanAddress = txDetails.generatedOutputs[0].address
      await marketplaceHelper.borrow(borrower, loanAddress, ALPH_TOKEN_ID, collateralAmount)
      await expect(marketplaceHelper.cancelLoan(lender, loanAddress)).rejects.toThrow(Error)
    })
  })

  describe('borrow', () => {
    it('fee is not paid if the borrowed token is not among the fee tokens', async () => {
      const { txId } = await marketplaceHelper.createLoan(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const loanAddress = txDetails.generatedOutputs[0].address
      const tokenBalanceBefore = await balanceOf(lendingTokenId, borrower.address)

      await marketplaceHelper.borrow(borrower, loanAddress, ALPH_TOKEN_ID, collateralAmount)

      expect(await balanceOf(lendingTokenId, borrower.address)).toEqual(tokenBalanceBefore + lendingAmount)
    })

    it('ALPH as collateral', async () => {
      await marketplaceHelper.addFeeToken(admin, lendingTokenId)
      const { txId: createLoanTxId } = await marketplaceHelper.createLoan(
        lender,
        lendingTokenId,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )

      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(createLoanTxId)
      const loanAddress = txDetails.generatedOutputs[0].address
      const tokenBalanceBefore = await balanceOf(lendingTokenId, borrower.address)
      const marketplaceBalanceBefore = await balanceOf(lendingTokenId, marketplaceInstance.address)
      await marketplaceHelper.borrow(borrower, txDetails.generatedOutputs[0].address, ALPH_TOKEN_ID, collateralAmount)

      const feeRate = (await LendingMarketplace.at(marketplaceInstance.address).view.getFeeRate()).returns
      const fee = (
        await LendingMarketplace.at(marketplaceInstance.address).view.calculateMarketplaceFee({
          args: {
            amount: lendingAmount,
            feeRateValue: feeRate
          }
        })
      ).returns
      expect(await balanceOf(lendingTokenId, marketplaceInstance.address)).toEqual(marketplaceBalanceBefore + fee)
      expect(await balanceOf(lendingTokenId, borrower.address)).toEqual(tokenBalanceBefore + lendingAmount - fee)
      expect(await balanceOf(ALPH_TOKEN_ID, loanAddress)).toEqual(collateralAmount + MINIMAL_CONTRACT_DEPOSIT)
    })

    it('collateral and borrowed tokens are both ALPH', async () => {
      await marketplaceHelper.addFeeToken(admin, ALPH_TOKEN_ID)
      const { txId: createLoanTxId } = await marketplaceHelper.createLoan(
        lender,
        ALPH_TOKEN_ID,
        ALPH_TOKEN_ID,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(createLoanTxId)
      const loanAddress = txDetails.generatedOutputs[0].address
      const borrowerBalanceBefore = await balanceOf(ALPH_TOKEN_ID, borrower.address)
      const marketplaceBalanceBefore = await balanceOf(ALPH_TOKEN_ID, marketplaceInstance.address)
      const { txId } = await marketplaceHelper.borrow(
        borrower,
        txDetails.generatedOutputs[0].address,
        ALPH_TOKEN_ID,
        collateralAmount
      )
      const borrowTxDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const gasFee = BigInt(borrowTxDetails.unsigned.gasAmount) * BigInt(borrowTxDetails.unsigned.gasPrice)
      const feeRate = (await LendingMarketplace.at(marketplaceInstance.address).view.getFeeRate()).returns
      const fee = (
        await LendingMarketplace.at(marketplaceInstance.address).view.calculateMarketplaceFee({
          args: {
            amount: lendingAmount,
            feeRateValue: feeRate
          }
        })
      ).returns
      expect(await balanceOf(ALPH_TOKEN_ID, marketplaceInstance.address)).toEqual(marketplaceBalanceBefore + fee)
      expect(await balanceOf(ALPH_TOKEN_ID, borrower.address)).toEqual(
        borrowerBalanceBefore - collateralAmount - gasFee + lendingAmount - fee
      )
      expect(await balanceOf(ALPH_TOKEN_ID, loanAddress)).toEqual(collateralAmount + MINIMAL_CONTRACT_DEPOSIT)
    })
    it('borrowed token is ALPH', async () => {
      const collateralTokenId = testTokenId
      const { txId: createLoanTxId } = await marketplaceHelper.createLoan(
        lender,
        ALPH_TOKEN_ID,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration
      )
      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(createLoanTxId)
      const loanAddress = txDetails.generatedOutputs[0].address

      const borrowerBalanceBefore = await balanceOf(ALPH_TOKEN_ID, borrower.address)
      const marketplaceBalanceBefore = await balanceOf(ALPH_TOKEN_ID, marketplaceInstance.address)

      const { txId } = await marketplaceHelper.borrow(borrower, loanAddress, collateralTokenId, collateralAmount)

      const feeRate = (await LendingMarketplace.at(marketplaceInstance.address).view.getFeeRate()).returns
      const fee = (
        await LendingMarketplace.at(marketplaceInstance.address).view.calculateMarketplaceFee({
          args: {
            amount: lendingAmount,
            feeRateValue: feeRate
          }
        })
      ).returns

      expect(await balanceOf(ALPH_TOKEN_ID, marketplaceInstance.address)).toEqual(marketplaceBalanceBefore + fee)

      const borrowTxDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const gasFee = BigInt(borrowTxDetails.unsigned.gasAmount) * BigInt(borrowTxDetails.unsigned.gasPrice)
      expect(await balanceOf(ALPH_TOKEN_ID, borrower.address)).toEqual(
        borrowerBalanceBefore - gasFee + lendingAmount - fee
      )
      expect(await balanceOf(collateralTokenId, loanAddress)).toEqual(collateralAmount)
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
