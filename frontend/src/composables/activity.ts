import { anyToken, feeAddresses, getMarketplaceConfig, getTokens } from '@/config'
import { fetchTransactions } from '@/functions/utils'
import { useAccountStore, useLoanStore } from '@/stores'
import { Loan, Token } from '@/types'
import { ActivityEvent } from '@/types/activityEvent'
import { ContractEvent } from '@alephium/web3'
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'

interface Transaction {
  blockHash: string
  coinbase: boolean
  gasAmount: number
  gasPrice: string
  hash: string
  inputs: [TxInput]
  outputs: [TxOutput]
  scriptExecutionOk: boolean
  timestamp: bigint
}

interface TxInput {
  address: string
  attoAlphAmount: string
  outputRef: {
    hint: number
    key: string
  }
  txHashRef: string
  unlockScript: string
  tokens?: [
    {
      id: string
      amount: string
    }
  ]
}

interface TxOutput {
  address: string
  attoAlphAmount: string
  hint: number
  key: string
  message: string
  spent: string
  type: string
  tokens?: [
    {
      id: string
      amount: string
    }
  ]
}

export function useActivity() {
  const isLoading = ref<boolean>(true)
  const error = ref<any>(undefined)
  const events = ref<ActivityEvent[]>([])
  const filteredEvents = ref<ActivityEvent[]>([])

  const { account } = storeToRefs(useAccountStore())
  const loansStore = useLoanStore()

  function isActivityEvent(event: ContractEvent) {
    return (
      event.name === 'LoanCreated' ||
      event.name === 'LoanCancelled' ||
      event.name === 'LoanAccepted' ||
      event.name === 'LoanLiquidated' ||
      event.name === 'LoanPaid'
    )
  }

  function getDetails(event: ContractEvent, loanId: number) {
    switch (event.name) {
      case 'LoanCreated':
        return `Created loan #${loanId}`
      case 'LoanCancelled':
        return `Cancelled loan #${loanId}`
      case 'LoanAccepted':
        return `Accepted loan #${loanId}`
      case 'LoanLiquidated':
        return `Liquidated loan #${loanId}`
      case 'LoanPaid':
        return `Paid loan #${loanId}`
      default:
        return 'Unknown'
    }
  }

  function makeActivityEvent(event: ContractEvent, loan: Loan, tokens: Token[]) {
    const collateralToken = tokens.find((e) => e.contractId === loan?.collateralToken) ?? {
      logoUri: '/images/tokens/nologo.png'
    }
    const borrowedToken = tokens.find((e) => e.contractId === loan?.loanToken) ?? {
      logoUri: '/images/tokens/nologo.png'
    }
    return {
      details: getDetails(event, Number(loan?.id) || 0),
      timestamp: Number(event.fields['timestamp'] as bigint),
      txId: event.txId,
      tokens: [borrowedToken, collateralToken]
    } as ActivityEvent
  }

  watchEffect(async () => {
    if (!account.value) {
      events.value = []
      return {
        isLoading,
        error,
        events
      }
    }
    isLoading.value = true
    try {
      events.value = (import.meta.env.VITE_P2P_LENDING_ENABLED === 'true' && (await fetchP2PLendingEvents())) || []
      filteredEvents.value = events.value
      await fetchP2PSwapsEvents()
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  })

  async function fetchP2PLendingEvents() {
    const marketplaceEvents = await loansStore.getMarketplaceEvents()
    const tokens = await getTokens()
    const loans = new Map((await loansStore.getLoans(marketplaceEvents)).map((loan) => [loan.contractId, loan]))
    return marketplaceEvents
      .filter((event) => isActivityEvent(event) && event.fields['by'] === account.value?.address)
      .map((event) => {
        const loan = loans.get(event.fields['loanId'] as string)
        return makeActivityEvent(event, loan!, tokens)
      })
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  function setTypeFilter(txType: string) {
    const newEvents = events.value
    if (txType === 'Loans') {
      filteredEvents.value = newEvents.filter((e) => e.details.toLowerCase().includes('loan'))
    } else if (txType === 'Trades') {
      filteredEvents.value = newEvents.filter((e) => e.details.toLowerCase().includes('trade'))
    } else {
      filteredEvents.value = newEvents
    }
  }

  function setStatusFilter(statusType: string) {
    // TODO: create a filter for tx status, need tx status in activity event
  }

  async function getTransactions(feeAddress: string) {
    const tradeTransactions: Array<Transaction> = []
    // First get amount of transactions
    // const amountReq = await fetch(
    //   `https://backend.testnet.alephium.org/addresses/${account.value?.address}/total-transactions`
    // ).then(async (e) => parseInt(await e.text()))
    // TODO: If txs amount > 10, split up in batches
    const transactions = await fetchTransactions(account.value!.address)
    // Filter for OTC Trades
    for (const tx in transactions) {
      const outputs = transactions[tx].outputs
      for (const i in outputs) {
        if (outputs[i].address === feeAddress) {
          if (!tradeTransactions.includes(transactions[tx])) {
            tradeTransactions.push(transactions[tx])
          }
        }
      }
    }
    return tradeTransactions
  }

  async function fetchP2PSwapsEvents() {
    const feeAddress = feeAddresses.find((e) => e.group === account.value?.group)?.address
    const transactions = await getTransactions(feeAddress!)
    const tokens = await getTokens()
    for (const i in transactions) {
      const swappedTokens = []
      const inputs = transactions[i].inputs
      const outputs = transactions[i].outputs
      // Set balance change
      for (const a in inputs) {
        const address = inputs[a].address
        const alphBalance = inputs[a].attoAlphAmount
        const tokens = inputs[a].tokens
        // TODO: Handle balance from in/output
      }
      // Get tokens
      for (const b in outputs) {
        if (outputs[b].address === feeAddress) {
          if (outputs[b].tokens && outputs[b].tokens!.length > 0) {
            swappedTokens.push(tokens.find((e) => e.contractId === outputs[b].tokens![0].id) ?? anyToken)
          } else {
            swappedTokens.push(tokens.find((e) => e.symbol === 'ALPH'))
          }
        }
      }
      const tradeEvent = {
        details: getTradeDetails(swappedTokens as Token[]),
        timestamp: Number(transactions[i].timestamp as bigint),
        txId: transactions[i].hash,
        tokens: swappedTokens
      }
      events.value.push(tradeEvent as ActivityEvent)
    }
    events.value.sort((a, b) => b.timestamp - a.timestamp)
    filteredEvents.value = events.value
  }

  function getTradeDetails(tokens: Array<Token>) {
    if (tokens.length != 2) {
      return `OTC Trade ${tokens[0]?.symbol} for ${tokens[0]?.symbol}`
    } else {
      return `OTC Trade ${tokens[0]?.symbol} for ${tokens[1]?.symbol}`
    }
  }

  return {
    isLoading,
    error,
    events,
    filteredEvents,
    setTypeFilter,
    setStatusFilter
  }
}
