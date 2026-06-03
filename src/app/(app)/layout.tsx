import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar, MobileNav } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={session.user.name} email={session.user.email} />
        <main className="flex-1 px-4 pb-24 pt-5 md:px-7 md:pb-8">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
