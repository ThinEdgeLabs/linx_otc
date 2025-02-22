import { NetworkId, waitForTxConfirmation, web3 } from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { OracleWrapperInstance } from '../artifacts/ts'
import { loadDeployments } from '../artifacts/ts/deployments'
import { OracleHelper } from '../shared/oracle_helper'
import { getEnv } from '@alephium/cli'

async function getTokens(networkId: NetworkId) {
  const res = await fetch(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${networkId}.json`)
  if (res.ok) {
    const tokensList = await res.json()
    return tokensList.tokens
  } else {
    throw new Error('Unable to get tokens list')
  }
}

async function addPair(helper: OracleHelper, pair: string, tokenId: string, oracle: OracleWrapperInstance) {
  const result = await helper.addPair(oracle.address, tokenId, pair)
  await waitForTxConfirmation(result.txId, 1, 3000)
  console.log(`Pair ${tokenId}:${pair} added successfully`)
}

async function run() {
  try {
    web3.setCurrentNodeProvider('https://wallet-v20.testnet.alephium.org')
    const networkId = 'testnet'
    const env = await getEnv(undefined, networkId)
    const signer = new PrivateKeyWallet({ privateKey: env.network.privateKeys[0] })
    const deployer = signer.address
    const deployments = loadDeployments(networkId, deployer)
    const oracle = deployments?.contracts.Oracle?.contractInstance!
    const helper = new OracleHelper(signer)
    const tokens = await getTokens(networkId)

    const tokenId = tokens.find((token) => token.symbol === 'TBTC')?.id
    const pair = 'BTC/USD'

    // const tokenId = tokens.find((token) => token.symbol === 'TUSDC')?.id
    // const pair = 'USDC/USD'

    // const tokenId = tokens.find((token) => token.symbol === 'ALPH')?.id
    // const pair = 'ALPH/USD'

    // const tokenId = tokens.find((token) => token.symbol === 'TETH')?.id
    // const pair = 'ETH/USD'

    // const tokenId = tokens.find((token) => token.symbol === 'TUSDT')?.id
    // const pair = 'USDT/USD'

    // const result = await helper.addPair(oracle.address, tokenId, stringToHex('USDC/USD'))
    // console.log('Waiting for confirmation...')
    // await waitForTxConfirmation(result.txId, 1, 3000)
    // console.log(`Pair ${tokenId}:${pair} added successfully`)

    const data = await helper.getTokenPrice(oracle.address, tokenId)
    const price = data.returns[0]
    const timestamp = new Date(Number(data.returns[1]))
    console.log(`Price of ${pair} is ${price} at ${timestamp}`)
  } catch (error) {
    console.error(`An error occurred: ${error}`)
  }
}

run()

// TODO: TestOracle: Command to set price
// TODO: OracleWrapper: Command to add pair
// TODO: OracleWrapper: Command to get pair info
// TODO: OracleWrapper: Command to get token price
