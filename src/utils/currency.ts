const currencyFormat = (value: number | string) => {
  if (typeof value !== 'undefined') {
    const price = parseFloat(String(value).replace(/\D/g, '') || '0');
    return 'Rp ' + String(price).replace(/(.)(?=(\d{3})+$)/g, '$1.');
  }
  return '';
};

const formatToRupiah = (value: string | number = 0) => {
  const currency = typeof value === 'string' ? parseInt(value, 10) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(currency);
};

export {currencyFormat, formatToRupiah};
