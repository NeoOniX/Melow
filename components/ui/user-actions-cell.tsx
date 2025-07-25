import { UserSimple } from "@/lib/actions/user";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { MoreHorizontal, SquarePen, Trash } from "lucide-react";
import { StatelessUserDialog } from "../dialog/UserDialog";

export default function UserActionsCell({ user }: { user: UserSimple }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <SquarePen />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              // Handle user deletion logic here
              console.log(`Delete user with ID: ${user.id}`);
            }}
          >
            <Trash />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <StatelessUserDialog
        mode="edit-admin"
        user={user}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}
