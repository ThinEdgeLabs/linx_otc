import { Asset, ContractState, Fields, ZERO_ADDRESS, addressFromContractId } from '@alephium/web3'
import { LendingMarketplace, LendingMarketplaceTypes, LendingOffer } from '../../artifacts/ts'
import { randomContractAddress, testAddress } from '@alephium/web3-test'

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

export function createLendingOffer(
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
  const contractState = LendingOffer.stateForTest(
    {
      id: 1n,
      lender: lender ?? testAddress,
      lendingTokenId: lendingTokenId ?? '',
      collateralTokenId: collateralTokenId ?? '',
      marketplaceContractId: marketplaceContractId ?? ZERO_ADDRESS,
      lendingAmount: lendingAmount ?? 1000n,
      collateralAmount: collateralAmount ?? 2000n,
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

export function createLendingMarketplace(admin: string, contractId?: string, lendingEnabled?: boolean) {
  const address = contractId ? addressFromContractId(contractId) : randomContractAddress()
  const lendingOfferTemplate = createLendingOffer()
  const contractState = LendingMarketplace.stateForTest(
    {
      lendingOfferTemplateId: lendingOfferTemplate.contractId,
      admin,
      totalLendingOffers: 0n,
      fee: 100n,
      lendingEnabled: lendingEnabled ?? true
    },
    undefined,
    address
  )
  return new ContractFixture(contractState, lendingOfferTemplate.states(), address)
}
