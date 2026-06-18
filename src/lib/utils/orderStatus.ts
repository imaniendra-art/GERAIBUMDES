/**
 * Define valid transitions for the order state machine.
 */
export const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  WAITING_SELLER_CONFIRMATION: ["WAITING_PAYMENT", "CANCELLED"],
  WAITING_PAYMENT: ["PAYMENT_REVIEW", "CANCELLED"],
  PAYMENT_REVIEW: ["PROCESSING", "WAITING_PAYMENT"], // WAITING_PAYMENT = rejected payment
  PROCESSING: ["READY_TO_PICKUP", "SHIPPED_MANUAL", "CANCELLED"],
  READY_TO_PICKUP: ["COMPLETED"],
  SHIPPED_MANUAL: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Validates if the transition from currentStatus to newStatus is allowed.
 */
export function canTransitionOrderStatus(currentStatus: string, newStatus: string): boolean {
  if (!VALID_ORDER_TRANSITIONS[currentStatus]) return false;
  return VALID_ORDER_TRANSITIONS[currentStatus].includes(newStatus);
}

/**
 * Translate Order Status to human-readable Indonesian label.
 */
export function orderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    WAITING_SELLER_CONFIRMATION: "Menunggu Konfirmasi Ongkir",
    WAITING_PAYMENT: "Menunggu Pembayaran",
    PAYMENT_REVIEW: "Review Pembayaran",
    PROCESSING: "Sedang Diproses",
    READY_TO_PICKUP: "Siap Diambil",
    SHIPPED_MANUAL: "Sedang Dikirim",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };
  return labels[status] || status;
}

/**
 * Translate Payment Status to human-readable Indonesian label.
 */
export function paymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    UNPAID: "Belum Bayar",
    WAITING_REVIEW: "Menunggu Review",
    PAID: "Lunas",
    REJECTED: "Ditolak",
  };
  return labels[status] || status;
}
