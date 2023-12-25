export const shortenString = (value: string, length: number) => {
  if (value.length <= length) {
    return value
  }
  return `${value.substring(0, length / 2)}...${value.substring(
    value.length - length / 2,
    value.length
  )}`
}
