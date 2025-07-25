import { DataTable } from "@/components/ui/data-table";
import SettingsNavigation from "@/components/ui/settings-navigation";
import { getAllUsers } from "@/lib/actions/user";
import React from "react";
import { columns } from "./columns";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserDialog } from "@/components/dialog/UserDialog";

export async function generateMetadata() {
  return {
    title: "User Management",
    description: "Manage users in your application",
  };
}

export default async function UsersSettingsPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return redirect("/settings");
  }

  const res = await getAllUsers();
  const users = res.users || [];

  return (
    <div className="flex flex-col items-center">
      <SettingsNavigation current="users" />
      <div className="p-4 pt-8 overflow-y-auto w-full">
        <DataTable
          columns={columns}
          data={users}
          afterButtons={<UserDialog mode="create" />}
        />
      </div>
    </div>
  );
}
