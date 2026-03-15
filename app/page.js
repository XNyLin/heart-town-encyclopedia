const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1dCQmBErMhSXriigbgKQma1dQ2q7qNAo2AUTWiFv_AsQ/export?format=csv&gid=1514414564";

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header.trim()] = (values[index] || "").trim();
    });

    return row;
  });
}

function renderStars(value) {
  const numeric = Number(value) || 0;
  return "★".repeat(numeric) + "☆".repeat(5 - numeric);
}

export default async function Home() {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("無法讀取 Google Sheet 資料");
  }

  const csvText = await res.text();
  const rows = parseCSV(csvText);

  return (
    <main
      style={{
        padding: "40px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#f7f7f7",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "40px", marginBottom: "12px" }}>心動小鎮圖鑑</h1>
        <p style={{ color: "#666", marginBottom: "32px" }}>
          目前共 {rows.length} 筆圖鑑資料
        </p>

        <div
          style={{
            overflowX: "auto",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            padding: "12px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr>
                {["類型", "Level", "名稱", "星級", "天氣", "時段", "地點", "Note"].map(
                  (title) => (
                    <th
                      key={title}
                      style={{
                        textAlign: "left",
                        padding: "14px 12px",
                        borderBottom: "1px solid #e5e5e5",
                        fontSize: "14px",
                        color: "#444",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row["名稱"]}-${index}`}>
                  <td style={cellStyle}>{row["類型"]}</td>
                  <td style={cellStyle}>{row["Level"]}</td>
                  <td style={cellStyle}>{row["名稱"]}</td>
                  <td style={cellStyle}>{renderStars(row["星級"])}</td>
                  <td style={cellStyle}>{row["天氣"]}</td>
                  <td style={cellStyle}>{row["時段"]}</td>
                  <td style={cellStyle}>{row["地點"]}</td>
                  <td style={cellStyle}>{row["Note"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

const cellStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "15px",
  verticalAlign: "top",
};