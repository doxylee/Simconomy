/**
 * Add total property to the array and returns it.
 * WARNING: This mutates given array.
 * @param arr - Array to add total property
 * @param total - Value of total property.
 */
export function arrayWithTotal<T>(arr: T[], total: number): T[] & { total: number } {
    (arr as T[] & { total: number }).total = total;
    return arr as T[] & { total: number };
}
