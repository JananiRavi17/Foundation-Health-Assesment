/**
 * Known product names on the Sauce Demo inventory page.
 * Referencing products by name (rather than a raw slug) keeps specs expressive.
 */
export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTShirt: 'Test.allTheThings() T-Shirt (Red)',
} as const;

export type ProductName = (typeof products)[keyof typeof products];

/**
 * Sauce Demo derives an add-to-cart button id from the product name:
 * lowercased, spaces to hyphens, punctuation stripped.
 * e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack".
 */
export function toProductId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[().]/g, '')
    .replace(/\s+/g, '-');
}
