import { ContractState, DUST_AMOUNT, ExecuteScriptResult, NodeProvider, SignerProvider, node, number256ToBigint, web3 } from "@alephium/web3"
import { GetToken, TestToken } from "../artifacts/ts"

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

export async function waitTxConfirmed(
  provider: NodeProvider,
  txId: string,
  confirmations: number
): Promise<node.Confirmed> {
  const status = await provider.transactions.getTransactionsStatus({ txId: txId })
  if (isConfirmed(status) && status.chainConfirmations >= confirmations) {
    return status
  }
  await new Promise((r) => setTimeout(r, 1000))
  return waitTxConfirmed(provider, txId, confirmations)
}
