"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { UserSimple } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Plus, SquarePen } from "lucide-react";
import UserForm from "../form/UserForm";

export function UserDialog({
  user,
  mode,
}: {
  user?: UserSimple;
  mode: "edit-admin" | "edit-user" | "create";
}) {
  const [open, setOpen] = useState(false);

  return (
    <StatelessUserDialog
      mode={mode}
      user={user}
      open={open}
      setOpen={setOpen}
    />
  );
}

export function StatelessUserDialog({
  user,
  mode,
  open,
  setOpen,
}: {
  user?: UserSimple;
  mode: "edit-admin" | "edit-user" | "create";
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();

  const onSuccess = () => {
    setOpen(false);

    if (mode === "edit-admin") {
      router.refresh();
    }
  };

  const onCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === "create" && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus />
            Create User
          </Button>
        </DialogTrigger>
      )}
      {mode === "edit-user" && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <SquarePen size={18} />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogTitle>{mode === "create" ? "Create" : "Edit"} User</DialogTitle>
        <UserForm
          mode={mode}
          user={user}
          onCancel={onCancel}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
