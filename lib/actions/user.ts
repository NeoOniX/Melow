"use server";

import { hash } from "bcrypt";
import prisma from "../prisma";
import sharp from "sharp";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { Prisma } from "@prisma/client";

export type UserSimple = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    role: true;
  };
}>;

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
      },
    });
    return { success: true, users };
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user };
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function createUser(formData: FormData) {
  try {
    const name = formData.get("name")?.toString().trim();
    const password = formData.get("password")?.toString().trim();
    const image = formData.get("image") as File | null;

    if (!name) {
      throw new Error("Name is required");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    if (!image) {
      throw new Error("File is required");
    }

    // Password hashing
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
      },
    });

    // Convertit l’image en buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer());

    // Redimensionne l'image en 512x512, carré, centrée, format JPEG
    const resizedImage = await sharp(imageBuffer)
      .resize(512, 512, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Crée le dossier s’il n'existe pas
    const uploadDir = path.join(process.cwd(), "public/uploads/users");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Sauvegarde du fichier
    const filePath = path.join(uploadDir, user.id + ".jpg");
    await writeFile(filePath, resizedImage);

    return { success: true, user };
  } catch (error: unknown) {
    console.error("Erreur lors de la création de l'artiste :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    const name = formData.get("name")?.toString().trim();
    const password = formData.get("password")?.toString().trim();
    const role = formData.get("role")?.toString().trim();
    const image = formData.get("image") as File | null;

    if (!name) {
      throw new Error("Name is required");
    }

    if (!role || (role !== "USER" && role !== "ADMIN")) {
      throw new Error("Role is required and must be USER or ADMIN");
    }

    const data: Prisma.UserUpdateInput = {
      name,
      role: role as "USER" | "ADMIN",
    };

    if (password) {
      data.password = await hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    // Handle image upload if provided
    if (image) {
      // Convertit l’image en buffer
      const imageBuffer = Buffer.from(await image.arrayBuffer());

      // Redimensionne l'image en 512x512, carré, centrée, format JPEG
      const resizedImage = await sharp(imageBuffer)
        .resize(512, 512, { fit: "cover", position: "center" })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Crée le dossier s’il n'existe pas
      const uploadDir = path.join(process.cwd(), "public/uploads/users");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Sauvegarde du fichier
      const filePath = path.join(uploadDir, user.id + ".jpg");
      await writeFile(filePath, resizedImage);
    }

    return { success: true, user };
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    // Delete user from database
    await prisma.user.delete({
      where: { id: userId },
    });

    // Delete user image file
    const filePath = path.join(
      process.cwd(),
      "public/uploads/users",
      userId + ".jpg"
    );
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function setRoleById(userId: string, role: "USER" | "ADMIN") {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return { success: true, user };
  } catch (error: unknown) {
    console.error(
      "Erreur lors de la mise à jour du rôle de l'utilisateur :",
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}
