import {
  web3,
  Project,
  TestContractParams,
  addressFromContractId,
  AssetOutput,
  DUST_AMOUNT,
  ONE_ALPH
} from '@alephium/web3'
import { expectAssertionError, getSigners, randomContractId, testAddress, testNodeWallet } from '@alephium/web3-test'
import { deployToDevnet } from '@alephium/cli'
import { LendingMarketplace, LendingMarketplaceTypes } from '../artifacts/ts'

describe('unit tests', () => {
  let testContractId: string
  let testContractAddress: string
  let testParamsFixture: TestContractParams<LendingMarketplaceTypes.Fields, { newAdmin: string }>

  describe('updateAdmin', () => {
    beforeAll(async () => {
      web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
      await Project.build()
      testContractId = randomContractId()
      testContractAddress = addressFromContractId(testContractId)
      const [signer] = await getSigners(1, ONE_ALPH * 1000n, 0)

      testParamsFixture = {
        address: testContractAddress,
        initialFields: {
          admin: testAddress
        },
        inputAssets: [{ address: testAddress, asset: { alphAmount: 10n ** 18n } }],
        testArgs: { newAdmin: signer.address }
      }
    })

    it('as admin', async () => {
      const testParams = testParamsFixture
      const testResult = await LendingMarketplace.tests.updateAdmin(testParams)

      const contractState = testResult.contracts[0] as LendingMarketplaceTypes.State
      expect(contractState.fields.admin).toEqual(testParams.testArgs.newAdmin)
      expect(testResult.events.length).toEqual(1)

      const event = testResult.events[0] as LendingMarketplaceTypes.AdminUpdatedEvent
      expect(event.name).toEqual('AdminUpdated')
      expect(event.fields.previous).toEqual(testAddress)
      expect(event.fields.new).toEqual(testParams.testArgs.newAdmin)
    })

    it('not as admin', async () => {
      const [notAdmin] = await getSigners(1, ONE_ALPH * 1000n, 0)
      const testParams = {
        ...testParamsFixture,
        inputAssets: [{ address: notAdmin.address, asset: { alphAmount: 10n ** 18n } }]
      }

      await expectAssertionError(
        LendingMarketplace.tests.updateAdmin(testParams),
        testContractAddress,
        Number(LendingMarketplace.consts.ErrorCodes.AdminAllowedOnly)
      )
    })
  })
})
