"use client";

import { useEffect, useMemo, useState } from "react";

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

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

function getField(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }
  return "";
}

function matchesWeather(cellValue, selectedWeather) {
  if (selectedWeather === "全部") return true;

  const cell = normalizeText(cellValue);
  const target = normalizeText(selectedWeather);

  return cell.includes(target);
}

function matchesPeriod(cellValue, currentPeriod) {
  const cell = normalizeText(cellValue);
  const digitsOnly = cell.replace(/[^\d]/g, "");
  return digitsOnly.includes(String(currentPeriod));
}

function getPeriodName(period) {
  const map = {
    "1": "清晨",
    "2": "上午",
    "3": "下午",
    "4": "晚上",
  };
  return map[String(period)] || "";
}

function getCurrentTimeInfo(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();

  let period = "1";

  if (hour >= 6 && hour < 12) {
    period = "2";
  } else if (hour >= 12 && hour < 18) {
    period = "3";
  } else if (hour >= 18) {
    period = "4";
  }

  return {
    hour,
    minute,
    period,
    periodName: getPeriodName(period),
    timeText: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}`,
  };
}

function getUniqueSortedLevels(rows, type) {
  const values = rows
    .filter((row) => getField(row, ["類型"]) === type)
    .map((row) => Number(getField(row, ["Level", "等級"])))
    .filter((value) => !Number.isNaN(value));

  return [...new Set(values)].sort((a, b) => a - b);
}

function formatPeriodDisplay(cellValue) {
  const digitsOnly = normalizeText(cellValue).replace(/[^\d]/g, "");
  const uniquePeriods = [...new Set(digitsOnly.split("").filter(Boolean))];

  return uniquePeriods.map((period) => getPeriodName(period)).join("、");
}

export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部");
  const [weatherFilter, setWeatherFilter] = useState("全部");

  const [fishLevel, setFishLevel] = useState("全部");
  const [bugLevel, setBugLevel] = useState("全部");
  const [birdLevel, setBirdLevel] = useState("全部");

  const [now, setNow] = useState(new Date());
  const [autoPeriod, setAutoPeriod] = useState(true);
  const [manualPeriod, setManualPeriod] = useState("全部");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(SHEET_CSV_URL, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("無法讀取 Google Sheet 資料");
        }

        const csvText = await res.text();
        const parsedRows = parseCSV(csvText).filter(
          (row) => getField(row, ["名稱"]) !== ""
        );
        setRows(parsedRows);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const currentTimeInfo = useMemo(() => getCurrentTimeInfo(now), [now]);

  const effectivePeriod = autoPeriod ? currentTimeInfo.period : manualPeriod;
  const effectivePeriodName =
    effectivePeriod === "全部" ? "全部" : getPeriodName(effectivePeriod);

  const fishLevels = useMemo(() => getUniqueSortedLevels(rows, "魚"), [rows]);
  const bugLevels = useMemo(() => getUniqueSortedLevels(rows, "蟲"), [rows]);
  const birdLevels = useMemo(() => getUniqueSortedLevels(rows, "鳥"), [rows]);

  const fishCount = useMemo(
    () => rows.filter((row) => getField(row, ["類型"]) === "魚").length,
    [rows]
  );
  const bugCount = useMemo(
    () => rows.filter((row) => getField(row, ["類型"]) === "蟲").length,
    [rows]
  );
  const birdCount = useMemo(
    () => rows.filter((row) => getField(row, ["類型"]) === "鳥").length,
    [rows]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rowType = getField(row, ["類型"]);
      const rowName = getField(row, ["名稱"]);
      const rowLevel = Number(getField(row, ["Level", "等級"]));
      const rowWeather = getField(row, ["天氣"]);
      const rowPeriod = getField(row, ["時段", "時間"]);

      const matchKeyword = keyword.trim()
        ? rowName.toLowerCase().includes(keyword.trim().toLowerCase())
        : true;

      const matchType = typeFilter === "全部" ? true : rowType === typeFilter;

      const matchWeather = matchesWeather(rowWeather, weatherFilter);

      const matchPeriod =
        effectivePeriod === "全部"
          ? true
          : matchesPeriod(rowPeriod, effectivePeriod);

      let matchLevel = true;

      if (rowType === "魚" && fishLevel !== "全部") {
        matchLevel = rowLevel <= Number(fishLevel);
      } else if (rowType === "蟲" && bugLevel !== "全部") {
        matchLevel = rowLevel <= Number(bugLevel);
      } else if (rowType === "鳥" && birdLevel !== "全部") {
        matchLevel = rowLevel <= Number(birdLevel);
      }

      return (
        rowName !== "" &&
        matchKeyword &&
        matchType &&
        matchWeather &&
        matchPeriod &&
        matchLevel
      );
    });
  }, [
    rows,
    keyword,
    typeFilter,
    weatherFilter,
    fishLevel,
    bugLevel,
    birdLevel,
    effectivePeriod,
  ]);

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
          maxWidth: "1280px",
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
            心動小鎮｜生物圖鑑
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#666",
            }}
          >
            {loading
              ? "資料載入中..."
              : `目前魚圖鑑 ${fishCount} 筆、蟲圖鑑 ${bugCount} 筆、鳥圖鑑 ${birdCount} 筆，共 ${rows.length} 筆圖鑑資料，篩選後 ${filteredRows.length} 筆`}
          </p>
        </header>

        <section
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            padding: "18px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            <div style={{ gridColumn: "span 12" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <InfoPill label="目前時間" value={currentTimeInfo.timeText} />
                <InfoPill
                  label="目前時段"
                  value={
                    autoPeriod
                      ? `${currentTimeInfo.periodName}（自動）`
                      : `${effectivePeriodName}（手動）`
                  }
                />
              </div>
            </div>

            <div style={{ gridColumn: "span 12" }}>
              <label style={labelStyle}>搜尋名稱</label>
              <input
                type="text"
                placeholder="輸入魚、蟲、鳥名稱"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "span 12" }}>
              <label style={labelStyle}>類型</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["全部", "魚", "蟲", "鳥"].map((type) => {
                  const active = typeFilter === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      style={{
                        ...chipStyle,
                        background: active ? "#111" : "#f1f1f1",
                        color: active ? "#fff" : "#333",
                        border: active
                          ? "1px solid #111"
                          : "1px solid #e5e5e5",
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ gridColumn: "span 3" }}>
              <label style={labelStyle}>天氣</label>
              <select
                value={weatherFilter}
                onChange={(e) => setWeatherFilter(e.target.value)}
                style={selectStyle}
              >
                {["全部", "晴天", "雨天", "雪天", "彩虹"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "span 3" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  gap: "12px",
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>時段</label>

                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "#444",
                    whiteSpace: "nowrap",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={autoPeriod}
                    onChange={(e) => setAutoPeriod(e.target.checked)}
                  />
                  自動判斷
                </label>
              </div>

              <select
                value={manualPeriod}
                onChange={(e) => setManualPeriod(e.target.value)}
                style={{
                  ...selectStyle,
                  opacity: autoPeriod ? 0.5 : 1,
                  cursor: autoPeriod ? "not-allowed" : "pointer",
                }}
                disabled={autoPeriod}
              >
                <option value="全部">全部</option>
                <option value="1">清晨</option>
                <option value="2">上午</option>
                <option value="3">下午</option>
                <option value="4">晚上</option>
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>魚愛好等級</label>
              <select
                value={fishLevel}
                onChange={(e) => setFishLevel(e.target.value)}
                style={selectStyle}
              >
                <option value="全部">全部</option>
                {fishLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>蟲愛好等級</label>
              <select
                value={bugLevel}
                onChange={(e) => setBugLevel(e.target.value)}
                style={selectStyle}
              >
                <option value="全部">全部</option>
                {bugLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>鳥愛好等級</label>
              <select
                value={birdLevel}
                onChange={(e) => setBirdLevel(e.target.value)}
                style={selectStyle}
              >
                <option value="全部">全部</option>
                {birdLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            padding: "14px",
            overflowX: "auto",
          }}
        >
          {loading ? (
            <div style={{ padding: "24px", color: "#666" }}>資料載入中...</div>
          ) : (
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
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "24px 14px",
                        textAlign: "center",
                        color: "#777",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      沒有符合條件的資料
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, index) => (
                    <tr key={`${getField(row, ["名稱"])}-${index}`}>
                      <td style={tdStyle}>{getField(row, ["類型"])}</td>
                      <td style={tdStyle}>{getField(row, ["Level", "等級"])}</td>
                      <td style={tdStyleStrong}>{getField(row, ["名稱"])}</td>
                      <td style={tdStyle}>{getField(row, ["天氣"])}</td>
                      <td style={tdStyle}>
                        {formatPeriodDisplay(getField(row, ["時段", "時間"]))}
                      </td>
                      <td style={tdStyle}>{getField(row, ["地點"])}</td>
                      <td style={tdStyle}>{getField(row, ["Note", "備註"])}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoPill({ label, value }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 14px",
        borderRadius: "999px",
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        fontSize: "14px",
        color: "#333",
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#444",
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  height: "44px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  padding: "0 14px",
  fontSize: "15px",
  outline: "none",
  background: "#fff",
};

const selectStyle = {
  width: "100%",
  height: "44px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  padding: "0 14px",
  fontSize: "15px",
  outline: "none",
  background: "#fff",
};

const chipStyle = {
  height: "40px",
  padding: "0 14px",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

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