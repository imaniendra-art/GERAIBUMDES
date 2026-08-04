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
    folder: <FolderSearch className="h-16 w-16 text-text-muted/30 mx-auto mb-5" />,
    alert: <AlertCircle className="h-16 w-16 text-text-muted/30 mx-auto mb-5" />,
    package: <PackageX className="h-16 w-16 text-text-muted/30 mx-auto mb-5" />,
  };

  return (
    <div className={cn("text-center py-16 px-6 bg-surface rounded-2xl border-2 border-border border-dashed shadow-sm", className)}>
      {icons[icon]}
      <h3 className="text-xl font-bold text-text-main mb-3">{title}</h3>
      <p className="text-base text-text-muted mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
      {action && <div className="inline-block">{action}</div>}
    </div>
  );
}
