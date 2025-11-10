// Generate a random unique code
export function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Format number to 2 decimal places, hiding trailing zeros
export function formatCurrency(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '');
}

// Format number with 2 decimal places
export function formatNumber(value: number): string {
  return value.toFixed(2);
}

// Check if code is unique
export function isCodeUnique(code: string, existingCodes: string[]): boolean {
  return !existingCodes.includes(code);
}

// Generate unique code that doesn't exist
export function generateUniqueCode(existingCodes: string[]): string {
  let code = generateCode();
  while (!isCodeUnique(code, existingCodes)) {
    code = generateCode();
  }
  return code;
}

