"use client";

import { useAuth } from "@/hooks/use-auth";
import { BackToHome } from "./BackToHome";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (process.env.NODE_ENV === "development") return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <BackToHome />
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <BackToHome />
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          Admin only
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
