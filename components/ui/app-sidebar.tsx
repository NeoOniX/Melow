import { Disc3, Plus, Home, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import SidebarUser from "./sidebar-user";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPlaylists } from "@/lib/actions/playlist";
import PlaylistCover from "./playlist-cover";
import Image from "next/image";

export async function AppSidebar() {
  const session = await auth();

  const playlists = await getPlaylists(session?.user.id || "");

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center mt-2">
          <Image
            src="/imgs/icons/192x192.png"
            alt="Melow Logo"
            width={32}
            height={32}
            className="rounded-full mr-2"
            draggable={false}
          />
          <h1>Melow</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/"}>
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/search"}>
                    <Search />
                    <span>Search</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/library"}>
                    <Disc3 />
                    <span>Library</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="w-full flex items-center justify-center">
          <SidebarSeparator className="w-auto flex-1 mx-2" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/playlists/create"}>
                    <Plus />
                    <span>New playlist</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {playlists.map((playlist) => (
                <SidebarMenuItem key={playlist.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/playlists/${playlist.id}`} className="h-12">
                      <div className="flex flex-row w-full gap-1 items-center">
                        <div className="relative h-8 w-8 shrink-0">
                          <PlaylistCover
                            playlist={playlist}
                            width={32}
                            height={32}
                          />
                        </div>
                        <span className="flex-1">{playlist.name}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mb-18">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/settings"}>
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
