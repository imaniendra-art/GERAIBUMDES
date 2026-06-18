import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { getBumdesBadgeVariant, getBumdesStatusLabel } from "@/lib/utils/status";

export default async function AdminBumdesList() {
  await dbConnect();
  
  const profiles = await BumdesProfile.find().sort({ createdAt: -1 });

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar BUMDes</h1>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-left text-text-main">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg">
              <tr>
                <th className="px-6 py-3">Nama BUMDes</th>
                <th className="px-6 py-3">Lokasi</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Tanggal Daftar</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile._id.toString()} className="border-b border-border hover:bg-surface-bg/50">
                  <td className="px-6 py-4 font-medium">{profile.name}</td>
                  <td className="px-6 py-4">{profile.district}, {profile.regency}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getBumdesBadgeVariant(profile.verificationStatus)}>
                      {getBumdesStatusLabel(profile.verificationStatus)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(profile.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/bumdes/${profile._id}`}>
                      <Button variant="outline" size="sm">Detail</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState 
                      title="Tidak Ada BUMDes" 
                      description="Belum ada pendaftaran BUMDes." 
                      icon="store" 
                      className="border-0 rounded-none bg-transparent py-12"
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
