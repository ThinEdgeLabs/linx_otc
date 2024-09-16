import { web3 } from '@alephium/web3'
import { TestLendingMarketplaceUtils } from '../../artifacts/ts'
import { TokenPrice } from '../../artifacts/ts/types'
import { expandTo18Decimals } from '../../shared/utils'

////////////////////////////////////
// -------- Test helpers -------- //
////////////////////////////////////

function normalizeAmount(amount: bigint, decimals: bigint) {
  return TestLendingMarketplaceUtils.tests.normalizeAmount({
    testArgs: { amount, decimals }
  })
}

function blockTimeStampInSeconds(blockTimeStamp: number) {
  return TestLendingMarketplaceUtils.tests.blockTimeStampInSeconds({
    blockTimeStamp: blockTimeStamp
  })
}

async function calculateLTV(
  collateralTokenAmount: bigint,
  collateralTokenPrice: TokenPrice,
  borrowedTokenAmount: bigint,
  borrowedTokenPrice: TokenPrice
) {
  return (
    await TestLendingMarketplaceUtils.tests.calculateLTV({
      testArgs: { collateralTokenAmount, collateralTokenPrice, borrowedTokenAmount, borrowedTokenPrice }
    })
  ).returns
}

async function calculateLiquidationAmount(collateralValue: bigint, loanValue: bigint, fee: bigint, ltvTarget: bigint) {
  return (
    await TestLendingMarketplaceUtils.tests.calculateLiquidationAmount({
      testArgs: { collateralValue, loanValue, fee, ltvTarget }
    })
  ).returns
}

////////////////////////////////////
// ----------- Tests ------------ //
////////////////////////////////////

describe('LendingMarketplaceUtils', () => {
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  })

  describe('normalizeAmount', () => {
    it('should return the normalized amount when decimals are less than 18', async () => {
      const amountDecimals = 8n
      const amount = 12345678n
      const testResult = await normalizeAmount(amount, amountDecimals)
      expect(testResult.returns).toEqual(123456780000000000n)
    })
    it('should return the same amount when decimals are 18', async () => {
      const amountDecimals = 18n
      const amount = 1234567890123456789n
      const testResult = await normalizeAmount(amount, amountDecimals)
      expect(testResult.returns).toEqual(amount)
    })
    it('should return the normalized amount when decimals are more than 18', async () => {
      const amountDecimals = 20n
      const amount = 1234567890123456789012n
      const testResult = await normalizeAmount(amount, amountDecimals)
      expect(testResult.returns).toEqual(12345678901234567890n)
    })
  })

  describe('blockTimeStampInSeconds', () => {
    it('returns the current block timestamp in seconds', async () => {
      const timestamp = Date.now()
      const testResult = await blockTimeStampInSeconds(timestamp)
      expect(testResult.returns).toEqual(BigInt(Math.floor(timestamp / 1000)))
    })
  })

  describe('calculateLTV', () => {
    it('should return the LTV if collateral value >= borrowed value', async () => {
      const borrowedAmount = expandTo18Decimals(1000n)
      const borrowedTokenPrice = { price: 100000000n, timestamp: BigInt(Date.now()), decimals: 8n }
      const collateralAmount = expandTo18Decimals(2000n)
      const collateralTokenPrice = { price: 150000000n, timestamp: BigInt(Date.now()), decimals: 8n }

      const ltv = await calculateLTV(collateralAmount, collateralTokenPrice, borrowedAmount, borrowedTokenPrice)

      // 1000 / 3000 = 0.33 -> 33% -> 33333 basis points
      expect(ltv).toEqual(3333n)
    })

    it('should return the LTV if collateral value < borrowed value', async () => {
      const borrowedAmount = expandTo18Decimals(1000n)
      const borrowedTokenPrice = { price: 100000000n, timestamp: BigInt(Date.now()), decimals: 8n }
      const collateralAmount = expandTo18Decimals(500n)
      const collateralTokenPrice = { price: 150000000n, timestamp: BigInt(Date.now()), decimals: 8n }

      const ltv = await calculateLTV(collateralAmount, collateralTokenPrice, borrowedAmount, borrowedTokenPrice)

      // 1000 / 500 * 1.5 = 1.33 -> 133% -> 13333 basis points
      expect(ltv).toEqual(13333n)
    })
  })

  describe('calculateLiquidationAmount', () => {
    it('should return the liquidation amount required to reach the LTV target', async () => {
      // Unhealthy loan - liquidation amount < collateral value
      // L = 100, C = 110, F = 300 (3%), T = 8000 (80%)
      // LTV = L / C = 100 / 110 = 90.91% > 80%
      let loanValue = expandTo18Decimals(100n)
      let collateralValue = expandTo18Decimals(110n)
      let liquidationFee = 300n
      let ltvTarget = 8000n
      let liquidationAmount = await calculateLiquidationAmount(collateralValue, loanValue, liquidationFee, ltvTarget)
      expect(liquidationAmount).toEqual(68181818181818181818n)

      // Unhealthy loan - liquidation amount > collateral value
      // L = 100, C = 100, F = 300 (3%), T = 8000 (80%)
      // LTV = L / C = 100 / 100 = 100% > 80%
      loanValue = expandTo18Decimals(100n)
      collateralValue = expandTo18Decimals(100n)
      liquidationFee = 300n
      ltvTarget = 8000n
      liquidationAmount = await calculateLiquidationAmount(collateralValue, loanValue, liquidationFee, ltvTarget)
      expect(liquidationAmount).toEqual(113636363636363636363n)

      // Unhealthy loan - liquidation amount = collateral value
      // L = 107.36, C = 110, F = 300 (3%), T = 8000 (80%)
      // LTV = L / C = 107.36 / 110 = 97.6% > 80%
      loanValue = BigInt(107.36 * 10 ** 18)
      collateralValue = expandTo18Decimals(110n)
      liquidationFee = 300n
      ltvTarget = 8000n
      liquidationAmount = await calculateLiquidationAmount(collateralValue, loanValue, liquidationFee, ltvTarget)
      expect(liquidationAmount).toEqual(collateralValue)

      loanValue = expandTo18Decimals(11)
      collateralValue = expandTo18Decimals(12)
      liquidationFee = 300n
      ltvTarget = 8000n
      liquidationAmount = await calculateLiquidationAmount(collateralValue, loanValue, liquidationFee, ltvTarget)
      expect(liquidationAmount).toEqual(7954545454545454545n)

      loanValue = expandTo18Decimals(10)
      collateralValue = expandTo18Decimals(12)
      liquidationAmount = await calculateLiquidationAmount(collateralValue, loanValue, liquidationFee, ltvTarget)
      expect(liquidationAmount).toEqual(2272727272727272727n)

      loanValue = expandTo18Decimals(10)
      collateralValue = expandTo18Decimals(9)
      liquidationAmount = await calculateLiquidationAmount(collateralValue, loanValue, liquidationFee, ltvTarget)
      expect(liquidationAmount).toEqual(15909090909090909090n)
    })

    it('should return 0 if the loan is healthy', async () => {
      // L = 100, C = 150, F = 300, T = 8000
      // LTV = L / C = 100 / 150 = 66.67% < 80%
      const loanValue = expandTo18Decimals(100n)
      const collateralValue = expandTo18Decimals(150n)
      const liquidationFee = 300n
      const ltvTarget = 8000n
      const liquidationAmount = await calculateLiquidationAmount(collateralValue, loanValue, liquidationFee, ltvTarget)
      expect(liquidationAmount).toEqual(0n)
    })
  })
})
