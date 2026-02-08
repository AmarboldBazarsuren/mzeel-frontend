// mzeel-app/src/utils/formatters.js

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0₮';
  return `${amount.toLocaleString('mn-MN')}₮`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('mn-MN');
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  // 89549988 -> 8954-9988
  return phone.replace(/(\d{4})(\d{4})/, '$1-$2');
};