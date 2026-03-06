import { AdminGuard } from "@/components/ui/AdminGuard";

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
