import { getSession } from "@/lib/auth";
import NavbarClient from "./NavbarClient";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import Order from "@/models/Order";

export default async function Navbar() {
  const session = await getSession();
  let unreadCount = 0;

  if (session && session.role === "BUMDES_ADMIN") {
    try {
      await dbConnect();
      const profile = await BumdesProfile.findOne({ userId: session.userId });
      if (profile) {
        const store = await Store.findOne({ bumdesId: profile._id });
        if (store) {
          unreadCount = await Order.countDocuments({
            sellerStoreId: store._id,
            status: "PENDING"
          });
        }
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  }

  return <NavbarClient session={session} unreadCount={unreadCount} />;
}
