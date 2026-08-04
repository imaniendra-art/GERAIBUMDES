import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Clock, Home, LogOut } from "lucide-react";

export const metadata = {
  title: "Menunggu Verifikasi | GeraiBUMDes",
};

export default function RevisiSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg justify-center items-center p-4">
      <Card className="max-w-lg w-full text-center shadow-lg border-t-4 border-t-warning">
        <CardContent className="p-8 sm:p-12">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-warning/10 text-warning-dark rounded-full flex items-center justify-center relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-warning opacity-20 animate-ping"></span>
              <Clock size={40} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-text-main">
            🟡 Menunggu Verifikasi Admin
          </h2>
          
          <p className="text-text-muted mb-8 leading-relaxed text-lg">
            Perubahan data berhasil dikirim. Admin GeraiBUMDes akan melakukan peninjauan ulang terhadap pendaftaran Anda. Estimasi proses maksimal <strong>1 x 24 jam kerja</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto min-w-[160px] h-12">
                <Home className="mr-2 h-5 w-5" />
                Kembali ke Beranda
              </Button>
            </Link>
            
            <form action="/api/auth/logout" method="POST" className="w-full sm:w-auto">
              <Button type="submit" variant="primary" className="w-full sm:w-auto min-w-[160px] h-12">
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
