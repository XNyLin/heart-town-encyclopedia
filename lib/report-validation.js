export const REPORT_TYPES = ["補充", "錯誤"];
export const REPORT_CATEGORIES = ["魚", "蟲", "鳥", "貝", "貓", "狗"];

export const MAX_REPORT_IMAGE_BYTES = 4 * 1024 * 1024;
export const REPORT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function cleanText(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function validateReportFields(input) {
  const report = {
    type: cleanText(input.type, 10),
    category: cleanText(input.category, 10),
    level: cleanText(input.level, 10),
    name: cleanText(input.name, 80),
    description: cleanText(input.description, 1000),
  };

  if (!REPORT_TYPES.includes(report.type)) return { error: "請選擇回報類型。" };
  if (!REPORT_CATEGORIES.includes(report.category)) return { error: "請選擇種類。" };
  if (!/^Lv\.(?:[1-9]|1[0-2])$/.test(report.level)) return { error: "請選擇有效等級。" };
  if (!report.name) return { error: "請填寫名稱。" };
  if (report.type === "錯誤" && !report.description) {
    return { error: "錯誤回報需要填寫說明。" };
  }

  return { report };
}

export function validateReportImage(file) {
  if (!file || file.size === 0) return null;
  if (!REPORT_IMAGE_TYPES.includes(file.type)) return "截圖僅支援 JPG、PNG 或 WebP。";
  if (file.size > MAX_REPORT_IMAGE_BYTES) return "截圖大小不可超過 4 MB。";
  return null;
}
