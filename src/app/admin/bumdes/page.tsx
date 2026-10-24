import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import "@/models/User";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { getBumdesBadgeVariant, getBumdesStatusLabel } from "@/lib/utils/status";
import { BumdesActionButtons } from "@/components/admin/BumdesActionButtons";
import { Search, Filter, Store, AlertCircle, CheckCircle, XCircle, AlertTriangle, PauseCircle } from "lucide-react";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";

export default async function AdminBumdesList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await dbConnect();
  const { q, status } = await searchParams;
  
  // Build query
  const query: any = {};
  if (q) {
    query.name = { $regex: q, $options: "i" };
  }
  if (status && status !== "ALL") {
    query.verificationStatus = status;
  }

  // Fetch data
  const profiles = await BumdesProfile.find(query)
    .populate("userId", "name phoneNumber")
    .lean();

  // Custom Sorting: Pending Verification (1), Verified (2), Suspended (3), Rejected (4), then Terbaru (Newest first)
  const statusWeight: Record<string, number> = {
    PENDING_VERIFICATION: 1,
    VERIFIED: 2,
    SUSPENDED: 3,
    REJECTED: 4,
  };

  profiles.sort((a, b) => {
    const weightA = statusWeight[a.verificationStatus] || 99;
    const weightB = statusWeight[b.verificationStatus] || 99;
    
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    
    // Within same status, newest first
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  // Calculate stats
  const allProfiles = await BumdesProfile.find().lean();
  const totalBumdes = allProfiles.length;
  const pendingBumdes = allProfiles.filter(p => p.verificationStatus === "PENDING_VERIFICATION").length;
  const activeBumdes = allProfiles.filter(p => p.verificationStatus === "VERIFIED").length;
  const suspendedBumdes = allProfiles.filter(p => p.verificationStatus === "SUSPENDED").length;
  const rejectedBumdes = allProfiles.filter(p => p.verificationStatus === "REJECTED").length;

  // Detect potential duplicates across all registered profiles
  const duplicateIdSet = new Set<string>();
  for (let i = 0; i < allProfiles.length; i++) {
    for (let j = i + 1; j < allProfiles.length; j++) {
      const p1 = allProfiles[i];
      const p2 = allProfiles[j];

      const sameVillage =
        p1.village &&
        p2.village &&
        p1.village.trim().toLowerCase() === p2.village.trim().toLowerCase() &&
        p1.district &&
        p2.district &&
        p1.district.trim().toLowerCase() === p2.district.trim().toLowerCase();

      const c1 = p1.contactNumber ? p1.contactNumber.replace(/\D/g, "") : "";
      const c2 = p2.contactNumber ? p2.contactNumber.replace(/\D/g, "") : "";
      const sameContact = c1 && c2 && c1.length >= 8 && c1 === c2;

      const sameName =
        p1.name &&
        p2.name &&
        p1.name.trim().toLowerCase() === p2.name.trim().toLowerCase();

      if (sameVillage || sameContact || sameName) {
        duplicateIdSet.add(p1._id.toString());
        duplicateIdSet.add(p2._id.toString());
      }
    }
  }

  const formatWhatsAppUrl = (phone?: string) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      return `https://wa.me/62${cleaned.substring(1)}`;
    }
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola BUMDes</h1>
          <p className="text-text-muted text-sm mt-1">Kelola direktori, akun pengelola, status verifikasi, dan penangguhan BUMDes</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-text-muted">Total BUMDes</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">{totalBumdes}</h3>
              </div>
              <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Store className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-warning-dark">Perlu Verifikasi</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-warning-dark">{pendingBumdes}</h3>
              </div>
              <div className="h-9 w-9 bg-warning/20 rounded-full flex items-center justify-center text-warning-dark">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/50 bg-success/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-success-dark">BUMDes Aktif</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-success-dark">{activeBumdes}</h3>
              </div>
              <div className="h-9 w-9 bg-success/20 rounded-full flex items-center justify-center text-success-dark">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-700">Ditangguhkan</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-amber-700">{suspendedBumdes}</h3>
              </div>
              <div className="h-9 w-9 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-700">
                <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-danger/50 bg-danger/5 col-span-2 sm:col-span-1">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-danger">Ditolak</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-danger">{rejectedBumdes}</h3>
              </div>
              <div className="h-9 w-9 bg-danger/20 rounded-full flex items-center justify-center text-danger">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-surface-bg">
          <div className="flex items-center gap-3">
            <form className="relative" method="GET" action="/admin/bumdes">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari BUMDes..."
                className="pl-9 pr-4 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-[250px]"
              />
              {status && <input type="hidden" name="status" value={status} />}
            </form>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <form method="GET" action="/admin/bumdes">
                {q && <input type="hidden" name="q" value={q} />}
                <AutoSubmitSelect 
                  name="status"
                  defaultValue={status || "ALL"}
                  className="pl-9 pr-8 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
                  <option value="VERIFIED">Aktif</option>
                  <option value="SUSPENDED">Ditangguhkan (Suspended)</option>
                  <option value="REJECTED">Ditolak</option>
                </AutoSubmitSelect>
              </form>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm text-left text-text-main">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama BUMDes</th>
                <th className="px-6 py-4 font-semibold">Lokasi</th>
                <th className="px-6 py-4 font-semibold">Pengelola</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tanggal Daftar</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((profile) => {
                const user = profile.userId as any;
                const pengelolaName = profile.directorName || user?.name || "-";
                const pengelolaPhone = profile.contactNumber || user?.phoneNumber || "-";
                const waUrl = formatWhatsAppUrl(pengelolaPhone !== "-" ? pengelolaPhone : undefined);
                const isDuplicate = duplicateIdSet.has(profile._id.toString());

                return (
                <tr key={profile._id.toString()} className="hover:bg-surface-bg/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-text-main">{profile.name}</p>
                      {isDuplicate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 text-warning-dark border border-warning/30" title="Terdeteksi pendaftaran lain dengan Desa, Kontak, atau Nama yang sama">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0 text-warning" /> Potensi Duplikat
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted truncate max-w-[200px]">{profile.businessType}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-main">{profile.village}</p>
                    <p className="text-xs text-text-muted">{profile.district}, {profile.regency}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-main">{pengelolaName}</p>
                    {pengelolaPhone !== "-" && waUrl ? (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                        {pengelolaPhone}
                      </a>
                    ) : (
                      <p className="text-xs text-text-muted mt-0.5">{pengelolaPhone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getBumdesBadgeVariant(profile.verificationStatus)} className="font-medium">
                      {getBumdesStatusLabel(profile.verificationStatus)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(profile.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <BumdesActionButtons
                      bumdesId={profile._id.toString()}
                      bumdesName={profile.name}
                      status={profile.verificationStatus}
                      suspensionReason={profile.suspensionReason}
                    />
                  </td>
                </tr>
              )})}
              
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState 
                      title="Tidak Ada Data BUMDes" 
                      description={q || status ? "Coba sesuaikan filter atau kata kunci pencarian Anda." : "Belum ada BUMDes yang terdaftar di platform."} 
                      icon="folder" 
                      className="border-0 rounded-none bg-transparent py-16"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
