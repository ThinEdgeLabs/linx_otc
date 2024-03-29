import type { Loan } from '@/types'
import { binToHex } from '@alephium/web3'
import blake from 'blakejs'

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      await document.execCommand('copy')
    } catch (err) {
      console.error('Unable to copy', err)
    }
    document.body.removeChild(textArea)
  }

  alert('Copied to clipboard: ' + text)
}

export function parseBalance(balance: number, decimals: number) {
  const actualTokenBalance = balance / Math.pow(10, decimals)
  return actualTokenBalance
}

export function expandToDecimals(num: number | bigint, decimals: number) {
  return BigInt(num) * 10n ** BigInt(decimals)
}

export function calculateApr(loan: Loan) {
  const totalInterest = (loan.interest * loan.loanAmount) / 10000n
  return ((totalInterest * 10n ** 18n) / loan.loanAmount / loan.duration) * 365n * 100n
}

export function convertBasisPointsToPercentage(basisPoints: bigint | number) {
  return `${Number(basisPoints) / 100}%`
}

export function hashLink(link: string) {
  const hash = binToHex(blake.blake2b(link, undefined, 32))
  return hash
}

export function checkLink(link: string, hash: string) {
  const newHash = binToHex(blake.blake2b(link, undefined, 32))
  if (newHash != hash) {
    throw Error("Hashes don't match, can't decode transaction")
  }
  return true
}

export async function registerLink(hash: string, encodedLink: string) {
  const res = await fetch('https://us-central1-linx-wallet.cloudfunctions.net/registerTrade', {
    method: 'POST',
    body: JSON.stringify({
      value: hash,
      encodedLink: encodedLink
    })
  })
  if (res.ok) {
    return true
  } else {
    console.log('error request', res)
    return false
  }
  return true
}

export async function fetchLink(hash: string) {
  const res = await fetch('https://us-central1-linx-wallet.cloudfunctions.net/fetchTrade', {
    method: 'POST',
    body: JSON.stringify({
      value: hash
    })
  })
  if (res.ok) {
    const result = await res.json()
    return result.encodedLink
  } else {
    throw Error(res.statusText)
  }
}
