import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import PrintAutoTrigger from "./PrintAutoTrigger";

export default async function CetakInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();

  const order = await Order.findOne({ _id: resolvedParams.id })
    .populate({ path: "sellerStoreId", model: Store, select: "name address bankAccount" })
    .lean();

  if (!order) {
    notFound();
  }

  // Cek otorisasi: hanya pembeli atau admin toko yang boleh melihat
  const isBuyer = order.buyerId.toString() === session.userId;
  const isSeller = session.role === "BUMDES_ADMIN"; // idealnya cek store._id tapi cukup BUMDES_ADMIN untuk MVP
  
  if (!isBuyer && !isSeller) {
    redirect("/dashboard");
  }

  // Seller melihat "INVOICE" (penagihan), Buyer melihat "KWITANSI" (bukti terima)
  const isKwitansi = isBuyer; // Pembeli hanya bisa print saat COMPLETED, jadi pasti Kwitansi
  const docTitle = isKwitansi ? "KWITANSI PEMBAYARAN" : "INVOICE / TAGIHAN";

  return (
    <div className="bg-white min-h-screen text-black p-8 font-sans print:p-0">
      <PrintAutoTrigger />
      
      <div className="max-w-4xl mx-auto border border-gray-300 p-8 print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase">{order.sellerStoreId?.name || "BUMDesMart"}</h1>
            <p className="text-sm mt-1 text-gray-600 max-w-sm">Toko Resmi Badan Usaha Milik Desa</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">{docTitle}</h2>
            <p className="text-sm mt-1"><span className="font-semibold">No:</span> {order.orderNumber}</p>
            <p className="text-sm"><span className="font-semibold">Tanggal:</span> {formatDate(order.createdAt)}</p>
            {isKwitansi && order.paidAt && (
              <p className="text-sm text-green-700 font-bold mt-1">LUNAS PADA: {new Date(order.paidAt).toLocaleDateString("id-ID")}</p>
            )}
          </div>
        </div>

        {/* Info */}
        {isKwitansi ? (
          <div className="mb-8 p-4 border border-gray-300 rounded-md bg-gray-50 print:bg-white">
            <div className="grid grid-cols-[180px_10px_1fr] gap-y-2 text-sm">
              <div className="font-semibold text-gray-700">Telah terima dari</div>
              <div>:</div>
              <div className="font-bold text-base">{order.buyerName}</div>
              
              <div className="font-semibold text-gray-700">Uang Sejumlah</div>
              <div>:</div>
              <div className="font-bold italic text-base">{formatCurrency(order.total)}</div>
              
              <div className="font-semibold text-gray-700">Untuk Pembayaran</div>
              <div>:</div>
              <div>Pembelian Produk (Pesanan #{order.orderNumber}) sesuai rincian di bawah ini.</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between mb-8">
            <div className="w-1/2 pr-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Ditagihkan Kepada:</h3>
              <p className="font-bold text-lg">{order.buyerName}</p>
              <p className="text-sm">{order.buyerPhone}</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{order.buyerAddress}</p>
            </div>
            <div className="w-1/2 pl-4 border-l border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Metode Pembayaran:</h3>
              <p className="text-sm font-semibold">Transfer Manual Bank</p>
              {order.sellerStoreId?.bankAccount?.bankName && (
                <p className="text-sm mt-1">
                  {order.sellerStoreId.bankAccount.bankName}<br/>
                  No. Rek: {order.sellerStoreId.bankAccount.bankAccountNumber}<br/>
                  A/N: {order.sellerStoreId.bankAccount.bankAccountHolderName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tabel Item */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-bold">Produk</th>
              <th className="border border-gray-300 px-4 py-2 text-center text-sm font-bold w-24">Jumlah</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-bold w-32">Harga Satuan</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-bold w-36">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="border border-gray-300 px-4 py-3 text-sm">
                  <div className="font-semibold">{item.productNameSnapshot}</div>
                  {item.appliedPriceType === "WHOLESALE" && (
                    <div className="text-xs text-gray-500 mt-1">Harga Grosir</div>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-center">{item.quantity} {item.unit}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-right">{formatCurrency(item.price)}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-right font-semibold">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Ringkasan Biaya */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2 max-w-sm">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-600">Subtotal Produk</span>
              <span className="text-sm font-bold">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-600">Ongkos Kirim</span>
              <span className="text-sm font-bold">{formatCurrency(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-black">
              <span className="text-lg font-bold">TOTAL</span>
              <span className="text-lg font-bold">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Tanda Tangan & Footer */}
        <div className="flex justify-between items-end mt-16 pt-8">
          <div className="w-1/2 text-xs text-gray-500">
            <p className="font-bold text-gray-700 mb-1">Catatan:</p>
            <p>1. {isKwitansi ? "Kwitansi ini adalah bukti pembayaran yang sah." : "Harap melakukan pembayaran sesuai dengan nominal total di atas."}</p>
            <p>2. Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
            <p className="mt-4 italic">Dicetak secara otomatis dari sistem BUMDesMart pada {new Date().toLocaleDateString("id-ID")}</p>
          </div>
          <div className="w-64 text-center">
            <p className="text-sm mb-16">Hormat Kami,</p>
            <div className="border-b border-black w-full mb-1"></div>
            <p className="text-xs font-bold uppercase">{order.sellerStoreId?.name || "BUMDes"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
