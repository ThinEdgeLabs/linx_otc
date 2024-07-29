import { Asset, ContractState, Fields, ONE_ALPH, ZERO_ADDRESS, addressFromContractId } from '@alephium/web3'
import { LendingMarketplace, LendingMarketplaceTypes, Loan, TestUpgradable } from '../../artifacts/ts'
import { randomContractAddress, randomContractId, testAddress } from '@alephium/web3-test'
import { expandTo18Decimals } from '../../shared/utils'

export class ContractFixture<F extends Fields> {
  selfState: ContractState<F>
  dependencies: ContractState[]
  address: string
  contractId: string

  states(): ContractState[] {
    return this.dependencies.concat([this.selfState])
  }

  constructor(selfState: ContractState<F>, dependencies: ContractState[], address: string) {
    this.selfState = selfState
    this.dependencies = dependencies
    this.address = address
    this.contractId = selfState.contractId
  }
}

export function createLoan(
  lender?: string,
  lendingTokenId?: string,
  collateralTokenId?: string,
  marketplaceContractId?: string,
  lendingAmount?: bigint,
  collateralAmount?: bigint,
  interestRate?: bigint,
  duration?: bigint,
  borrower?: string,
  contractId?: string,
  loanTimeStamp?: bigint,
  asset?: Asset,
  marketContractFixture?: ContractFixture<LendingMarketplaceTypes.Fields>
) {
  const address = contractId ? addressFromContractId(contractId) : randomContractAddress()
  const contractState = Loan.stateForTest(
    {
      id: 1n,
      lender: lender ?? testAddress,
      lendingTokenId: lendingTokenId ?? '',
      collateralTokenId: collateralTokenId ?? '',
      marketplaceContractId: marketplaceContractId ?? ZERO_ADDRESS,
      lendingAmount: lendingAmount ?? expandTo18Decimals(1000n),
      collateralAmount: collateralAmount ?? expandTo18Decimals(2000n),
      interestRate: interestRate ?? 2000n,
      duration: duration ?? 30n,
      borrower: borrower ?? ZERO_ADDRESS,
      loanTimeStamp: loanTimeStamp ?? 0n
    },
    asset,
    address
  )
  return new ContractFixture(contractState, marketContractFixture?.states() ?? [], address)
}

export function createLendingMarketplace(
  owner: string,
  feeRate?: bigint,
  contractId?: string,
  lendingEnabled?: boolean
) {
  const address = contractId ? addressFromContractId(contractId) : randomContractAddress()
  const lendingOfferTemplate = createLoan()
  const contractState = LendingMarketplace.stateForTest(
    {
      loanTemplateId: lendingOfferTemplate.contractId,
      totalLoans: 0n,
      feeRate: feeRate ?? 100n,
      lendingEnabled: lendingEnabled ?? true,
      upgradeDelay: 604800000n, // 1 week in milliseconds
      owner: owner,
      newOwner: ZERO_ADDRESS,
      upgradeCommenced: 0n,
      newCode: '',
      newImmFieldsEncoded: '',
      newMutFieldsEncoded: ''
    },
    undefined,
    address
  )
  return new ContractFixture(contractState, lendingOfferTemplate.states(), address)
}

export function createTestUpgradable(owner: string, contractId?: string) {
  const address = contractId ? addressFromContractId(contractId) : randomContractAddress()
  const contractState = TestUpgradable.stateForTest(
    {
      immValue: 1n,
      upgradeDelay: 604800000n, // 1 week in milliseconds
      mutValue: 2n,
      owner: owner,
      newOwner: ZERO_ADDRESS,
      upgradeCommenced: 0n,
      newCode: '',
      newImmFieldsEncoded: '',
      newMutFieldsEncoded: ''
    },
    { alphAmount: ONE_ALPH * 10n, tokens: [{ id: randomContractId(), amount: expandTo18Decimals(100_000n) }] },
    address
  )
  return new ContractFixture(contractState, [], address)
}
