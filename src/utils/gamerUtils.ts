// src/utils/gamerUtils.ts

export const formatCurrency = (amount: number | string) => {
  return new Number(amount).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  });
};

export const calculateFinalPrice = (price: number, discount: number, onSale: boolean) => {
  return onSale ? price * (1 - discount / 100) : price;
};

export const formatSubCategory = (text: string) => {
  if (!text) return '';
  let cleanText = text
    .replace(/>/g, '')
    .replace(/\//g, '')
    .replace(/SUB_SECTOR:/g, '')
    .replace(/DATA_STREAM/g, '')
    .replace(/DETECCION_GÉNERO/g, '')
    .replace(/DETECCION_GENERO/g, '')
    .trim();
  return cleanText.split(',').map(item => item.trim()).join(' • ');
};