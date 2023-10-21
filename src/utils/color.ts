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
    if (!alpha) {
      alpha = 1;
    }
    // Return the RGBA string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (!alpha) {
    alpha = 1;
  }
  return `rgba(255, 255, 255, ${alpha})`;
};

interface RGBA2HexProps {
  rgba: string;
  alpha?: number;
}

export const rgba2hex = ({rgba, alpha}: RGBA2HexProps) => {
  console.log(rgba);
  // Check if the input is a hex color
  if (isHex(rgba)) {
    // If an alpha value is provided, append it to the hex color
    if (alpha !== undefined) {
      let a = Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0');
      return `${rgba}${a}`;
    }
    // If no alpha value is provided, return the hex color as is
    return rgba;
  } else {
    let values: any = rgba.match(/(\d+\.?\d*)/g);
    if (values && values.length >= 3) {
      // Convert each RGBA value to hexadecimal
      let r = parseInt(values[0], 10).toString(16).padStart(2, '0');
      let g = parseInt(values[1], 10).toString(16).padStart(2, '0');
      let b = parseInt(values[2], 10).toString(16).padStart(2, '0');
      let a =
        alpha !== undefined
          ? Math.round(alpha * 255)
              .toString(16)
              .padStart(2, '0')
          : values.length === 4
          ? Math.round(values[3] * 255)
              .toString(16)
              .padStart(2, '0')
          : 'FF';
      // Return the hex code with a hash sign
      return `#${r}${g}${b}${a}`;
    }
    return '#FFFFFF';
  }
};

export const isHex = (str: string) => {
  let regex = /^#([\da-f]{6}([\da-f]{2})?)$/i;
  return regex.test(str);
};

export const isRgba = (str: string) => {
  let regex = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(\.\d+)?)\)$/;
  return regex.test(str);
};
