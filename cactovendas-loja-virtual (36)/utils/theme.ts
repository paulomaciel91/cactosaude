
// Converts hex to "r g b" string for Tailwind CSS variables
export const hexToRgb = (hex: string): string | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
};

// Generates a lighter or darker variant of a hex color.
// Amount is percentage: -100 to 100. Negative = darker, Positive = lighter.
export const getVariantColor = (hex: string, amount: number): string | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  if (amount < 0) {
      // Darken
      const factor = 1 + (amount / 100); 
      r = Math.round(r * factor);
      g = Math.round(g * factor);
      b = Math.round(b * factor);
  } else {
      // Lighten
      const factor = amount / 100;
      r = Math.round(r + (255 - r) * factor);
      g = Math.round(g + (255 - g) * factor);
      b = Math.round(b + (255 - b) * factor);
  }
  
  return `${Math.min(255, Math.max(0, r))} ${Math.min(255, Math.max(0, g))} ${Math.min(255, Math.max(0, b))}`;
};
