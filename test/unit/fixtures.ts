import { ContractState, Fields, addressFromContractId, number256ToBigint } from '@alephium/web3'
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
  lendingAmount?: bigint,
  collateralAmount?: bigint,
  interestRate?: bigint,
  duration?: bigint,
  borrower?: string,
  contractId?: string,
  marketContractFixture?: ContractFixture<LendingMarketplaceTypes.Fields>
) {
  const address = contractId ? addressFromContractId(contractId) : randomContractAddress()
  const contractState = LendingOffer.stateForTest(
    {
      lender: lender ?? testAddress,
      lendingTokenId: lendingTokenId ?? '',
      collateralTokenId: collateralTokenId ?? '',
      lendingAmount: lendingAmount ?? 1000n,
      collateralAmount: collateralAmount ?? 2000n,
      interestRate: interestRate ?? 2000n,
      duration: duration ?? 30n,
      borrower: borrower ?? testAddress,
      loanTimeStamp: 0n,
    },
    undefined,
    address
  )
  return new ContractFixture(contractState, marketContractFixture?.states() ?? [], address)
}

export function createLendingMarketplace(
  admin: string,
  contractId?: string
) {
  const address = contractId ? addressFromContractId(contractId) : randomContractAddress()
  const lendingOfferTemplate = createLendingOffer()
  const contractState = LendingMarketplace.stateForTest(
    {
      lendingOfferTemplateId: lendingOfferTemplate.contractId,
      admin,
      totalLendingOffers: 0n,
      fee: 100n
    },
    undefined,
    address
  )
  return new ContractFixture(contractState, lendingOfferTemplate.states(), address)
}
