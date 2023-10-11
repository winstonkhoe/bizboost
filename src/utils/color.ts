interface Hex2RGBAProps {
  hex: string;
  alpha?: number;
}
export const hex2rgba = ({hex, alpha}: Hex2RGBAProps) => {
  if (!isHex(hex)) {
    hex = rgba2hex({rgba: hex});
  }
  // Extract the hex digits into an array
  let digits = hex.match(/[\da-f]{2}/gi);

  if (digits && digits?.length > 0) {
    // Convert each hex digit to decimal
    let r = parseInt(digits[0], 16);
    let g = parseInt(digits[1], 16);
    let b = parseInt(digits[2], 16);
    // Add this line to get the alpha value from the last hex pair
    if (!alpha && digits.length === 4) {
      let a = parseInt(digits[3], 16) / 255;
      alpha = a;
    }
    // Return the RGBA string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(255, 255, 255, ${alpha})`;
};

interface RGBA2HexProps {
  rgba: string;
}

export const rgba2hex = ({rgba}: RGBA2HexProps) => {
  // Extract the RGBA values into an array
  let values: any = rgba.match(/(\d+\.?\d*)/g);

  if (values && values.length === 4) {
    // Convert each RGBA value to hexadecimal
    let r = parseInt(values[0], 16).toString(16).padStart(2, '0');
    let g = parseInt(values[1], 16).toString(16).padStart(2, '0');
    let b = parseInt(values[2], 16).toString(16).padStart(2, '0');
    let a = Math.round(values[3] * 255)
      .toString(16)
      .padStart(2, '0');
    // Return the hex code with a hash sign
    return `#${r}${g}${b}${a}`;
  }
  return '#FFFFFF';
};

export const isHex = (str: string) => {
  let regex = /^#([\da-f]{6})$/i;
  return regex.test(str);
};

export const isRgba = (str: string) => {
  let regex = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(\.\d+)?)\)$/;
  return regex.test(str);
};
