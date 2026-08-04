import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import RevisionForm from "./RevisionForm";
import { formatDate } from "@/lib/utils/formatters";

export const metadata = {
  title: "Revisi Pendaftaran BUMDes | GeraiBUMDes",
};

export default async function RevisiPendaftaranPage() {
  const session = await getSession();
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  
  const profile = await BumdesProfile.findOne({ userId: session.userId });
  if (!profile) {
    redirect("/dashboard");
  }

  // Only allow access if status is REJECTED
  if (profile.verificationStatus !== "REJECTED") {
    redirect("/dashboard");
  }

  const store = await Store.findOne({ bumdesId: profile._id });
  
  const initialData = {
    name: profile.directorName || session.name || "",
    email: session.email || "",
    phoneNumber: profile.contactNumber || "",
    bumdesName: profile.name || store?.name || "",
    village: profile.village || store?.village || "",
    district: profile.district || store?.district || "",
    regency: profile.regency || store?.regency || "",
    province: profile.province || store?.province || "",
    villageCode: store?.villageCode || "",
    districtCode: store?.districtCode || "",
    regencyCode: store?.regencyCode || "",
    provinceCode: store?.provinceCode || "",
    businessType: profile.businessType || store?.businessType || "",
    description: profile.description || store?.description || "",
  };

  const rejectionDate = profile.updatedAt 
    ? formatDate(profile.updatedAt) 
    : formatDate(new Date());

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <RevisionForm 
        initialData={initialData} 
        rejectionReason={profile.rejectionReason || "Tidak ada alasan yang diberikan."}
        rejectionDate={rejectionDate}
      />
    </div>
  );
}
