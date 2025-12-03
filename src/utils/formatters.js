export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', { 
    style: 'currency', 
    currency: 'BOB' 
  }).format(value);
};

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-BO', options);
};

export const formatShortDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-BO', {
    month: 'short',
    day: 'numeric'
  });
};