import { randomUUID } from "node:crypto";

const TOKEN_URL = "https://sts.googleapis.com/v1/token";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
const SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const GOOGLE_SCOPE = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");

let tokenCache = null;

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
    audience: `https://iam.googleapis.com/${providerPath}`,
  };
}

async function getAccessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value;

  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  const { clientEmail, audience } = getGoogleConfig();
  if (!oidcToken) throw new Error("REPORT_GOOGLE_AUTH_FAILED");

  const exchangeResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      audience,
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
      scope: GOOGLE_SCOPE,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      subject_token: oidcToken,
    }),
    cache: "no-store",
  });
  if (!exchangeResponse.ok) throw new Error("REPORT_GOOGLE_AUTH_FAILED");
  const exchange = await exchangeResponse.json();

  const impersonationResponse = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${clientEmail}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${exchange.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: GOOGLE_SCOPE.split(" "), lifetime: "3600s" }),
      cache: "no-store",
    }
  );
  if (!impersonationResponse.ok) throw new Error("REPORT_GOOGLE_AUTH_FAILED");
  const result = await impersonationResponse.json();
  if (!result.accessToken) throw new Error("REPORT_GOOGLE_AUTH_FAILED");

  tokenCache = {
    value: result.accessToken,
    expiresAt: result.expireTime ? Date.parse(result.expireTime) : Date.now() + 3_600_000,
  };
  return tokenCache.value;
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

  if (!response.ok) throw new Error("REPORT_IMAGE_UPLOAD_FAILED");
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

  if (!response.ok) throw new Error("REPORT_SHEET_APPEND_FAILED");
}
