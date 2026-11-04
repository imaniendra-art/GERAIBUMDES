import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { UserSettingsForm } from "./UserSettingsForm";

export default async function UserSettingsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  
  const user = await User.findById(session.userId).lean();
  if (!user) {
    redirect("/login");
  }

  const initialData = {
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };

  return (
    <UserSettingsForm initialData={initialData} />
  );
}
