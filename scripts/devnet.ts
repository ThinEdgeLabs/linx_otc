import { getEnv, waitTxConfirmed } from '@alephium/cli'
import { GetToken, TestToken } from '../artifacts/ts'
import { NodeProvider, ONE_ALPH, SignerProvider, web3 } from '@alephium/web3'
import { expandTo18Decimals } from '../shared/utils'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import path from 'path'
import fs from 'fs'

interface Token{
  contractId: string
  name: string
  symbol: string
  decimals: number
}

async function createToken(signer: SignerProvider, num: number): Promise<Token> {
  const account = await signer.getSelectedAccount()
  const nodeProvider = signer.nodeProvider ?? web3.getCurrentNodeProvider()
  const symbol = `TST-${num}`
  const name = `TestToken-${num}`
  const decimals = 18
  const deployResult = await TestToken.deploy(signer, {
    initialFields: {
      symbol: Buffer.from(symbol, 'utf8').toString('hex'),
      name: Buffer.from(name, 'utf8').toString('hex'),
      decimals: BigInt(decimals),
      totalSupply: expandTo18Decimals(1000000)
    },
    issueTokenAmount: expandTo18Decimals(1000000)
  })
  await waitTxConfirmed(nodeProvider, deployResult.txId, 1, 1000)

  const scriptResult = await GetToken.execute(signer, {
    initialFields: {
      token: deployResult.contractInstance.contractId,
      sender: account.address,
      amount: expandTo18Decimals(1000000)
    },
    attoAlphAmount: ONE_ALPH
  })
  await waitTxConfirmed(nodeProvider, scriptResult.txId, 1, 1000)
  console.log(
    `Created test token, name: ${name}, symbol: ${symbol}, token id: ${deployResult.contractInstance.contractId}, token address: ${deployResult.contractInstance.address}`
  )
  const balance = await web3.getCurrentNodeProvider().addresses.getAddressesAddressBalance(account.address)
  const tokenBalance = balance.tokenBalances?.find((t) => t.id === deployResult.contractInstance.contractId)?.amount
  console.log(`Account ${account.address}, token balance: ${tokenBalance}`)

  return {
    contractId: deployResult.contractInstance.contractId,
    symbol,
    name,
    decimals
  }
}

async function transferAlph(signer: SignerProvider, destination: string, nodeProvider: NodeProvider) {
  const result = await signer.signAndSubmitTransferTx({
    signerAddress: (await signer.getSelectedAccount()).address,
    destinations: [
      {
        address: destination,
        attoAlphAmount: expandTo18Decimals(100),
      }
    ]
  })
  await waitTxConfirmed(nodeProvider, result.txId, 1, 1000)
}

async function run() {
  try {
    const env = await getEnv()
    const lender = new PrivateKeyWallet({ privateKey: env.network.privateKeys[0] })
    const testTokenOne = await createToken(lender, 1)

    const borrower = new PrivateKeyWallet({ privateKey: env.network.privateKeys[1] })
    await transferAlph(lender, borrower.address, web3.getCurrentNodeProvider())
    const testTokenTwo = await createToken(borrower, 2)
    const tokens = [testTokenOne, testTokenTwo]

    const content = JSON.stringify(tokens, null, 2)
    const filepath = path.join(process.cwd(), 'frontend', 'src', 'devnet-token-list.json')
    fs.writeFileSync(filepath, content)
  } catch (error) {
    console.error(`Failed to create tokens, error: ${error}`)
  }
}

run()


