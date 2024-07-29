import { ContractState, ZERO_ADDRESS, binToHex, web3 } from '@alephium/web3'
import { ContractFixture, createTestUpgradable } from './fixtures'
import { expectAssertionError } from '@alephium/web3-test'
import { TestUpgradable, TestUpgradableTypes } from '../../artifacts/ts'
import { getEvent, getContractState, randomP2PKHAddress, defaultGasFee } from '../../shared/utils'

describe('Upgradable Contract Tests', () => {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  let genesis: number
  let sender: string
  let secondOwner: string
  let thirdOwner: string
  let fixture: ContractFixture<TestUpgradableTypes.Fields>
  let upgradeDelay: number

  beforeEach(async () => {
    sender = randomP2PKHAddress()
    secondOwner = randomP2PKHAddress()
    thirdOwner = randomP2PKHAddress()

    upgradeDelay = Number(604800001n)
    genesis = Date.now()
    fixture = createTestUpgradable(sender)
  })

  // --------------------
  // SECTION: Helpers
  // --------------------
  function changeOwner(
    newOwner: string,
    caller: string,
    timestamp: number,
    state: ContractState<TestUpgradableTypes.Fields>,
    existingContracts: ContractState[]
  ) {
    const inputAssets = [{ address: caller, asset: { alphAmount: defaultGasFee } }]
    return TestUpgradable.tests.changeOwner({
      initialFields: state.fields,
      initialAsset: state.asset,
      address: state.address,
      existingContracts: existingContracts,
      blockTimeStamp: timestamp,
      inputAssets: inputAssets,
      testArgs: {
        changeOwner: newOwner
      }
    })
  }

  function changeOwnerApply(
    caller: string,
    timestamp: number,
    state: ContractState<TestUpgradableTypes.Fields>,
    existingContracts: ContractState[]
  ) {
    const inputAssets = [{ address: caller, asset: { alphAmount: defaultGasFee } }]
    return TestUpgradable.tests.changeOwnerApply({
      initialFields: state.fields,
      initialAsset: state.asset,
      address: state.address,
      existingContracts: existingContracts,
      blockTimeStamp: timestamp,
      inputAssets: inputAssets
    })
  }

  function migrate(
    newCode: string,
    caller: string,
    timestamp: number,
    state: ContractState<TestUpgradableTypes.Fields>,
    existingContracts: ContractState[]
  ) {
    const inputAssets = [{ address: caller, asset: { alphAmount: defaultGasFee } }]
    return TestUpgradable.tests.migrate({
      initialFields: state.fields,
      initialAsset: state.asset,
      address: state.address,
      existingContracts: existingContracts,
      blockTimeStamp: timestamp,
      inputAssets: inputAssets,
      testArgs: {
        changeCode: newCode
      }
    })
  }

  function migrateApply(
    caller: string,
    timestamp: number,
    state: ContractState<TestUpgradableTypes.Fields>,
    existingContracts: ContractState[]
  ) {
    const inputAssets = [{ address: caller, asset: { alphAmount: defaultGasFee } }]
    return TestUpgradable.tests.migrateApply({
      initialFields: state.fields,
      initialAsset: state.asset,
      address: state.address,
      existingContracts: existingContracts,
      blockTimeStamp: timestamp,
      inputAssets: inputAssets
    })
  }

  function migrateWithFields(
    newCode: string,
    immFields: string,
    mutFields: string,
    caller: string,
    timestamp: number,
    state: ContractState<TestUpgradableTypes.Fields>,
    existingContracts: ContractState[]
  ) {
    const inputAssets = [{ address: caller, asset: { alphAmount: defaultGasFee } }]
    return TestUpgradable.tests.migrateWithFields({
      initialFields: state.fields,
      initialAsset: state.asset,
      address: state.address,
      existingContracts: existingContracts,
      blockTimeStamp: timestamp,
      inputAssets: inputAssets,
      testArgs: {
        changeCode: newCode,
        changeImmFieldsEncoded: immFields,
        changeMutFieldsEncoded: mutFields
      }
    })
  }

  function migrateWithFieldsApply(
    caller: string,
    timestamp: number,
    state: ContractState<TestUpgradableTypes.Fields>,
    existingContracts: ContractState[]
  ) {
    const inputAssets = [{ address: caller, asset: { alphAmount: defaultGasFee } }]
    return TestUpgradable.tests.migrateWithFieldsApply({
      initialFields: state.fields,
      initialAsset: state.asset,
      address: state.address,
      existingContracts: existingContracts,
      blockTimeStamp: timestamp,
      inputAssets: inputAssets
    })
  }

  function resetUpgrade(
    caller: string,
    timestamp: number,
    state: ContractState<TestUpgradableTypes.Fields>,
    existingContracts: ContractState[]
  ) {
    const inputAssets = [{ address: caller, asset: { alphAmount: defaultGasFee } }]
    return TestUpgradable.tests.resetUpgrade({
      initialFields: state.fields,
      initialAsset: state.asset,
      address: state.address,
      existingContracts: existingContracts,
      blockTimeStamp: timestamp,
      inputAssets: inputAssets
    })
  }

  describe('Ownership Changes', () => {
    test('Successfully changes owner', async () => {
      let stateRes = await changeOwner(secondOwner, sender, genesis, fixture.selfState, fixture.dependencies)
      let state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'ChangeOwnerCommence').fields).toEqual({
        owner: sender,
        changeOwner: secondOwner
      })

      stateRes = await changeOwnerApply(sender, genesis + upgradeDelay, state, stateRes.contracts)
      state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'ChangeOwnerApply').fields).toEqual({ owner: sender, changeOwner: secondOwner })

      stateRes = await changeOwner(thirdOwner, secondOwner, genesis + upgradeDelay, state, stateRes.contracts)
      state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'ChangeOwnerCommence').fields).toEqual({
        owner: secondOwner,
        changeOwner: thirdOwner
      })

      stateRes = await changeOwnerApply(secondOwner, genesis + upgradeDelay * 2, state, stateRes.contracts)
      state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'ChangeOwnerApply').fields).toEqual({
        owner: secondOwner,
        changeOwner: thirdOwner
      })
    })

    test('Fails to change owner if not called by current owner', async () => {
      await expectAssertionError(
        changeOwner(secondOwner, secondOwner, genesis, fixture.selfState, fixture.dependencies),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.OwnerAllowedOnly)
      )
    })

    test('Fails to apply ownership before delay', async () => {
      const stateRes = await changeOwner(secondOwner, sender, genesis, fixture.selfState, fixture.dependencies)
      const state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      await expectAssertionError(
        changeOwnerApply(sender, genesis + 1000, state, stateRes.contracts),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.UpgradeDelayNotExpired)
      )
    })

    test('Fails to apply ownership change without pending change', async () => {
      const stateRes = await migrate('', sender, genesis, fixture.selfState, fixture.dependencies)
      const state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      await expectAssertionError(
        changeOwnerApply(sender, genesis + upgradeDelay, state, stateRes.contracts),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.ChangeOwnerNotPending)
      )
    })
  })

  describe('Contract Migrations', () => {
    test('Successfully migrates contract', async () => {
      let stateRes = await migrate(
        TestUpgradable.contract.bytecode,
        sender,
        genesis,
        fixture.selfState,
        fixture.dependencies
      )
      let state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'MigrateCommence').fields).toEqual({
        owner: sender,
        changeCode: TestUpgradable.contract.bytecode
      })

      stateRes = await migrateApply(sender, genesis + upgradeDelay, state, stateRes.contracts)
      state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'MigrateApply').fields).toEqual({
        owner: sender,
        changeCode: TestUpgradable.contract.bytecode
      })
    })

    test('Successfully migrates contract with fields', async () => {
      const fields = {
        immValue: fixture.selfState.fields.immValue,
        upgradeDelay: fixture.selfState.fields.upgradeDelay,
        mutValue: fixture.selfState.fields.mutValue,
        owner: fixture.selfState.fields.owner,
        newOwner: fixture.selfState.fields.newOwner,
        upgradeCommenced: fixture.selfState.fields.upgradeCommenced,
        newCode: fixture.selfState.fields.newCode,
        newImmFieldsEncoded: fixture.selfState.fields.newImmFieldsEncoded,
        newMutFieldsEncoded: fixture.selfState.fields.newMutFieldsEncoded
      }
      const { encodedImmFields, encodedMutFields } = TestUpgradable.encodeFields(fields)

      let stateRes = await migrateWithFields(
        TestUpgradable.contract.bytecode,
        binToHex(encodedImmFields),
        binToHex(encodedMutFields),
        sender,
        genesis,
        fixture.selfState,
        fixture.dependencies
      )
      let state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'MigrateWithFieldsCommence').fields).toEqual({
        owner: sender,
        changeCode: TestUpgradable.contract.bytecode,
        changeImmFieldsEncoded: binToHex(encodedImmFields),
        changeMutFieldsEncoded: binToHex(encodedMutFields)
      })

      stateRes = await migrateWithFieldsApply(sender, genesis + upgradeDelay, state, stateRes.contracts)
      state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'MigrateWithFieldsApply').fields).toEqual({
        owner: sender,
        changeCode: TestUpgradable.contract.bytecode,
        changeImmFieldsEncoded: binToHex(encodedImmFields),
        changeMutFieldsEncoded: binToHex(encodedMutFields)
      })
    })

    test('Fails migration if not called by owner', async () => {
      await expectAssertionError(
        migrate('', secondOwner, genesis, fixture.selfState, fixture.dependencies),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.OwnerAllowedOnly)
      )
      await expectAssertionError(
        migrateWithFields('', '', '', secondOwner, genesis, fixture.selfState, fixture.dependencies),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.OwnerAllowedOnly)
      )
    })

    test('Fails migration if upgrade already pending', async () => {
      const stateRes = await migrate(
        TestUpgradable.contract.bytecode,
        sender,
        genesis,
        fixture.selfState,
        fixture.dependencies
      )
      const state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'MigrateCommence').fields).toEqual({
        owner: sender,
        changeCode: TestUpgradable.contract.bytecode
      })

      await expectAssertionError(
        migrate(TestUpgradable.contract.bytecode, sender, genesis, state, stateRes.contracts),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.UpgradePending)
      )
    })

    test('Fails migration apply before delay', async () => {
      const stateRes = await migrate(
        TestUpgradable.contract.bytecode,
        sender,
        genesis,
        fixture.selfState,
        fixture.dependencies
      )
      const state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(getEvent(stateRes.events, 'MigrateCommence').fields).toEqual({
        owner: sender,
        changeCode: TestUpgradable.contract.bytecode
      })
      await expectAssertionError(
        migrateApply(sender, genesis + 1000, state, stateRes.contracts),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.UpgradeDelayNotExpired)
      )
    })

    test('Fails migration apply without pending migration', async () => {
      const stateRes = await changeOwner(secondOwner, sender, genesis, fixture.selfState, fixture.dependencies)
      const state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      await expectAssertionError(
        migrateApply(sender, genesis + upgradeDelay, state, stateRes.contracts),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.MigrateNotPending)
      )
    })
  })

  describe('Reset Upgrade Functionality', () => {
    test('Successfully resets ongoing upgrade', async () => {
      let stateRes = await changeOwner(secondOwner, sender, genesis, fixture.selfState, fixture.dependencies)
      let state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      stateRes = await resetUpgrade(sender, genesis, fixture.selfState, fixture.dependencies)
      state = getContractState<TestUpgradableTypes.Fields>(stateRes.contracts, fixture.contractId)
      expect(state.fields.newOwner).toBe(ZERO_ADDRESS)
      expect(state.fields.upgradeCommenced).toBe(0n)
    })

    test('Fails reset upgrade if not called by owner', async () => {
      await expectAssertionError(
        resetUpgrade(secondOwner, genesis, fixture.selfState, fixture.dependencies),
        fixture.address,
        Number(TestUpgradable.consts.UpgradeErrorCodes.OwnerAllowedOnly)
      )
    })
  })
})
