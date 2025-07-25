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
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { signIn } from "next-auth/react";

const userLoginFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().min(1, "Password is required"),
});

export default function UserLoginForm({
  error,
  code,
}: {
  error?: string;
  code?: string;
}) {
  const form = useForm<z.infer<typeof userLoginFormSchema>>({
    resolver: zodResolver(userLoginFormSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error) {
      form.setError("root", {
        type: "manual",
        message: code,
      });
    }
  }, [error, code, form]);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const onSubmit = async (data: z.infer<typeof userLoginFormSchema>) => {
    signIn("credentials", {
      username: data.name,
      password: data.password,
      redirect: true,
      redirectTo: "/",
    });
  };

  return (
    <Card className="w-full max-w-md overflow-y-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Username..." {...field} required />
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
                        required
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
            {form.formState.errors.root && (
              <div className="text-destructive">
                Error : {form.formState.errors.root.message}
              </div>
            )}
            <div className="flex flex-row gap-2 items-center">
              <Button type="submit" className="flex-1">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
