import { randomUUID } from "node:crypto";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

const TOKEN_URL = "https://sts.googleapis.com/v1/token";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
const SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const GOOGLE_SCOPE = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");

let authClient = null;

function getGoogleConfig() {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const clientEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const folderId = process.env.GOOGLE_DRIVE_REPORT_FOLDER_ID;

  if (!projectNumber || !clientEmail || !poolId || !providerId || !spreadsheetId || !folderId) {
    throw new Error("REPORT_GOOGLE_CONFIG_MISSING");
  }

  const providerPath = `projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;
  return {
    clientEmail,
    spreadsheetId,
    folderId,
    audience: `//iam.googleapis.com/${providerPath}`,
    tokenAudience: `https://iam.googleapis.com/${providerPath}`,
  };
}

async function getAccessToken() {
  const { clientEmail, audience, tokenAudience } = getGoogleConfig();
  if (!authClient) {
    authClient = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience,
      scopes: GOOGLE_SCOPE.split(" "),
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: TOKEN_URL,
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${clientEmail}:generateAccessToken`,
      subject_token_supplier: {
        getSubjectToken: () => getVercelOidcToken({ audience: tokenAudience }),
      },
    });
  }

  if (!authClient) throw new Error("REPORT_GOOGLE_AUTH_FAILED");
  let result;
  try {
    result = await authClient.getAccessToken();
  } catch (error) {
    console.error("Google OIDC 交換失敗:", {
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
