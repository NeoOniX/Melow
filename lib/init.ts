"use server";

import { hash } from "bcrypt";
import prisma from "./prisma";

export async function initAdmin() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return;
    }

    const adminName = process.env.ADMIN_NAME || "admin";
    const adminPass = process.env.ADMIN_PASS || "admin";

    const hashedPassword = await hash(adminPass, 10);

    await prisma.user.create({
      data: {
        name: adminName,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("✅ Admin account created");
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
  }
}
