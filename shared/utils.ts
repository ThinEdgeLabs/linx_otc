import { ContractState, DUST_AMOUNT, ExecuteScriptResult, SignerProvider, binToHex, contractIdFromAddress, node, number256ToBigint, web3 } from "@alephium/web3"
import { GetToken, TestToken } from "../artifacts/ts"
import { randomBytes } from 'crypto'
import * as base58 from 'bs58'

export async function deployTestToken(signer: SignerProvider): Promise<string> {
  const result = await TestToken.deploy(signer, {
    initialFields: {
      symbol: '',
      name: '',
      decimals: 18n,
      totalSupply: 1n << 255n,
    },
    issueTokenAmount: 1n << 255n
  })
  await getToken(signer, result.contractInstance.contractId, expandTo18Decimals(10000n))
  return result.contractInstance.contractId
}

export async function getToken(signer: SignerProvider, tokenId: string, amount: bigint): Promise<ExecuteScriptResult> {
  return GetToken.execute(signer, {
    initialFields: {
      token: tokenId,
      sender: (await signer.getSelectedAccount()).address,
      amount
    },
    attoAlphAmount: DUST_AMOUNT * 2n
  })
}

export async function balanceOf(tokenId: string, address: string): Promise<bigint> {
  const balances = await web3.getCurrentNodeProvider().addresses.getAddressesAddressBalance(address)
  const balance = balances.tokenBalances?.find((t) => t.id === tokenId)
  return balance === undefined ? 0n : BigInt(balance.amount)
}

export function contractBalanceOf(state: ContractState, tokenId: string): bigint {
  const token = state.asset.tokens?.find((t) => t.id === tokenId)
  return token === undefined ? 0n : number256ToBigint(token.amount)
}

export function expandTo18Decimals(num: bigint | number): bigint {
  return BigInt(num) * (10n ** 18n)
}

function isConfirmed(txStatus: node.TxStatus): txStatus is node.Confirmed {
  return txStatus.type === 'Confirmed'
}

export function randomContractId(): string {
  return binToHex(contractIdFromAddress(randomContractAddress()))
}

export function randomContractAddress(): string {
  const prefix = Buffer.from([0x03])
  const bytes = Buffer.concat([prefix, randomBytes(32)])
  return base58.encode(bytes)
}
