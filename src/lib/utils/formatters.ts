/**
 * Format number to Indonesian Rupiah currency format.
 * Example: 15000 -> "Rp 15.000"
 */
export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Date object or date string to Indonesian locale format.
 * Example: "08 Jun 2026, 11:30 WIB"
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
}
