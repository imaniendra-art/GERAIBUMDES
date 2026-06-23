import dbConnect from "./db";
import AdminLog from "../models/AdminLog";

/**
 * Logs an administrative action to the database.
 * 
 * @param adminId The ID of the admin performing the action
 * @param action A short string describing the action type (e.g., "LOGIN", "VERIFY_BUMDES")
 * @param target The target of the action (optional)
 * @param details Additional details about the action (optional)
 */
export async function logAdminActivity(
  adminId: string,
  action: string,
  target?: string,
  details?: string
) {
  try {
    await dbConnect();
    await AdminLog.create({
      adminId,
      action,
      target,
      details,
    });
  } catch (error) {
    // We log the error but don't throw it, so it doesn't break the main flow
    console.error("Failed to log admin activity:", error);
  }
}
