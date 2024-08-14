import { ONE_ALPH, stringToHex, web3 } from '@alephium/web3'
import { getSigner, randomContractId } from '@alephium/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { OracleWrapper, OracleWrapperInstance, TestOracleInstance } from '../../artifacts/ts'
import { deployTestOracle, expandTo18Decimals, getEventByTxId, setPrice } from '../../shared/utils'
import { OracleHelper } from '../../shared/oracle_wrapper'

describe('Oracle', () => {
  let owner: PrivateKeyWallet
  let diaOracle: TestOracleInstance
  let oracle: OracleWrapperInstance
  let helper: OracleHelper

  const group = 0
  const pairSymbol = stringToHex('BTCUSD')
  const pairInfo = { symbol: pairSymbol, decimals: 8n }

  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  beforeAll(async () => {
    owner = await getSigner(10n * ONE_ALPH, group)
    diaOracle = (await deployTestOracle(owner)).contractInstance
    await setPrice(diaOracle, pairSymbol, expandTo18Decimals(66234), BigInt(Date.now()), owner)
    helper = new OracleHelper(owner)
    oracle = (await helper.deploy(diaOracle.contractId, owner)).contractInstance
  })

  test('getPair', async () => {
    const tokenId = randomContractId()
    await helper.addPair(oracle.address, tokenId, pairInfo)
    const result = await helper.getPair(oracle.address, tokenId)
    expect(result.returns).toEqual(pairInfo)
  })

  describe('getTokenPrice', () => {
    it('returns a TokenPrice struct', async () => {
      const tokenId = randomContractId()
      await helper.addPair(oracle.address, tokenId, pairInfo)
      const result1 = await helper.getTokenPrice(oracle.address, tokenId)
      expect(result1.returns.price).toBe(expandTo18Decimals(66234))

      await setPrice(diaOracle, stringToHex('BTCUSD'), expandTo18Decimals(66300), BigInt(Date.now()), owner)
      const result2 = await helper.getTokenPrice(oracle.address, tokenId)
      expect(result2.returns.price).toBe(expandTo18Decimals(66300))
    })

    it('fails if the oracle data is stale', async () => {
      const day = 24 * 60 * 60 * 1000
      await setPrice(diaOracle, pairSymbol, expandTo18Decimals(66300), BigInt(Date.now() - day - 1), owner)
      const tokenId = randomContractId()
      await helper.addPair(oracle.address, tokenId, pairInfo)
      await expect(helper.getTokenPrice(oracle.address, tokenId)).rejects.toThrow()
    })
  })

  describe('addPair', () => {
    test('adds a pair', async () => {
      const tokenId = randomContractId()
      const addPairResult = await helper.addPair(oracle.address, tokenId, pairInfo)

      const pairAddedEvent = await getEventByTxId(addPairResult.txId, OracleWrapper.contract.codeHash, 2)
      expect(pairAddedEvent.fields).toEqual({ tokenId, symbol: pairInfo.symbol, decimals: pairInfo.decimals })

      const result = await helper.getPair(oracle.address, tokenId)
      expect(result.returns).toEqual(pairInfo)
    })

    test('fails if the oracle does not have data for the pair symbol', async () => {
      const tokenId = randomContractId()
      const pairInfo = { symbol: stringToHex('ETHUSD'), decimals: 8n }
      await expect(helper.addPair(oracle.address, tokenId, pairInfo)).rejects.toThrow()
    })
  })
})
