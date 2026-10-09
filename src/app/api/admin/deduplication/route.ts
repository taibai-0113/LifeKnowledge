import { NextResponse } from "next/server";
import { deduplicationService } from "@/services/deduplication.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await deduplicationService.checkCandidate(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to check deduplication:", error);
    return NextResponse.json(
      { error: "Failed to check deduplication" },
      { status: 500 }
    );
  }
}
