import type { Loan } from '@/types'

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
