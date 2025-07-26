import React from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { ModeToggle } from "@/components/ui/theme-switch";
import { PlayerProvider } from "@/components/context/player-provider";
import PlayerBar from "@/components/ui/player-bar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  return (
    <PlayerProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="relative h-screen w-full">
          <div className="absolute top-2 left-2 z-30">
            <SidebarTrigger className="cursor-pointer" />
          </div>
          <div className="absolute top-2 right-2 z-30">
            <ModeToggle />
          </div>
          <div className="h-full pb-16">{children}</div>
        </main>
      </SidebarProvider>
      <PlayerBar />
    </PlayerProvider>
  );
}
