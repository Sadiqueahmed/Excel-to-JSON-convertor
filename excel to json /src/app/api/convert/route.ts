import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    const data: Record<string, unknown[]> = {};
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      data[sheetName] = jsonData;
    }

    // Save to database
    const history = await db.conversionHistory.create({
      data: {
        originalFileName: file.name,
        fileSize: file.size,
        sheetsCount: workbook.SheetNames.length,
        jsonData: JSON.stringify(data),
      },
    });

    return NextResponse.json({
      success: true,
      data,
      historyId: history.id,
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert file" },
      { status: 500 }
    );
  }
}
