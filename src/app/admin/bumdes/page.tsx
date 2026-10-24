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
import { 
  Search, 
  Filter, 
  Store, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  PauseCircle,
  MapPin,
  Briefcase,
  ArrowUpDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Phone
} from "lucide-react";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";

export default async function AdminBumdesList({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    province?: string;
    businessType?: string;
    sortBy?: string;
    page?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  await dbConnect();
  
  const q = resolvedSearchParams.q?.trim() || "";
  const statusFilter = resolvedSearchParams.status || "ALL";
  const provinceFilter = resolvedSearchParams.province || "ALL";
  const businessTypeFilter = resolvedSearchParams.businessType || "ALL";
  const sortBy = resolvedSearchParams.sortBy || "priority";
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const limit = 10;
  const skip = (page - 1) * limit;

  // 1. Build Query Filter
  const query: Record<string, any> = {};
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { village: { $regex: q, $options: "i" } },
      { district: { $regex: q, $options: "i" } },
      { regency: { $regex: q, $options: "i" } },
      { directorName: { $regex: q, $options: "i" } },
    ];
  }
  if (statusFilter !== "ALL") {
    query.verificationStatus = statusFilter;
  }
  if (provinceFilter !== "ALL") {
    query.province = provinceFilter;
  }
  if (businessTypeFilter !== "ALL") {
    query.businessType = { $regex: businessTypeFilter, $options: "i" };
  }

  // 2. Summary Counts across ALL BUMDes
  const allProfiles = await BumdesProfile.find({}, "verificationStatus").lean();
  const totalBumdes = allProfiles.length;
  const pendingBumdes = allProfiles.filter(p => p.verificationStatus === "PENDING_VERIFICATION").length;
  const activeBumdes = allProfiles.filter(p => p.verificationStatus === "VERIFIED").length;
  const suspendedBumdes = allProfiles.filter(p => p.verificationStatus === "SUSPENDED").length;
  const rejectedBumdes = allProfiles.filter(p => p.verificationStatus === "REJECTED").length;

  // 3. Dynamic Filter Options from Database
  const registeredProvinces = (await BumdesProfile.distinct("province")).filter(Boolean).sort() as string[];
  const rawBusinessTypes = (await BumdesProfile.distinct("businessType")).filter(Boolean) as string[];
  // Split comma-separated business types into unique values
  const businessTypeSet = new Set<string>();
  rawBusinessTypes.forEach(bt => {
    bt.split(",").forEach(t => {
      const trimmed = t.trim();
      if (trimmed) businessTypeSet.add(trimmed);
    });
  });
  const registeredBusinessTypes = Array.from(businessTypeSet).sort();

  // 4. Total Filtered Count
  const totalFiltered = await BumdesProfile.countDocuments(query);
  const totalPages = Math.ceil(totalFiltered / limit);

  // 5. MongoDB Aggregation Pipeline for High-Scale Sorting & Pagination
  let sortStage: Record<string, any> = { statusPriority: 1, createdAt: -1 };
  if (sortBy === "newest") sortStage = { createdAt: -1 };
  else if (sortBy === "oldest") sortStage = { createdAt: 1 };
  else if (sortBy === "name_asc") sortStage = { name: 1 };
  else if (sortBy === "name_desc") sortStage = { name: -1 };
  else if (sortBy === "province_asc") sortStage = { province: 1, regency: 1, name: 1 };

  const pipeline: any[] = [
    { $match: query },
    {
      $addFields: {
        statusPriority: {
          $switch: {
            branches: [
              { case: { $eq: ["$verificationStatus", "PENDING_VERIFICATION"] }, then: 1 },
              { case: { $eq: ["$verificationStatus", "VERIFIED"] }, then: 2 },
              { case: { $eq: ["$verificationStatus", "SUSPENDED"] }, then: 3 },
              { case: { $eq: ["$verificationStatus", "REJECTED"] }, then: 4 },
            ],
            default: 5,
          },
        },
      },
    },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const profiles = await BumdesProfile.aggregate(pipeline);

  // Helper WhatsApp formatter
  const formatWhatsAppUrl = (phone?: string) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      return `https://wa.me/62${cleaned.substring(1)}`;
    }
    return `https://wa.me/${cleaned}`;
  };

  // Helper URL builder
  const createFilterUrl = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams();
    const current: Record<string, any> = {
      q,
      status: statusFilter,
      province: provinceFilter,
      businessType: businessTypeFilter,
      sortBy,
      page: "1",
      ...overrides,
    };

    if (current.q) params.set("q", current.q.toString());
    if (current.status && current.status !== "ALL") params.set("status", current.status.toString());
    if (current.province && current.province !== "ALL") params.set("province", current.province.toString());
    if (current.businessType && current.businessType !== "ALL") params.set("businessType", current.businessType.toString());
    if (current.sortBy && current.sortBy !== "priority") params.set("sortBy", current.sortBy.toString());
    if (current.page && current.page !== "1") params.set("page", current.page.toString());

    const qs = params.toString();
    return `/admin/bumdes${qs ? `?${qs}` : ""}`;
  };

  const isFiltered = q || statusFilter !== "ALL" || provinceFilter !== "ALL" || businessTypeFilter !== "ALL" || sortBy !== "priority";

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Kelola BUMDes</h1>
          <p className="text-text-muted text-sm mt-1">
            Direktori pusat BUMDes se-Indonesia, akun pengelola, verifikasi legalitas, dan status operasional.
          </p>
        </div>
      </div>

      {/* SUMMARY STATS CARDS (Responsif tanpa terpotong di resolusi laptop apa pun) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <Link href={createFilterUrl({ status: "ALL", page: 1 })}>
          <Card className={`border-border hover:border-primary/50 transition-all rounded-2xl ${statusFilter === "ALL" ? "ring-2 ring-primary/40 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total BUMDes</p>
                  <h3 className="text-xl sm:text-2xl font-black text-text-main mt-1">{totalBumdes}</h3>
                </div>
                <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Store className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href={createFilterUrl({ status: "PENDING_VERIFICATION", page: 1 })}>
          <Card className={`border-warning/40 bg-warning/5 hover:border-warning transition-all rounded-2xl ${statusFilter === "PENDING_VERIFICATION" ? "ring-2 ring-warning/60 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-warning-dark uppercase tracking-wider">Perlu Verifikasi</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-warning-dark">{pendingBumdes}</h3>
                </div>
                <div className="h-9 w-9 bg-warning/20 rounded-xl flex items-center justify-center text-warning-dark shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl({ status: "VERIFIED", page: 1 })}>
          <Card className={`border-success/40 bg-success/5 hover:border-success transition-all rounded-2xl ${statusFilter === "VERIFIED" ? "ring-2 ring-success/60 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-success-dark uppercase tracking-wider">BUMDes Aktif</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-success-dark">{activeBumdes}</h3>
                </div>
                <div className="h-9 w-9 bg-success/20 rounded-xl flex items-center justify-center text-success-dark shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl({ status: "SUSPENDED", page: 1 })}>
          <Card className={`border-amber-500/40 bg-amber-500/5 hover:border-amber-500 transition-all rounded-2xl ${statusFilter === "SUSPENDED" ? "ring-2 ring-amber-500/60 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Ditangguhkan</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-amber-700">{suspendedBumdes}</h3>
                </div>
                <div className="h-9 w-9 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-700 shrink-0">
                  <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl({ status: "REJECTED", page: 1 })} className="col-span-2 sm:col-span-1 xl:col-span-1">
          <Card className={`border-danger/40 bg-danger/5 hover:border-danger transition-all rounded-2xl ${statusFilter === "REJECTED" ? "ring-2 ring-danger/60 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-danger uppercase tracking-wider">Ditolak</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-danger">{rejectedBumdes}</h3>
                </div>
                <div className="h-9 w-9 bg-danger/20 rounded-xl flex items-center justify-center text-danger shrink-0">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ENTERPRISE TOOLBAR: WILAYAH, SEKTOR & SEARCH */}
      <Card className="rounded-2xl border-border shadow-sm bg-surface">
        <form method="GET" action="/admin/bumdes" className="p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari BUMDes, desa, pengelola..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted"
              />
            </div>

            {/* 2. Filter Provinsi */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <AutoSubmitSelect
                name="province"
                defaultValue={provinceFilter}
                className="w-full pl-10 pr-8 py-2.5 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-text-main font-medium"
              >
                <option value="ALL">Semua Provinsi ({registeredProvinces.length})</option>
                {registeredProvinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </AutoSubmitSelect>
            </div>

            {/* 3. Filter Jenis Usaha */}
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <AutoSubmitSelect
                name="businessType"
                defaultValue={businessTypeFilter}
                className="w-full pl-10 pr-8 py-2.5 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-text-main font-medium"
              >
                <option value="ALL">Semua Jenis Usaha</option>
                {registeredBusinessTypes.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </AutoSubmitSelect>
            </div>

            {/* 4. Filter Status Verifikasi */}
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <AutoSubmitSelect
                name="status"
                defaultValue={statusFilter}
                className="w-full pl-10 pr-8 py-2.5 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-text-main font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING_VERIFICATION">Menunggu Verifikasi ({pendingBumdes})</option>
                <option value="VERIFIED">BUMDes Aktif ({activeBumdes})</option>
                <option value="SUSPENDED">Ditangguhkan ({suspendedBumdes})</option>
                <option value="REJECTED">Ditolak ({rejectedBumdes})</option>
              </AutoSubmitSelect>
            </div>
          </div>

          {/* Baris Kedua: Pengurutan Skalabilitas & Reset Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-text-muted whitespace-nowrap flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" /> Urutkan:
              </span>
              <AutoSubmitSelect
                name="sortBy"
                defaultValue={sortBy}
                className="px-3 py-1.5 bg-surface-bg border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer text-text-main"
              >
                <option value="priority">Prioritas Verifikasi (Pending Teratas)</option>
                <option value="newest">Pendaftaran Terbaru</option>
                <option value="oldest">Pendaftaran Terlama</option>
                <option value="name_asc">Nama BUMDes (A - Z)</option>
                <option value="name_desc">Nama BUMDes (Z - A)</option>
                <option value="province_asc">Provinsi & Wilayah (A - Z)</option>
              </AutoSubmitSelect>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-text-muted">
                Ditemukan: <strong className="text-text-main font-bold">{totalFiltered}</strong> BUMDes
              </span>
              {isFiltered && (
                <Link href="/admin/bumdes">
                  <Button variant="ghost" size="sm" type="button" className="text-xs h-8 px-2.5 text-danger hover:bg-danger/10 rounded-lg">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Filter
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </form>
      </Card>

      {/* BUMDES TABLE (DESKTOP) */}
      <div className="hidden md:block bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-text-main">
            <thead className="text-[11px] text-text-muted uppercase font-bold tracking-wider bg-surface-bg border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Nama BUMDes & Usaha</th>
                <th className="px-5 py-3.5">Wilayah / Lokasi Desa</th>
                <th className="px-5 py-3.5">Pengelola / Direktur</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Tgl Daftar</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((profile: any) => {
                const user = profile.userData;
                const pengelolaName = profile.directorName || user?.name || "-";
                const pengelolaPhone = profile.contactNumber || user?.phoneNumber || "-";
                const waUrl = formatWhatsAppUrl(pengelolaPhone !== "-" ? pengelolaPhone : undefined);

                return (
                  <tr key={profile._id.toString()} className="hover:bg-surface-bg/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-text-main">{profile.name}</p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{profile.businessType || "Usaha Desa"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-text-main">
                        Desa {profile.village}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Kec. {profile.district}, {profile.regency}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary/5 text-primary rounded text-[10px] font-bold border border-primary/20">
                        {profile.province}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-text-main">{pengelolaName}</p>
                      {pengelolaPhone !== "-" && waUrl ? (
                        <a 
                          href={waUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1.5 mt-1"
                        >
                          <Phone className="h-3 w-3 shrink-0" /> {pengelolaPhone}
                        </a>
                      ) : (
                        <p className="text-xs text-text-muted mt-0.5">{pengelolaPhone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge variant={getBumdesBadgeVariant(profile.verificationStatus)} className="font-medium">
                        {getBumdesStatusLabel(profile.verificationStatus)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-text-muted">
                      {formatDate(profile.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <BumdesActionButtons
                        bumdesId={profile._id.toString()}
                        bumdesName={profile.name}
                        status={profile.verificationStatus}
                        suspensionReason={profile.suspensionReason}
                      />
                    </td>
                  </tr>
                );
              })}
              
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState 
                      title="Tidak Ada Data BUMDes" 
                      description={
                        isFiltered
                          ? "Tidak ada BUMDes yang cocok dengan filter atau kata kunci pencarian yang dipilih."
                          : "Belum ada BUMDes yang terdaftar di platform."
                      }
                      icon="folder" 
                      className="border-0 rounded-none bg-transparent py-14"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BUMDES CARDS (MOBILE) */}
      <div className="block md:hidden space-y-3">
        {profiles.map((profile: any) => {
          const user = profile.userData;
          const pengelolaName = profile.directorName || user?.name || "-";
          const pengelolaPhone = profile.contactNumber || user?.phoneNumber || "-";
          const waUrl = formatWhatsAppUrl(pengelolaPhone !== "-" ? pengelolaPhone : undefined);

          return (
            <div key={profile._id.toString()} className="bg-surface rounded-2xl p-4 border border-border shadow-sm space-y-3">
              <div className="flex justify-between items-start gap-2 border-b border-border/60 pb-2.5">
                <div>
                  <h3 className="font-bold text-base text-text-main">{profile.name}</h3>
                  <span className="text-[11px] text-text-muted block mt-0.5">
                    Desa {profile.village}, Kec. {profile.district}
                  </span>
                </div>
                <Badge variant={getBumdesBadgeVariant(profile.verificationStatus)} className="rounded-lg px-2 py-0.5 text-[9px] shrink-0">
                  {getBumdesStatusLabel(profile.verificationStatus)}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{profile.regency}, <strong>{profile.province}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="line-clamp-1">{profile.businessType || "Usaha Desa"}</span>
                </div>
              </div>

              <div className="bg-surface-bg p-3 rounded-xl border border-border/60 flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Direktur</p>
                  <p className="font-bold text-text-main">{pengelolaName}</p>
                </div>
                {pengelolaPhone !== "-" && waUrl && (
                  <a 
                    href={waUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Phone className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-border/60 flex justify-end">
                <BumdesActionButtons
                  bumdesId={profile._id.toString()}
                  bumdesName={profile.name}
                  status={profile.verificationStatus}
                  suspensionReason={profile.suspensionReason}
                />
              </div>
            </div>
          );
        })}
        {profiles.length === 0 && (
          <EmptyState 
            title="Tidak Ada Data BUMDes" 
            description="Tidak ada BUMDes yang cocok dengan filter yang dipilih."
            icon="folder" 
            className="py-12 bg-surface rounded-2xl border border-border"
          />
        )}
      </div>

      {/* PAGINATION BAR */}
      {totalPages > 1 && (
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-text-muted">
            Menampilkan <strong className="text-text-main">{skip + 1}</strong> – <strong className="text-text-main">{Math.min(skip + limit, totalFiltered)}</strong> dari <strong className="text-text-main">{totalFiltered}</strong> BUMDes
          </p>

          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link href={createFilterUrl({ page: page - 1 })}>
                <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl text-xs font-semibold">
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Sebelumnya
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="h-8 px-3 rounded-xl text-xs opacity-50 cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Sebelumnya
              </Button>
            )}

            <div className="flex items-center px-2 text-xs font-bold text-text-main">
              Halaman {page} dari {totalPages}
            </div>

            {page < totalPages ? (
              <Link href={createFilterUrl({ page: page + 1 })}>
                <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl text-xs font-semibold">
                  Selanjutnya <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="h-8 px-3 rounded-xl text-xs opacity-50 cursor-not-allowed">
                Selanjutnya <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
