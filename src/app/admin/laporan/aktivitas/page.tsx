import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import AdminLog from "@/models/AdminLog";
import User from "@/models/User";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Activity, ArrowLeft } from "lucide-react";

export default async function AdminActivityLogsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const period = resolvedParams.period || "1-minggu";

  await dbConnect();

  let dateFilter = {};
  
  if (period === "1-minggu") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    dateFilter = { createdAt: { $gte: d } };
  } else if (period === "1-bulan") {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    dateFilter = { createdAt: { $gte: d } };
  } else if (period === "1-semester") {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    dateFilter = { createdAt: { $gte: d } };
  } else if (period === "1-windu") {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 8);
    dateFilter = { createdAt: { $gte: d } };
  }

  const logs = await AdminLog.find(dateFilter)
    .sort({ createdAt: -1 })
    .populate({ path: "adminId", model: User, select: "name email" })
    .lean();

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Laporan Aktivitas Admin
          </h1>
          <p className="text-sm text-text-muted mt-1">Rekam jejak seluruh aktivitas perubahan dan verifikasi oleh tim admin.</p>
        </div>
        <Link href="/admin">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/admin/laporan/aktivitas?period=1-minggu">
          <Button variant={period === "1-minggu" ? "default" : "outline"} size="sm">1 Minggu</Button>
        </Link>
        <Link href="/admin/laporan/aktivitas?period=1-bulan">
          <Button variant={period === "1-bulan" ? "default" : "outline"} size="sm">1 Bulan</Button>
        </Link>
        <Link href="/admin/laporan/aktivitas?period=1-semester">
          <Button variant={period === "1-semester" ? "default" : "outline"} size="sm">1 Semester</Button>
        </Link>
        <Link href="/admin/laporan/aktivitas?period=1-windu">
          <Button variant={period === "1-windu" ? "default" : "outline"} size="sm">1 Windu</Button>
        </Link>
        <Link href="/admin/laporan/aktivitas?period=semua">
          <Button variant={period === "semua" ? "default" : "outline"} size="sm">Semua</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-text-main">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium">Admin</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log: any) => (
                <tr key={log._id.toString()} className="hover:bg-surface-bg/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted">
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 font-medium text-text-main">
                    {log.adminId?.name || log.adminId?.email || "Admin"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      log.action === 'LOGIN' ? 'bg-info/10 text-info' :
                      log.action.includes('VERIFY') ? 'bg-success/10 text-success' :
                      log.action.includes('REJECT') || log.action.includes('DELETE') ? 'bg-danger/10 text-danger' :
                      'bg-surface-bg border border-border text-text-muted'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-main">{log.target || "-"}</td>
                  <td className="px-6 py-4 text-text-muted">{log.details || "-"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Tidak ada aktivitas pada periode ini.
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
