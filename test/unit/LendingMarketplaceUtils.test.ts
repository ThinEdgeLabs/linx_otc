import { web3 } from '@alephium/web3'
import { TestLendingMarketplaceUtils } from '../../artifacts/ts'

function normalizeAmount(amount: bigint, decimals: bigint) {
  return TestLendingMarketplaceUtils.tests.normalizeAmount({
    testArgs: { amount, decimals }
  })
}

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
})
