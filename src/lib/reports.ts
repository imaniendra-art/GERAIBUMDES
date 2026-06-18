import { IOrder } from "@/models/Order";

export function formatDateToWIB(date?: Date | string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta"
  });
}

export function escapeCSV(text?: string | null): string {
  if (!text) return "";
  // Escape quotes
  const escaped = text.toString().replace(/"/g, '""');
  // Quote if it contains comma, newline or quotes
  if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
    return `"${escaped}"`;
  }
  return escaped;
}

export function exportOrdersToCSV(orders: any[]): string {
  const headers = [
    "Nomor Pesanan",
    "Tanggal Pesanan",
    "Tanggal Selesai",
    "Nama Pembeli",
    "Role Pembeli",
    "Nama Toko Penjual",
    "Jumlah Item",
    "Subtotal",
    "Ongkir",
    "Total",
    "Status Pesanan",
    "Status Pembayaran",
    "Metode Pembayaran",
    "Catatan Pembeli",
    "Catatan Penjual/Pengiriman"
  ];

  const rows = orders.map((o) => {
    // Hitung total kuantitas dari array items
    const totalItems = o.items?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0;
    
    // Penanganan populate sellerStoreId jika object atau string
    const storeName = o.sellerStoreId?.name || "Toko BUMDes";

    // Format catatan penjual (gabungan sellerNote dan manualShippingNote)
    const combinedSellerNotes = [o.sellerNote, o.manualShippingNote].filter(Boolean).join(" | ");

    return [
      escapeCSV(o.orderNumber),
      escapeCSV(formatDateToWIB(o.createdAt)),
      escapeCSV(formatDateToWIB(o.completedAt)),
      escapeCSV(o.buyerName),
      escapeCSV(o.buyerRole),
      escapeCSV(storeName),
      totalItems.toString(),
      (o.subtotal || 0).toString(),
      (o.shippingCost || 0).toString(),
      (o.total || 0).toString(),
      escapeCSV(o.status),
      escapeCSV(o.paymentStatus),
      escapeCSV(o.paymentMethod),
      escapeCSV(o.buyerNote),
      escapeCSV(combinedSellerNotes)
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
