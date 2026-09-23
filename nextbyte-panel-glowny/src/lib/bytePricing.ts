export const BYTE_REFERENCE_PRICE_PLN = 0.1;

export const formatBytesPerPln = (bytes: number, pricePln: number) => {
  if (!pricePln || pricePln <= 0) return '—';
  return `${(bytes / pricePln).toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Byte / zł`;
};

export const formatGroszPerByte = (bytes: number, pricePln: number) => {
  if (!bytes || bytes <= 0) return '—';
  return `${((pricePln / bytes) * 100).toLocaleString('pl-PL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} gr / Byte`;
};

export const formatInfrastructureShare = (bytes: number, pricePln: number) => {
  if (!pricePln || pricePln <= 0) return '—';
  const byteValue = bytes * BYTE_REFERENCE_PRICE_PLN;
  const share = Math.round((byteValue / pricePln) * 100);
  return `${share}% ceny w Byte`;
};