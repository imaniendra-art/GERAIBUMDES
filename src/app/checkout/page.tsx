import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/keranjang");
  }

  const { storeId } = resolvedSearchParams;

  if (!storeId) {
    redirect("/keranjang");
  }

  await dbConnect();
  
  // We fetch user details to pre-fill the form
  const user = await User.findById(session.userId);
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-text-main mb-8">Buat Pesanan</h1>
        <CheckoutForm 
          storeId={storeId} 
          user={{
            id: user._id.toString(),
            name: user.name,
            phone: user.phoneNumber || "",
            role: user.role
          }} 
        />
      </div>
    </div>
  );
}
