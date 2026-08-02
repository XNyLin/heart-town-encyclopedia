import { randomUUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";

const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
const SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets";
let authClient = null;

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const folderId = process.env.GOOGLE_DRIVE_REPORT_FOLDER_ID;

  if (!clientId || !clientSecret || !refreshToken || !spreadsheetId || !folderId) {
    throw new Error("REPORT_GOOGLE_CONFIG_MISSING");
  }

  return { clientId, clientSecret, refreshToken, spreadsheetId, folderId };
}

async function getAccessToken() {
  const { clientId, clientSecret, refreshToken } = getGoogleConfig();
  if (!authClient) {
    authClient = new OAuth2Client(clientId, clientSecret);
    authClient.setCredentials({ refresh_token: refreshToken });
  }

  if (!authClient) throw new Error("REPORT_GOOGLE_AUTH_FAILED");
  let result;
  try {
    result = await authClient.getAccessToken();
  } catch (error) {
    console.error("Google OAuth 權杖更新失敗:", {
      message: error?.message,
      status: error?.response?.status,
      details: error?.response?.data,
    });
    throw error;
  }
  if (!result.token) throw new Error("REPORT_GOOGLE_AUTH_FAILED");
  return result.token;
}

function safeFileName(value) {
  return String(value || "report")
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function uploadReportImage(file, report) {
  const { folderId } = getGoogleConfig();
  const accessToken = await getAccessToken();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const filename = `${timestamp}_${safeFileName(report.category)}_${safeFileName(report.name)}_${randomUUID().slice(0, 8)}.${extension}`;
  const boundary = `heart-town-${randomUUID()}`;
  const metadata = JSON.stringify({ name: filename, parents: [folderId] });
  const bytes = Buffer.from(await file.arrayBuffer());
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`),
    bytes,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const response = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart&supportsAllDrives=true&fields=id,webViewLink`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Google Drive 上傳失敗:", response.status, await response.text());
    throw new Error("REPORT_IMAGE_UPLOAD_FAILED");
  }
  const result = await response.json();
  return {
    id: result.id,
    url: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
}

export async function deleteReportImage(fileId) {
  if (!fileId) return;
  const accessToken = await getAccessToken();
  await fetch(`${DRIVE_API_URL}/${encodeURIComponent(fileId)}?supportsAllDrives=true`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

export async function appendReportRow(report, screenshotUrl = "") {
  const { spreadsheetId } = getGoogleConfig();
  const accessToken = await getAccessToken();
  const range = encodeURIComponent("回報!A:H");
  const response = await fetch(
    `${SHEETS_API_URL}/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [[
          new Date().toISOString(),
          report.type,
          report.category,
          report.level,
          report.name,
          report.description,
          screenshotUrl,
          "未處理",
        ]],
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.error("Google Sheet 寫入失敗:", response.status, await response.text());
    throw new Error("REPORT_SHEET_APPEND_FAILED");
  }
}
