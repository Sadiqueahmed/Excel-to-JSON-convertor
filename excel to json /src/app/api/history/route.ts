import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const history = await db.conversionHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        originalFileName: true,
        fileSize: true,
        sheetsCount: true,
        jsonData: true,
        createdAt: true,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
