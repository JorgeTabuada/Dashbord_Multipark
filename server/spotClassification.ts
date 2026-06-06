/**
 * Decodifica o número de allocation da Multipark para descobrir marca e
 * tipo de lugar.
 *
 * Estrutura (5 dígitos):
 *  - 1º dígito = marca (1=Airpark, 2=Redpark, 3=Skypark)
 *  - Resto (0000-9999):
 *      0000–4999 → uncovered (descoberto)
 *      5000–7999 → covered (coberto)
 *      8000–9999 → indoor
 *
 * Para parques com allocation em letras (Top-Parking, etc.) → unknown.
 */

export type SpotType = "covered" | "uncovered" | "indoor" | "unknown";
export type ParkBrand = "airpark" | "redpark" | "skypark" | "other";

export function classifyAllocation(allocation: string | null | undefined): {
  parkBrand: ParkBrand;
  spotType: SpotType;
} {
  if (!allocation || typeof allocation !== "string") {
    return { parkBrand: "other", spotType: "unknown" };
  }
  const trimmed = allocation.trim();
  if (!/^\d{4,6}$/.test(trimmed)) {
    return { parkBrand: "other", spotType: "unknown" };
  }
  const num = parseInt(trimmed, 10);
  const brandDigit = Math.floor(num / 10000);

  let parkBrand: ParkBrand;
  if (brandDigit === 1) parkBrand = "airpark";
  else if (brandDigit === 2) parkBrand = "redpark";
  else if (brandDigit === 3) parkBrand = "skypark";
  else return { parkBrand: "other", spotType: "unknown" };

  const lowFour = num % 10000;
  let spotType: SpotType;
  if (lowFour < 5000) spotType = "uncovered";
  else if (lowFour < 8000) spotType = "covered";
  else spotType = "indoor";
  return { parkBrand, spotType };
}
