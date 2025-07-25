"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";

export function UserImage({
  className,
  width,
  height,
  fill,
}: {
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const { data: session } = useSession();

  if (!session?.user) return <></>;

  return (
    <Image
      src={`/uploads/users/${session?.user.id}.jpg?updated=${new Date(
        session.user.updatedAt
      ).getTime()}`}
      alt={session?.user.name || "User"}
      className={className}
      width={width}
      height={height}
      fill={fill}
    />
  );
}

export function UserName({ className }: { className?: string }) {
  const { data: session } = useSession();

  if (!session?.user) return <></>;
  return <div className={className}>{session.user.name}</div>;
}

export function UserRole({ className }: { className?: string }) {
  const { data: session } = useSession();

  if (!session?.user) return <></>;
  return <div className={className}>{session.user.role}</div>;
}
