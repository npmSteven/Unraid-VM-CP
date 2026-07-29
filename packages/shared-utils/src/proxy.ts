export const parseTrustProxy = (value?: string): boolean | number | string => {
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  const num = parseInt(value, 10);
  if (!isNaN(num)) return num;
  return value;
};
