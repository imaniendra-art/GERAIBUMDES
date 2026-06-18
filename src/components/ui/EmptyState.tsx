import React from "react";
import { FolderSearch, AlertCircle, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: "folder" | "alert" | "package";
  className?: string;
}

export function EmptyState({ title, description, action, icon = "folder", className }: EmptyStateProps) {
  const icons = {
    folder: <FolderSearch className="h-12 w-12 text-border mx-auto mb-4" />,
    alert: <AlertCircle className="h-12 w-12 text-border mx-auto mb-4" />,
    package: <PackageX className="h-12 w-12 text-border mx-auto mb-4" />,
  };

  return (
    <div className={cn("text-center py-16 bg-surface rounded-xl border border-border border-dashed", className)}>
      {icons[icon]}
      <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>
      <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
