"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createUser, updateUser, UserSimple } from "@/lib/actions/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";

const userLoginFormSchema = z.object({
  name: z.string().optional(),
  password: z.string().optional(),
  role: z.string().optional(),
  image: z.instanceof(File).optional(),
});

export default function UserForm({
  user,
  mode,
  onCancel,
  onSuccess,
}: {
  user?: UserSimple;
  mode: "edit-admin" | "edit-user" | "create";
  onCancel?: () => void;
  onSuccess?: (user: User) => void;
}) {
  const form = useForm<z.infer<typeof userLoginFormSchema>>({
    resolver: zodResolver(userLoginFormSchema),
    defaultValues: {
      name: user?.name || "",
      role: user?.role || "USER",
      password: "",
    },
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const { data: session, update } = useSession();

  const onSubmit = async (data: z.infer<typeof userLoginFormSchema>) => {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.password) formData.append("password", data.password);
    if (data.role) formData.append("role", data.role);
    if (data.image) formData.append("image", data.image);

    try {
      if (mode === "create") {
        const res = await createUser(formData);

        if (res.success && res.user) {
          onSuccess?.(res.user);
        } else {
          console.error("Error creating user:", res.error);
        }
      } else if ((mode === "edit-admin" || mode === "edit-user") && user) {
        const res = await updateUser(user.id, formData);

        if (res.success && res.user) {
          // Current user update
          if (res.user.id === session?.user?.id) {
            await update({
              user: {
                id: res.user.id,
                name: res.user.name,
                role: res.user.role,
              },
            });
          }
          onSuccess?.(res.user);
        } else {
          console.error("Error updating user:", res.error);
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Username..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Password..."
                    {...field}
                    type={passwordVisible ? "text" : "password"}
                  />
                  {passwordVisible ? (
                    <Eye
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={() => setPasswordVisible(false)}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={() => setPasswordVisible(true)}
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {session?.user.role === "ADMIN" && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Role..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-2 items-center">
          <Button type="submit" className="flex-1">
            Submit
          </Button>
          <Button className="flex-1" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
