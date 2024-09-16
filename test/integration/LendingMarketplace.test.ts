import {
  ALPH_TOKEN_ID,
  DUST_AMOUNT,
  MINIMAL_CONTRACT_DEPOSIT,
  NodeProvider,
  SignerProvider,
  stringToHex,
  web3
} from '@alephium/web3'
import { getSigners, randomContractId } from '@alephium/web3-test'
import { LendingMarketplaceHelper } from '../../shared/lending-marketplace'
import {
  balanceOf,
  deployTestOracle,
  deployTestToken,
  expandTo18Decimals,
  getToken,
  setPrice
} from '../../shared/utils'
import {
  LendingMarketplace,
  LendingMarketplaceInstance,
  Loan,
  LoanInstance,
  OracleWrapperInstance,
  TestOracleInstance
} from '../../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { OracleHelper } from '../../shared/oracle_helper'

////////////////////////////////////
// -------- Test helpers -------- //
////////////////////////////////////

async function createLoan(
  marketplace: LendingMarketplaceHelper,
  signer: SignerProvider,
  lendingTokenId: string,
  collateralTokenId: string,
  canBeLiquidated: boolean,
  maximumLTV: bigint = 8000n,
  lendingAmount: bigint = expandTo18Decimals(10),
  collateralAmount: bigint = expandTo18Decimals(20),
  interestRate: bigint = 1000n,
  duration: bigint = 30n
) {
  const { txId } = await marketplace.createLoan(
    signer,
    lendingTokenId,
    collateralTokenId,
    lendingAmount,
    collateralAmount,
    interestRate,
    duration,
    canBeLiquidated
  )
  const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
  return txDetails.generatedOutputs[0].address
}

async function liquidateLoan(
  marketplace: LendingMarketplaceHelper,
  signer: SignerProvider,
  loanAddress: string,
  amount: bigint
) {
  const lendingTokenId = (await Loan.at(loanAddress).view.getLendingTokenId()).returns
  return marketplace.liquidateLoan(signer, loanAddress, lendingTokenId, amount)
}

async function borrow(marketplace: LendingMarketplaceHelper, signer: SignerProvider, loanAddress: string) {
  const collateralTokenId = (await Loan.at(loanAddress).view.getCollateralTokenId()).returns
  const collateralAmount = (await Loan.at(loanAddress).view.getCollateralAmount()).returns
  return marketplace.borrow(signer, loanAddress, collateralTokenId, collateralAmount)
}

async function calculateBorrowingFee(marketplaceInstance: LendingMarketplaceInstance, borrowedAmount: bigint) {
  const marketplace = LendingMarketplace.at(marketplaceInstance.address)
  const feeRate = (await marketplace.view.getBorrowingFee()).returns
  const fee = (await marketplace.view.calculateMarketplaceFee({ args: { amount: borrowedAmount, feeRate: feeRate } }))
    .returns
  return fee
}

////////////////////////////////////
// ------------ Tests ------------//
////////////////////////////////////

