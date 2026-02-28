// Validações para TISS

export const validators = {
  // Validar CPF
  cpf: (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCpf.charAt(10))) return false;

    return true;
  },

  // Validar CNPJ
  cnpj: (cnpj: string): boolean => {
    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    if (cleanCnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;

    let length = cleanCnpj.length - 2;
    let numbers = cleanCnpj.substring(0, length);
    const digits = cleanCnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cleanCnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  },

  // Validar CID-10
  cid10: (cid: string): boolean => {
    const cleanCid = cid.replace(/[^\dA-Z]/g, '').toUpperCase();
    if (cleanCid.length < 3 || cleanCid.length > 5) return false;
    // Formato: A00.0 ou A00
    return /^[A-Z]\d{2}(\.\d)?$/.test(cid.toUpperCase());
  },

  // Validar código TUSS
  tuss: (codigo: string): boolean => {
    const cleanCode = codigo.replace(/[^\d]/g, '');
    // Códigos TUSS geralmente têm 8 dígitos
    return cleanCode.length >= 6 && cleanCode.length <= 10;
  },

  // Validar carteirinha
  carteirinha: (carteirinha: string, convenio?: string): boolean => {
    if (!carteirinha || carteirinha.trim().length < 6) return false;
    // Validações específicas por convênio podem ser adicionadas aqui
    return true;
  },

  // Formatar CPF
  formatCPF: (cpf: string): string => {
    const clean = cpf.replace(/[^\d]/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // Formatar CNPJ
  formatCNPJ: (cnpj: string): string => {
    const clean = cnpj.replace(/[^\d]/g, '');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  // Formatar CID-10
  formatCID10: (cid: string): string => {
    const clean = cid.replace(/[^\dA-Z]/gi, '').toUpperCase();
    if (clean.length <= 3) return clean;
    return `${clean.substring(0, 3)}.${clean.substring(3)}`;
  }
};

