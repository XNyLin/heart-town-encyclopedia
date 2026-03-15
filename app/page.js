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
        i += 1;
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

export default async function Home() {
  const res = await fetch(SHEET_CSV_URL, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("無法讀取 Google Sheet 資料");
  }

  const csvText = await res.text();
  const rows = parseCSV(csvText).filter((row) => row["名稱"]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "40px 20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "44px",
              lineHeight: 1.1,
              fontWeight: 800,
              margin: "0 0 12px 0",
              color: "#111",
            }}
          >
            心動小鎮圖鑑
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#666",
            }}
          >
            目前共 {rows.length} 筆圖鑑資料
          </p>
        </header>

        <section
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            padding: "14px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "980px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                {["類型", "Level", "名稱", "天氣", "時段", "地點", "Note"].map(
                  (title) => (
                    <th key={title} style={thStyle}>
                      {title}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row["名稱"]}-${index}`}>
                  <td style={tdStyle}>{row["類型"]}</td>
                  <td style={tdStyle}>{row["Level"]}</td>
                  <td style={tdStyleStrong}>{row["名稱"]}</td>
                  <td style={tdStyle}>{row["天氣"]}</td>
                  <td style={tdStyle}>{row["時段"]}</td>
                  <td style={tdStyle}>{row["地點"]}</td>
                  <td style={tdStyle}>{row["Note"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "16px 14px",
  borderBottom: "1px solid #e8e8e8",
  fontSize: "14px",
  fontWeight: 700,
  color: "#444",
  whiteSpace: "nowrap",
  background: "#fff",
};

const tdStyle = {
  padding: "16px 14px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "15px",
  color: "#222",
  verticalAlign: "top",
};

const tdStyleStrong = {
  ...tdStyle,
  fontWeight: 700,
};