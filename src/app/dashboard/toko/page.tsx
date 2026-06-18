import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Store as StoreIcon, Edit, MapPin, Phone, Building, Clock, Landmark, AlertCircle } from "lucide-react";

export default async function DashboardTokoPage() {
  const session = await getSession();
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  const profile = await BumdesProfile.findOne({ userId: session.userId });
  if (!profile || profile.verificationStatus !== "VERIFIED") {
    redirect("/dashboard");
  }

  const store = await Store.findOne({ bumdesId: profile._id });
  if (!store) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Profil Toko BUMDes</h1>
          <p className="text-text-muted">Kelola informasi toko dan rekening pembayaran manual.</p>
        </div>
        <Link href="/dashboard/toko/edit">
          <Button className="flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profil Toko
          </Button>
        </Link>
      </div>

      {!store.bankAccount?.bankAccountNumber && (
        <div className="bg-error/10 border border-error/20 text-error-dark p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold mb-1">Rekening Pembayaran Belum Diatur</h4>
            <p className="text-sm">Pembeli tidak akan dapat melihat instruksi pembayaran saat melakukan checkout pesanan. Segera lengkapi data rekening toko Anda.</p>
            <Link href="/dashboard/toko/edit" className="text-sm font-semibold underline mt-2 inline-block">
              Lengkapi Sekarang
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="h-32 bg-primary/20 relative rounded-t-lg overflow-hidden">
              {store.bannerUrl && (
                <img src={store.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              )}
            </div>
            <CardContent className="pt-0 relative">
              <div className="absolute -top-12 left-6 h-24 w-24 bg-surface rounded-lg border-4 border-surface shadow-sm overflow-hidden flex items-center justify-center">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <StoreIcon className="h-10 w-10 text-primary" />
                )}
              </div>
              
              <div className="pt-14">
                <h2 className="text-2xl font-bold text-text-main mb-1">{store.name}</h2>
                <div className="flex items-center text-sm text-text-muted mb-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold mr-3 ${store.status === "ACTIVE" ? "bg-success/20 text-success-dark" : "bg-warning/20 text-warning-dark"}`}>
                    {store.status}
                  </span>
                  <span>{store.businessType || profile.businessType}</span>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Deskripsi Toko</h3>
                  <p className="text-text-main whitespace-pre-wrap">{store.description || "Belum ada deskripsi."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" /> Informasi Lokasi & Kontak
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-text-muted uppercase mb-1">Alamat Operasional</h4>
                  <p className="text-sm font-medium">{store.address || "-"}</p>
                  <p className="text-sm text-text-muted mt-1">
                    {store.village || profile.village}, {store.district || profile.district}<br/>
                    {store.regency || profile.regency}, {store.province || profile.province}
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs text-text-muted uppercase mb-1 flex items-center">
                      <Phone className="h-3 w-3 mr-1" /> WhatsApp / Telepon
                    </h4>
                    <p className="text-sm font-medium">{store.whatsappNumber || store.phoneNumber || "-"}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-text-muted uppercase mb-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Jam Operasional
                    </h4>
                    <p className="text-sm font-medium">{store.operationalHours || "Belum diatur"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <h3 className="text-lg font-semibold flex items-center">
                <Landmark className="h-5 w-5 mr-2 text-primary" /> Rekening Pembayaran
              </h3>
            </CardHeader>
            <CardContent className="pt-6">
              {store.bankAccount?.bankAccountNumber ? (
                <div className="space-y-4">
                  <div className="bg-surface-bg p-4 rounded border border-border">
                    <p className="text-xs text-text-muted uppercase mb-1">Bank</p>
                    <p className="font-bold text-lg mb-3">{store.bankAccount.bankName}</p>
                    
                    <p className="text-xs text-text-muted uppercase mb-1">Nomor Rekening</p>
                    <p className="font-mono text-lg mb-3 tracking-wider">{store.bankAccount.bankAccountNumber}</p>
                    
                    <p className="text-xs text-text-muted uppercase mb-1">Atas Nama</p>
                    <p className="font-medium">{store.bankAccount.bankAccountHolderName}</p>
                  </div>
                  
                  {store.bankAccount.paymentNote && (
                    <div>
                      <p className="text-xs text-text-muted uppercase mb-1">Catatan Tambahan</p>
                      <p className="text-sm italic text-text-muted">{store.bankAccount.paymentNote}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Landmark className="h-12 w-12 text-border mx-auto mb-3" />
                  <p className="text-sm text-text-muted mb-4">Anda belum mengatur rekening pembayaran manual untuk toko ini.</p>
                  <Link href="/dashboard/toko/edit">
                    <Button variant="outline" size="sm" className="w-full">Atur Rekening</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
