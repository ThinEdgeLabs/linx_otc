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
