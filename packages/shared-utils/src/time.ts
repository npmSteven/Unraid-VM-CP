export const getCurrentTimestampInSeconds = (): number => {
  return Math.floor(Date.now() / 1000)
}

export const hasTimestampExpired = (timestamp: number, maxAgeSeconds?: number): boolean => {
  const now = getCurrentTimestampInSeconds()
  return maxAgeSeconds ? now - timestamp > maxAgeSeconds : now > timestamp
}
