import { BadgeVariant } from "@/components/ui/Badge";

// --- BUMDes & Store Status ---
export function getBumdesStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING_VERIFICATION: "Menunggu Verifikasi",
    VERIFIED: "Aktif",
    REJECTED: "Ditolak",
    SUSPENDED: "Ditangguhkan",
  };
  return labels[status] || status;
}

export function getBumdesBadgeVariant(status: string): BadgeVariant {
  if (status === "VERIFIED") return "success";
  if (status === "PENDING_VERIFICATION") return "warning";
  if (status === "REJECTED") return "danger";
  if (status === "SUSPENDED") return "danger";
  return "neutral";
}

export function getStoreStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Nonaktif",
  };
  return labels[status] || status;
}

export function getStoreBadgeVariant(status: string): BadgeVariant {
  if (status === "ACTIVE") return "success";
  if (status === "INACTIVE") return "danger";
  return "neutral";
}

// --- Product Status ---
export function getProductStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Draf",
    WAITING_APPROVAL: "Menunggu Verifikasi",
    ACTIVE: "Aktif",
    INACTIVE: "Nonaktif",
    REJECTED: "Ditolak",
  };
  return labels[status] || status;
}

export function getProductBadgeVariant(status: string): BadgeVariant {
  if (status === "ACTIVE") return "success";
  if (status === "WAITING_APPROVAL") return "warning";
  if (status === "REJECTED" || status === "INACTIVE") return "danger";
  return "neutral";
}

// --- Order & Payment Status ---
export function getOrderStatusBadgeVariant(status: string): BadgeVariant {
  if (status === "COMPLETED") return "success";
  if (["WAITING_SELLER_CONFIRMATION", "WAITING_PAYMENT"].includes(status)) return "warning";
  if (["PAYMENT_REVIEW", "PROCESSING", "READY_TO_PICKUP", "SHIPPED_MANUAL"].includes(status)) return "primary";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

export function getPaymentStatusBadgeVariant(status: string): BadgeVariant {
  if (status === "PAID") return "success";
  if (status === "UNPAID") return "warning";
  if (status === "WAITING_REVIEW") return "primary";
  if (status === "REJECTED") return "danger";
  return "neutral";
}

// --- User Roles ---
export function getUserRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    PLATFORM_ADMIN: "Admin Platform",
    BUMDES_ADMIN: "Pengelola BUMDes",
    BUMDES_MEMBER: "Anggota BUMDes",
    CUSTOMER: "Pembeli",
  };
  return labels[role] || role;
}

export function getUserRoleBadgeVariant(role: string): BadgeVariant {
  if (role === "SUPER_ADMIN" || role === "PLATFORM_ADMIN") return "primary";
  if (role === "BUMDES_ADMIN") return "success";
  if (role === "BUMDES_MEMBER") return "warning";
  return "neutral";
}
