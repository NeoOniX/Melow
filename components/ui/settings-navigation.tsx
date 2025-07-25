import { auth } from "@/lib/auth";
import { Palette, Settings, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function SettingsNavigation({
  current,
}: {
  current: "general" | "theme" | "users";
}) {
  const session = await auth();

  return (
    <div className="flex flex-row h-14 w-full border-b">
      {current === "general" ? (
        <div className="flex-1 text-stone-800 dark:text-white bg-stone-200 dark:bg-stone-800 transition duration-200 flex items-center justify-center">
          <Settings className="mr-2 hidden md:flex stroke-stone-800 dark:stroke-white" />
          General
        </div>
      ) : (
        <Link
          href={"/settings"}
          className="flex-1 text-stone-800 dark:text-white bg-stone-50 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-700 transition duration-200 flex items-center justify-center"
        >
          <Settings className="mr-2 hidden md:flex stroke-stone-800 dark:stroke-white" />
          General
        </Link>
      )}

      {current === "theme" ? (
        <div className="flex-1 text-stone-800 dark:text-white bg-stone-200 dark:bg-stone-800 transition duration-200 flex items-center justify-center">
          <Palette className="mr-2 hidden md:flex stroke-stone-800 dark:stroke-white" />
          Theme
        </div>
      ) : (
        <Link
          href={"/settings/theme"}
          className="flex-1 text-stone-800 dark:text-white bg-stone-50 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-700 transition duration-200 flex items-center justify-center"
        >
          <Palette className="mr-2 hidden md:flex stroke-stone-800 dark:stroke-white" />
          Theme
        </Link>
      )}

      {session?.user?.role === "ADMIN" && (
        <>
          {current === "users" ? (
            <div className="flex-1 text-stone-800 dark:text-white bg-stone-200 dark:bg-stone-800 transition duration-200 flex items-center justify-center">
              <Users className="mr-2 hidden md:flex stroke-stone-800 dark:stroke-white" />
              Users
            </div>
          ) : (
            <Link
              href={"/settings/users"}
              className="flex-1 text-stone-800 dark:text-white bg-stone-50 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-700 transition duration-200 flex items-center justify-center"
            >
              <Users className="mr-2 hidden md:flex stroke-stone-800 dark:stroke-white" />
              Users
            </Link>
          )}
        </>
      )}
    </div>
  );
}
