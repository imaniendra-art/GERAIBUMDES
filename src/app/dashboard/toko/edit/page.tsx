import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import StoreEditForm from "./StoreEditForm";

export default async function EditTokoServerPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role === "SUPER_ADMIN" || session.role === "PLATFORM_ADMIN") {
    redirect("/admin");
  }

  if (session.role !== "BUMDES_ADMIN") {
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

  const initialData = {
    name: store.name || "",
    description: store.description || "",
    logoUrl: store.logoUrl || "",
    bannerUrl: store.bannerUrl || "",
    phoneNumber: store.phoneNumber || "",
    whatsappNumber: store.whatsappNumber || "",
    address: store.address || "",
    googleMapsUrl: store.googleMapsUrl || "",
    directorName: store.directorName || "",
    villageHeadName: store.villageHeadName || "",
    nib: store.nib || "",
    village: store.village || profile.village || "",
    villageCode: store.villageCode || "",
    district: store.district || profile.district || "",
    districtCode: store.districtCode || "",
    regency: store.regency || profile.regency || "",
    regencyCode: store.regencyCode || "",
    province: store.province || profile.province || "",
    provinceCode: store.provinceCode || "",
    businessType: store.businessType || profile.businessType || "",
    operationalHours: store.operationalHours || "",
    paymentInstructions: store.paymentInstructions || "",
    bankAccount: {
      bankName: store.bankAccount?.bankName || "",
      bankAccountNumber: store.bankAccount?.bankAccountNumber || "",
      bankAccountHolderName: store.bankAccount?.bankAccountHolderName || "",
      paymentNote: store.bankAccount?.paymentNote || "",
    }
  };

  return <StoreEditForm initialData={initialData} />;
}
