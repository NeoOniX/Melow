import UserLoginForm from "@/components/form/UserLoginForm";
import React from "react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string }>;
}) {
  const { error, code } = await searchParams;

  return <UserLoginForm error={error} code={code} />;
}
