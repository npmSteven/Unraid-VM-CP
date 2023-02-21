export const getCurrentTimestampInSeconds = () => Math.floor(Date.now() / 1000);

export const hasTimestampExpired = (timestamp: number): boolean => {
  const currentTimestampInSeconds = getCurrentTimestampInSeconds();
  return timestamp > currentTimestampInSeconds;
}
