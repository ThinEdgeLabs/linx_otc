import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { networkIds } from '@alephium/web3'
import { TestOracle } from '../artifacts/ts'

const deployTestOracle: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Deploy the TestOracle contract only on devnet
  if (networkIds[network.networkId!] !== 'devnet') {
    console.log('Network is not devnet, skipping TestOracle deployment')
    return
  }
  const result = await deployer.deployContract(TestOracle, { initialFields: {} })
  const contractId = result.contractInstance.contractId
  const contractAddress = result.contractInstance.address
  console.log(`Test Oracle: ${contractAddress}, contract id: ${contractId}`)
}

export default deployTestOracle
