export const shortenString = (value: string, length: number) => {
  if (value.length <= length) {
    return value
  }
  return `${value.substring(0, length / 2)}...${value.substring(value.length - length / 2, value.length)}`
}

export const hexToString = (hex: String) => {
  let str = ''
  for (let i = 0; i < hex.length; i += 2) {
    const hexValue = hex.substring(i, 2)
    const decimalValue = parseInt(hexValue, 16)
    str += String.fromCharCode(decimalValue)
  }
  return str
}

export const stringToHex = (str: String) => {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    const hexValue = charCode.toString(16)

    // Pad with zeros to ensure two-digit representation
    hex += hexValue.padStart(2, '0')
  }
  return hex
}
