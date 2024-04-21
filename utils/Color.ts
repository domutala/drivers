function rgbToHex(rgb: number[]): string {
  // Vérifier que les valeurs RGB sont valides
  if (rgb.length !== 3 || rgb.some((val) => val < 0 || val > 255)) {
    throw new Error("Les valeurs RGB doivent être comprises entre 0 et 255.");
  }

  // Convertir chaque composante RGB en hexadécimal et les concaténer
  const hex = rgb.map((val) => {
    const hexVal = val.toString(16).toUpperCase();
    return hexVal.length === 1 ? "0" + hexVal : hexVal; // Assurer que chaque composante a deux chiffres hexadécimaux
  });

  return `#${hex.join("")}`;
}

function getBrightness(rgb: number[]): string {
  // Calculer la luminance relative en utilisant la formule YIQ
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

  // Si la luminance est supérieure à 0.5, la couleur est considérée comme claire (light), sinon elle est considérée comme foncée (dark)
  return luminance > 0.5 ? "light" : "dark";
}

export default { rgbToHex, getBrightness };
