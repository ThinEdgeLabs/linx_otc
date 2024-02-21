import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { LendingMarketplace } from '../artifacts/ts'
import { addressFromPublicKey, groupOfAddress } from '@alephium/web3'

const deployMarketplace: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const lendingOfferTemplateResult = deployer.getDeployContractResult('LendingOffer')

  if (network.settings.admin === undefined) {
    throw new Error('Please specify the `admin` in alephium.config.ts')
  }
  if (groupOfAddress(network.settings.admin) !== deployer.account.group) {
    throw new Error(`Invalid admin, expected group ${deployer.account.group}`)
  }

  const initialFields = {
    lendingOfferTemplateId: lendingOfferTemplateResult.contractInstance.contractId,
    admin: addressFromPublicKey(network.settings.admin),
    totalLendingOffers: 0n,
    fee: BigInt(network.settings.fee)
  }

  const result = await deployer.deployContract(LendingMarketplace, {
    initialFields: initialFields,
  })

  const contractId = result.contractInstance.contractId
  const contractAddress = result.contractInstance.address
  console.log(`Lending Marketplace: ${contractAddress}, contract id: ${contractId}`)
}

export default deployMarketplace