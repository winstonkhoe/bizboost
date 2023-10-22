const currencyFormat = (value: number | string) => {
  if (typeof value !== 'undefined') {
    const price = parseFloat(String(value).replace(/\D/g, '') || '0');
    return 'Rp ' + String(price).replace(/(.)(?=(\d{3})+$)/g, '$1.');
  }
  return '';
};

export {currencyFormat};
