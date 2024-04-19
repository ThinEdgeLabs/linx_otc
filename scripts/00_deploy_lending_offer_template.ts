import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { LendingOffer } from '../artifacts/ts'
import { ZERO_ADDRESS } from '@alephium/web3'

const deployLendingOfferTemplate: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const result = await deployer.deployContract(LendingOffer, {
    initialFields: {
      id: 0n,
      lender: ZERO_ADDRESS,
      lendingTokenId: '',
      collateralTokenId: '',
      marketplaceContractId: ZERO_ADDRESS,
      lendingAmount: 0n,
      collateralAmount: 0n,
      interestRate: 0n,
      duration: 0n,
      borrower: ZERO_ADDRESS,
      loanTimeStamp: 0n,
    }
  })
  const contractId = result.contractInstance.contractId
  const contractAddress = result.contractInstance.address
  console.log(`LendingOffer Template: ${contractAddress}, contract id: ${contractId}`)
}

export default deployLendingOfferTemplate