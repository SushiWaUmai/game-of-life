// jungle: "#0F1A19"
export const jungle = [15 / 255, 26 / 255, 25 / 255, 255 / 255];

// chocolate: "#242119"
export const chocolate = [36 / 255, 33 / 255, 25 / 255, 255 / 255];

// gunmetal: "#2A333C"
export const gunmetal = [42 / 255, 51 / 255, 60 / 255, 255 / 255];

// lavender: "#D0A5C0"
export const lavender = [208 / 255, 165 / 255, 192 / 255, 255 / 255];

// orchid: "#F6C0D0"
export const orchid = [246 / 255, 192 / 255, 208 / 255, 255 / 255];

export const hexToRGBA = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
        1,
      ]
    : null;
};

export const RGBAToHex = ([r, g, b, a]: number[]) => {
  [r, g, b] = [r, g, b].map((v) => Math.round(v * 255));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).reduce((a, b) => a + b)}`;
};
