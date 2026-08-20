/**
 * Applying one market's overrides to the catalogue.
 *
 * The catalogue is written once, in rand and in South African English. A market
 * that charges differently or uses a different word does not get its own copy of
 * the catalogue — it states only what it changes, keyed by catalogue id, and
 * this applies those entries over the shared list.
 */

/**
 * Replace one field of every entry the market has an opinion about.
 *
 * Membership is tested with `id in overrides` rather than a truthy lookup, so a
 * deliberate zero — or a deliberate empty string — is applied instead of quietly
 * falling back to the catalogue. Several UK surcharges are legitimately zero.
 */
export function withOverrides<T extends { id: string }, K extends keyof T>(
  entries: T[],
  field: K,
  overrides: Record<string, T[K]> | undefined,
): T[] {
  if (!overrides) return entries;
  return entries.map((entry) =>
    entry.id in overrides ? { ...entry, [field]: overrides[entry.id] } : entry,
  );
}
