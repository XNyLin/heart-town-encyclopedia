import { NextResponse } from "next/server";

import { appendReportRow, deleteReportImage, uploadReportImage } from "@/lib/google-report";
import { validateReportFields, validateReportImage } from "@/lib/report-validation";

export const runtime = "nodejs";

export async function POST(request) {
  let uploadedImage = null;

  try {
    const formData = await request.formData();

    // Hidden field: real visitors never fill this. Silently accept bot submissions.
    if (String(formData.get("website") || "").trim()) {
      return NextResponse.json({ ok: true });
    }

    const validation = validateReportFields({
      type: formData.get("type"),
      category: formData.get("category"),
      level: formData.get("level"),
      name: formData.get("name"),
      description: formData.get("description"),
    });

    if (validation.error) {
      return NextResponse.json({ ok: false, message: validation.error }, { status: 400 });
    }

    const screenshot = formData.get("screenshot");
    const hasScreenshot = screenshot instanceof File && screenshot.size > 0;
    const imageError = hasScreenshot ? validateReportImage(screenshot) : null;
    if (imageError) {
      return NextResponse.json({ ok: false, message: imageError }, { status: 400 });
    }

    if (hasScreenshot) uploadedImage = await uploadReportImage(screenshot, validation.report);
    await appendReportRow(validation.report, uploadedImage?.url || "");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (uploadedImage?.id) {
      try {
        await deleteReportImage(uploadedImage.id);
      } catch (cleanupError) {
        console.error("清理未完成的回報截圖失敗:", cleanupError);
      }
    }
    console.error("送出回報失敗:", error);
    return NextResponse.json(
      { ok: false, message: "目前無法送出回報，請稍後再試。" },
      { status: 500 }
    );
  }
}
