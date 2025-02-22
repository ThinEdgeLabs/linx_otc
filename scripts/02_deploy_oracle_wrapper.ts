import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { groupOfAddress, networkIds, ZERO_ADDRESS } from '@alephium/web3'
import { OracleWrapper } from '../artifacts/ts'

const deployOracleWrapper: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const owner = network.settings.ownerAddress
  if (network.settings.ownerAddress === undefined) {
    throw new Error('Please specify the `ownerAddress` in alephium.config.ts')
  }
  if (groupOfAddress(network.settings.ownerAddress) !== deployer.account.group) {
    throw new Error(`Owner address is not in the same group as deployer. Expected group: ${deployer.account.group}`)
  }
  if (networkIds[network.networkId!] !== 'devnet' && network.settings.oracleContractId === undefined) {
    throw new Error('Please specify the `oracleContractId` in alephium.config.ts')
  }

  const oracleContractId =
    networkIds[network.networkId!] === 'devnet'
      ? deployer.getDeployContractResult('TestOracle')?.contractInstance.contractId
      : network.settings.oracleContractId

  const result = await deployer.deployContract(OracleWrapper, {
    initialFields: {
      owner: owner,
      oracleContractId: oracleContractId,
      upgradeDelay: 604800000n, // 1 week
      heartbeatInterval: 86400000n, // 1 day
      newOwner: ZERO_ADDRESS,
      upgradeInitiated: 0n,
      newCode: '',
      newImmFieldsEncoded: '',
      newMutFieldsEncoded: ''
    }
  })
  const contractId = result.contractInstance.contractId
  const contractAddress = result.contractInstance.address
  console.log(`Oracle: ${contractAddress}, contract id: ${contractId}`)
}

export default deployOracleWrapper
