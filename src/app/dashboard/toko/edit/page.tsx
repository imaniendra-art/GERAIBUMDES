import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import StoreEditForm from "./StoreEditForm";

export default async function EditTokoServerPage() {
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

  const initialData = {
    name: store.name || "",
    description: store.description || "",
    logoUrl: store.logoUrl || "",
    bannerUrl: store.bannerUrl || "",
    phoneNumber: store.phoneNumber || "",
    whatsappNumber: store.whatsappNumber || "",
    address: store.address || "",
    village: store.village || profile.village || "",
    district: store.district || profile.district || "",
    regency: store.regency || profile.regency || "",
    province: store.province || profile.province || "",
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
