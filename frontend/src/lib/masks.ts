/**
 * Funções utilitárias para aplicar máscaras em inputs
 */

/**
 * Máscara de CPF: 000.000.000-00
 */
export const maskCPF = (value: string): string => {
  if (!value) return '';

  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);

  // Aplica a máscara
  return limited
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Máscara de Telefone: (00) 0000-0000
 */
export const maskPhone = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 10);

  return limited
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
};

/**
 * Máscara de Celular: (00) 00000-0000
 */
export const maskCellPhone = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 11);

  return limited
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

/**
 * Máscara de CEP: 00000-000
 */
export const maskCEP = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 8);

  return limited.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

/**
 * Máscara de RG: 00.000.000-0
 */
export const maskRG = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 9);

  return limited
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})$/, '$1-$2');
};

/**
 * Máscara de Data: 00/00/0000
 */
export const maskDate = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 8);

  return limited
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d{1,4})$/, '$1/$2');
};

/**
 * Remove a máscara e retorna apenas números
 */
export const unmask = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Formata número para moeda brasileira
 */
export const maskCurrency = (value: string | number): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue || 0);
};
