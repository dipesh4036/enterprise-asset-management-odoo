/**
 * Formatting utilities
 * Centralised helpers for displaying data consistently across the app.
 */

/**
 * Format a number as a currency string (USD by default)
 * @example formatCurrency(12500) → "$12,500.00"
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a large number with commas
 * @example formatNumber(100000) → "100,000"
 */
export function formatNumber(
  value: number | null | undefined,
  locale = "en-US"
): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Converts an enum-style string to a readable label
 * @example formatLabel("ASSET_MANAGER") → "Asset Manager"
 * @example formatLabel("UNDER_MAINTENANCE") → "Under Maintenance"
 */
export function formatLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Truncate a string to a maximum length, appending ellipsis if needed
 * @example truncate("This is a very long string", 20) → "This is a very long…"
 */
export function truncate(value: string | null | undefined, maxLength = 50): string {
  if (!value) return "—";
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

/** @deprecated Use `truncate()` instead */
export function truncateText(text: string, maxLength: number): string {
  return truncate(text, maxLength);
}

/**
 * Format a file size in bytes into a human-readable string
 * @example formatFileSize(1048576) → "1.00 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Pluralise a word based on a count
 * @example pluralize(1, "asset") → "1 asset"
 * @example pluralize(5, "asset") → "5 assets"
 */
export function pluralize(count: number, word: string, plural?: string): string {
  if (count === 1) return `${count} ${word}`;
  return `${count} ${plural ?? word + "s"}`;
}