describe('LendingMarketplace', () => {
  let owner: PrivateKeyWallet
  let lendingTokenId: string
  let testTokenId: string
  let marketplaceHelper: LendingMarketplaceHelper
  let marketplaceInstance: LendingMarketplaceInstance
  let diaOracle: TestOracleInstance
  let oracleHelper: OracleHelper
  let oracle: OracleWrapperInstance
  let lender: PrivateKeyWallet
  let borrower: PrivateKeyWallet
  let liquidator: PrivateKeyWallet
  let provider: NodeProvider

  const group = 0
  const lendingAmount = expandTo18Decimals(10n)
  const collateralAmount = expandTo18Decimals(20n)
  const initialAlphBalance = expandTo18Decimals(200n)
  const initialTokenBalance = expandTo18Decimals(1000n)
  const alphUsdPair = stringToHex('ALPHUSD')
  const usdtUsdPair = stringToHex('USDTUSD')

  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  beforeAll(async () => {
    provider = web3.getCurrentNodeProvider()
    ;[owner, lender, borrower, liquidator] = await getSigners(4, initialAlphBalance, group)

    // Deploy test token
    testTokenId = await deployTestToken(owner)
    lendingTokenId = testTokenId
    await getToken(lender, lendingTokenId, initialTokenBalance)
    await getToken(liquidator, lendingTokenId, initialTokenBalance)

    // Deploy oracle contract
    diaOracle = (await deployTestOracle(owner)).contractInstance
    oracleHelper = new OracleHelper(owner)
    oracle = (await oracleHelper.deploy(diaOracle.contractId, owner)).contractInstance

    // Add oracle data for ALPHUSD pair
    await setPrice(diaOracle, alphUsdPair, BigInt(1.5 * 10 ** 8), BigInt(Date.now()), owner)
    await oracleHelper.addPair(oracle.address, ALPH_TOKEN_ID, { symbol: alphUsdPair, decimals: 8n }, owner)

    // Add oracle data for USDTUSD pair
    await setPrice(diaOracle, usdtUsdPair, BigInt(1.01 * 10 ** 8), BigInt(Date.now()), owner)
    await oracleHelper.addPair(oracle.address, testTokenId, { symbol: usdtUsdPair, decimals: 8n }, owner)

    // Deploy lending marketplace contract
    marketplaceHelper = new LendingMarketplaceHelper(owner)
    marketplaceInstance = (await marketplaceHelper.create(oracle.contractId)).contractInstance
  })

  describe('createLoan', () => {
    const collateralTokenId = ALPH_TOKEN_ID

    it('should create a loan', async () => {
      const tokenBalanceBefore = await balanceOf(lendingTokenId, lender.address)
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, collateralTokenId, false)
      const contractBalance = await balanceOf(lendingTokenId, loanAddress)
      expect(contractBalance).toEqual(lendingAmount)
      expect(await balanceOf(lendingTokenId, lender.address)).toEqual(tokenBalanceBefore - lendingAmount)
    })
    it('should fail when creating a loan that can be liquidated if oracle data is not available for both tokens', async () => {
      const liquidationEnabled = true
      await expect(
        createLoan(marketplaceHelper, lender, lendingTokenId, randomContractId(group), liquidationEnabled)
      ).rejects.toThrow()
    })
    it('should create a loan that can be liquidated if oracle data is available for both tokens', async () => {
      const liquidationEnabled = true
      const address = await createLoan(marketplaceHelper, lender, lendingTokenId, collateralTokenId, liquidationEnabled)
      const loanInstance = new LoanInstance(address)
      const state = await loanInstance.fetchState()
      expect(state.fields.canBeLiquidated).toBe(true)
    })
  })

  describe('cancel loan', () => {
    it('destroys the contract', async () => {
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, false)

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
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, false)
      const error = 'Error Code: 1' // LenderAllowedOnly
      await expect(marketplaceHelper.cancelLoan(borrower, loanAddress)).rejects.toThrow(error)
    })

    it('an already taken offer cannot be cancelled', async () => {
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, false)
      await marketplaceHelper.borrow(borrower, loanAddress, ALPH_TOKEN_ID, collateralAmount)
      await expect(marketplaceHelper.cancelLoan(lender, loanAddress)).rejects.toThrow(Error)
    })
  })

  describe('borrow', () => {
    it('fee is not paid if the borrowed token is not among the fee tokens', async () => {
      // Given
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, false)
      const tokenBalanceBefore = await balanceOf(lendingTokenId, borrower.address)

      // When
      await marketplaceHelper.borrow(borrower, loanAddress, ALPH_TOKEN_ID, collateralAmount)

      // Then
      expect(await balanceOf(lendingTokenId, borrower.address)).toEqual(tokenBalanceBefore + lendingAmount)
    })

    it('use ALPH as collateral', async () => {
      // Given
      await marketplaceHelper.addFeeToken(owner, lendingTokenId)
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, false)
      const tokenBalanceBefore = await balanceOf(lendingTokenId, borrower.address)
      const marketplaceBalanceBefore = await balanceOf(lendingTokenId, marketplaceInstance.address)
      const fee = await calculateBorrowingFee(marketplaceInstance, lendingAmount)

      // When
      await marketplaceHelper.borrow(borrower, loanAddress, ALPH_TOKEN_ID, collateralAmount)

      // Then
      expect(await balanceOf(lendingTokenId, marketplaceInstance.address)).toEqual(marketplaceBalanceBefore + fee)
      expect(await balanceOf(lendingTokenId, borrower.address)).toEqual(tokenBalanceBefore + lendingAmount - fee)
      expect(await balanceOf(ALPH_TOKEN_ID, loanAddress)).toEqual(collateralAmount + MINIMAL_CONTRACT_DEPOSIT)
    })

    it('collateral and borrowed tokens are both ALPH', async () => {
      // Given
      await marketplaceHelper.addFeeToken(owner, ALPH_TOKEN_ID)
      const loanAddress = await createLoan(marketplaceHelper, lender, ALPH_TOKEN_ID, ALPH_TOKEN_ID, false)
      const borrowerBalanceBefore = await balanceOf(ALPH_TOKEN_ID, borrower.address)
      const marketplaceBalanceBefore = await balanceOf(ALPH_TOKEN_ID, marketplaceInstance.address)
      const fee = await calculateBorrowingFee(marketplaceInstance, lendingAmount)

      // When
      const { txId } = await marketplaceHelper.borrow(borrower, loanAddress, ALPH_TOKEN_ID, collateralAmount)
      const borrowTxDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const gasFee = BigInt(borrowTxDetails.unsigned.gasAmount) * BigInt(borrowTxDetails.unsigned.gasPrice)

      // Then
      expect(await balanceOf(ALPH_TOKEN_ID, marketplaceInstance.address)).toEqual(marketplaceBalanceBefore + fee)
      expect(await balanceOf(ALPH_TOKEN_ID, borrower.address)).toEqual(
        borrowerBalanceBefore - collateralAmount - gasFee + lendingAmount - fee
      )
      expect(await balanceOf(ALPH_TOKEN_ID, loanAddress)).toEqual(collateralAmount + MINIMAL_CONTRACT_DEPOSIT)
    })
    it('borrowed token is ALPH', async () => {
      // Given
      const borrowerBalanceBefore = await balanceOf(ALPH_TOKEN_ID, borrower.address)
      const marketplaceBalanceBefore = await balanceOf(ALPH_TOKEN_ID, marketplaceInstance.address)
      const collateralTokenId = testTokenId
      const loanAddress = await createLoan(marketplaceHelper, lender, ALPH_TOKEN_ID, collateralTokenId, false)
      const fee = await calculateBorrowingFee(marketplaceInstance, lendingAmount)

      // When
      const { txId } = await marketplaceHelper.borrow(borrower, loanAddress, collateralTokenId, collateralAmount)

      // Then
      expect(await balanceOf(ALPH_TOKEN_ID, marketplaceInstance.address)).toEqual(marketplaceBalanceBefore + fee)
      const borrowTxDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const gasFee = BigInt(borrowTxDetails.unsigned.gasAmount) * BigInt(borrowTxDetails.unsigned.gasPrice)
      expect(await balanceOf(ALPH_TOKEN_ID, borrower.address)).toEqual(
        borrowerBalanceBefore - gasFee + lendingAmount - fee
      )
      expect(await balanceOf(collateralTokenId, loanAddress)).toEqual(collateralAmount)
    })
  })

  describe('liquidate', () => {
    test('fails if the loan is not active', async () => {
      // Given
      const canBeLiquidated = true
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, canBeLiquidated)

      // When
      const repayAmount = lendingAmount
      const promise = liquidateLoan(marketplaceHelper, liquidator, loanAddress, repayAmount)

      // Then
      const error = 'Error Code: 8'
      await expect(promise).rejects.toThrow(error)
    })
    test('fails if liquidation is not enabled for the loan', async () => {
      // Given
      const canBeLiquidated = false
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, canBeLiquidated)
      await borrow(marketplaceHelper, borrower, loanAddress)

      // When
      const repayAmount = lendingAmount
      const promise = liquidateLoan(marketplaceHelper, liquidator, loanAddress, repayAmount)

      // Then
      const error = 'Error Code: 11' // LoanCannotBeLiquidated
      await expect(promise).rejects.toThrow(error)
    })
    test('fails if the loan is healthy', async () => {
      // ALPH/USD = 1.5, USDT/USD = 1.01
      // Borrow 10 USDT, Collateral 20 ALPH
      // LTV = 33.6%, Max LTV = 80%

      // Given
      const canBeLiquidated = true
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, canBeLiquidated)
      await borrow(marketplaceHelper, borrower, loanAddress)

      // When
      const repayAmount = lendingAmount
      const promise = liquidateLoan(marketplaceHelper, liquidator, loanAddress, repayAmount)

      // Then
      const error = 'Error Code: 10' // LoanIsHealthy
      await expect(promise).rejects.toThrow(error)
    })

    test('borrow USDT against ALPH loan is partially liquidated', async () => {
      // ALPH/USD = 0.6, USDT/USD = 1
      // Borrow 10 USDT, Collateral 20 ALPH
      // LTV = 83.3%, Max LTV = 80%

      // Given
      const usdtPrice = BigInt(1 * 10 ** 8)
      const alphPrice = BigInt(0.6 * 10 ** 8)
      const canBeLiquidated = true
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, canBeLiquidated)
      await borrow(marketplaceHelper, borrower, loanAddress)
      await setPrice(diaOracle, alphUsdPair, alphPrice, BigInt(Date.now()), owner)
      await setPrice(diaOracle, usdtUsdPair, usdtPrice, BigInt(Date.now()), owner)
      const alphBalanceBefore = await balanceOf(ALPH_TOKEN_ID, liquidator.address)
      const usdtBalanceBefore = await balanceOf(lendingTokenId, lender.address)

      // When
      const repayAmount = 7954545454545454545n // in USDT
      const liquidatedCollateral = 13655303030303030301n // in ALPH, including fee
      const { txId } = await liquidateLoan(marketplaceHelper, liquidator, loanAddress, repayAmount)
      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const gasFee = BigInt(txDetails.unsigned.gasAmount) * BigInt(txDetails.unsigned.gasPrice)

      // Then
      // Loan collateral is updated
      expect((await Loan.at(loanAddress).view.getCollateralAmount()).returns).toEqual(
        collateralAmount - liquidatedCollateral
      )
      // Borrowed amount is updated
      expect((await Loan.at(loanAddress).view.getLendingAmount()).returns).toEqual(lendingAmount - repayAmount)
      // Liquidator receives collateral
      const alphBalanceAfter = await balanceOf(ALPH_TOKEN_ID, liquidator.address)
      expect(alphBalanceAfter).toEqual(alphBalanceBefore + liquidatedCollateral - gasFee - DUST_AMOUNT)
      // Lender is repaid
      const usdtBalanceAfter = await balanceOf(lendingTokenId, lender.address)
      expect(usdtBalanceAfter).toEqual(usdtBalanceBefore + repayAmount)
    })

    test('loan is completely liquidated', async () => {
      const usdtPrice = BigInt(1 * 10 ** 8)
      const alphPrice = BigInt(0.45 * 10 ** 8)
      const canBeLiquidated = true
      const loanAddress = await createLoan(marketplaceHelper, lender, lendingTokenId, ALPH_TOKEN_ID, canBeLiquidated)
      await borrow(marketplaceHelper, borrower, loanAddress)
      await setPrice(diaOracle, alphUsdPair, alphPrice, BigInt(Date.now()), owner)
      await setPrice(diaOracle, usdtUsdPair, usdtPrice, BigInt(Date.now()), owner)
      const alphBalanceBefore = await balanceOf(ALPH_TOKEN_ID, liquidator.address)
      const usdtBalanceBefore = await balanceOf(lendingTokenId, lender.address)

      // When
      const repayAmount = 8730000000000000000n // in USDT
      const liquidatedCollateral = 20000000000000000000n // in ALPH, including fee
      const { txId } = await liquidateLoan(marketplaceHelper, liquidator, loanAddress, repayAmount)
      const txDetails = await web3.getCurrentNodeProvider().transactions.getTransactionsDetailsTxid(txId)
      const gasFee = BigInt(txDetails.unsigned.gasAmount) * BigInt(txDetails.unsigned.gasPrice)

      // Then
      // Loan is destroyed
      await expect(new LoanInstance(loanAddress).fetchState()).rejects.toThrow(Error)
      // // Liquidator receives collateral
      const alphBalanceAfter = await balanceOf(ALPH_TOKEN_ID, liquidator.address)
      expect(alphBalanceAfter).toEqual(alphBalanceBefore + liquidatedCollateral - gasFee - DUST_AMOUNT)
      // Lender is repaid
      const usdtBalanceAfter = await balanceOf(lendingTokenId, lender.address)
      expect(usdtBalanceAfter).toEqual(usdtBalanceBefore + repayAmount)
    })
  })

  describe('fee tokens', () => {
    const tokenId = randomContractId()

    test('only owner can add and remove a fee token', async () => {
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

      await marketplaceHelper.addFeeToken(owner, tokenId)

      expect(
        (
          await LendingMarketplace.at(marketplaceInstance.address).view.isFeeToken({
            args: { tokenId: tokenId }
          })
        ).returns
      ).toBe(true)

      await marketplaceHelper.removeFeeToken(owner, tokenId)

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
