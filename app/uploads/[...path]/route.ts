import { NextResponse } from "next/server";
import path from "path";
import { readFile, stat } from "fs/promises";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(path.join(...pathSegments)).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(process.cwd(), "public", "uploads", safePath);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    // Mime types mapping
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "image/webp";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    if (ext === ".gif") contentType = "image/gif";
    if (ext === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return new NextResponse("File Not Found", { status: 404 });
  }
}
