import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  const segments = [...pathSegments];
  const lastSegment = segments.pop() ?? "";
  const cleanLast = lastSegment.split("?")[0];

  const filePath = path.join(process.cwd(), "uploads", ...segments, cleanLast);

  console.log(filePath);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileExt = path.extname(filePath).toLowerCase();
  const contentType =
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    }[fileExt] || "application/octet-stream";

  return new NextResponse(fileBuffer, {
    headers: { "Content-Type": contentType },
  });
}
