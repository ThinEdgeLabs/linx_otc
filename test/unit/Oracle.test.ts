import { HexString, ONE_ALPH, stringToHex } from '@alephium/web3'
import { OracleWrapper, OracleWrapperTypes } from '../../artifacts/ts'
import { ContractFixture, createOracle } from './fixtures'
import { defaultGasFee, randomP2PKHAddress } from '../../shared/utils'
import { expectAssertionError, getSigner, randomContractId } from '@alephium/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { PairInfo } from '../../artifacts/ts/types'

////////////////////////////////////
// -------- Test helpers -------- //
////////////////////////////////////

async function getPair(
  fixture: ContractFixture<OracleWrapperTypes.Fields>,
  tokenId: string,
  initialMaps?: { pairsByBaseTokenId?: Map<HexString, PairInfo> }
) {
  return OracleWrapper.tests.getPairInfo({
    initialFields: fixture.selfState.fields,
    initialAsset: fixture.selfState.asset,
    inputAssets: [{ address: randomP2PKHAddress(), asset: { alphAmount: defaultGasFee } }],
    address: fixture.address,
    existingContracts: fixture.dependencies,
    testArgs: { tokenId },
    initialMaps: initialMaps
  })
}

async function getPrice(
  fixture: ContractFixture<OracleWrapperTypes.Fields>,
  tokenId: string,
  initialMaps?: { pairsByBaseTokenId?: Map<HexString, PairInfo> }
) {
  return OracleWrapper.tests.getTokenPrice({
    initialFields: fixture.selfState.fields,
    initialAsset: fixture.selfState.asset,
    inputAssets: [{ address: randomP2PKHAddress(), asset: { alphAmount: defaultGasFee } }],
    address: fixture.address,
    existingContracts: fixture.dependencies,
    testArgs: { tokenId },
    initialMaps: initialMaps
  })
}

////////////////////////////////////
// ----------- Tests ------------ //
////////////////////////////////////

describe('Oracle', () => {
  let fixture: ContractFixture<OracleWrapperTypes.Fields>
  let owner: PrivateKeyWallet
  const pairInfo = { symbol: stringToHex('BTCUSD'), decimals: 8n }
  const tokenId = randomContractId()

  beforeAll(async () => {
    owner = await getSigner(10n * ONE_ALPH)
    fixture = createOracle(owner.address)
  })

  describe('getPair', () => {
    it('fails if the pair does not exist', async () => {
      const failedTestResult = getPair(fixture, tokenId)
      expectAssertionError(failedTestResult, fixture.address, Number(OracleWrapper.consts.ErrorCodes.InvalidTokenId))
    })
    it('returns the pair if it exists', async () => {
      const tokenId = randomContractId()
      const testResult = await getPair(fixture, tokenId, { pairsByBaseTokenId: new Map([[tokenId, pairInfo]]) })
      expect(testResult.returns).toEqual(pairInfo)
    })
  })

  describe('getTokenPrice', () => {
    it('fails if the pair does not exist', async () => {
      const failedTestResult = getPrice(fixture, tokenId)
      expectAssertionError(failedTestResult, fixture.address, Number(OracleWrapper.consts.ErrorCodes.InvalidTokenId))
    })
  })
})
