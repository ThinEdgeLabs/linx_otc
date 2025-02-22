import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { LendingMarketplace } from '../artifacts/ts'
import { groupOfAddress } from '@alephium/web3'

const deployMarketplace: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const loanTemplateResult = deployer.getDeployContractResult('Loan')
  const oracleWrapperResult = deployer.getDeployContractResult('OracleWrapper')

  if (network.settings.ownerAddress === undefined) {
    throw new Error('Please specify the `ownerAddress` in alephium.config.ts')
  }

  if (groupOfAddress(network.settings.ownerAddress) !== deployer.account.group) {
    throw new Error(`Owner address is not in the same group as deployer. Expected group: ${deployer.account.group}`)
  }

  if (network.settings.borrowingFee === undefined || network.settings.liquidationFee === undefined) {
    throw new Error('Please specify the `borrowingFee` and `liquidationFee` in alephium.config.ts')
  }

  const result = await deployer.deployContract(LendingMarketplace, {
    initialFields: {
      loanTemplateId: loanTemplateResult.contractInstance.contractId,
      oracleContractId: oracleWrapperResult.contractInstance.contractId,
      owner: network.settings.ownerAddress,
      totalLoans: 0n,
      borrowingFee: BigInt(network.settings.borrowingFee),
      liquidationFee: BigInt(network.settings.liquidationFee),
      lendingEnabled: true,
      upgradeDelay: 604800000n, // 1 week
      newOwner: '',
      upgradeInitiated: 0n,
      newCode: '',
      newImmFieldsEncoded: '',
      newMutFieldsEncoded: ''
    }
  })

  const contractId = result.contractInstance.contractId
  const contractAddress = result.contractInstance.address
  console.log(`Lending Marketplace: ${contractAddress}, contract id: ${contractId}`)
}

export default deployMarketplace
