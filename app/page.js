"use client";

import { useEffect, useMemo, useState } from "react";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1dCQmBErMhSXriigbgKQma1dQ2q7qNAo2AUTWiFv_AsQ/export?format=csv&gid=1514414564";

const TOP_TABS = ["全部", "魚", "蟲", "鳥", "貓", "狗"];

const TAB_LABELS = {
  全部: "全部",
  魚: "🐟 魚",
  蟲: "🐞 蟲",
  鳥: "🕊 鳥",
  貓: "🐱 貓",
  狗: "🐶 狗",
};

const CAT_SECTIONS = [
  { id: "熊貓貓", name: "熊貓貓", img: "/熊貓貓.png" },
  { id: "浣熊貓", name: "浣熊貓", img: "/浣熊貓.png" },
  { id: "白貓", name: "白貓", img: "/白貓.png" },
  { id: "黑貓", name: "黑貓", img: "/黑貓.png" },
  { id: "金漸層", name: "金漸層", img: "/金漸層.png" },
  { id: "銀漸層", name: "銀漸層", img: "/銀漸層.png" },
  { id: "奶牛貓", name: "奶牛貓", img: "/奶牛貓.png" },
  { id: "三花貓", name: "三花貓", img: "/三花貓.png" },
  { id: "暹羅貓", name: "暹羅貓", img: "/暹羅貓.png" },
  { id: "玳瑁貓", name: "玳瑁貓", img: "/玳瑁貓.png" },
  { id: "藍貓", name: "藍貓", img: "/藍貓.png" },
  { id: "橘貓", name: "橘貓", img: "/橘貓.png" },
  { id: "銀虎斑", name: "銀色古典斑貓", img: "/銀虎斑.png" },
  { id: "棕色虎斑", name: "棕色虎斑貓", img: "/棕色虎斑.png" },
];

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
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

  return lines
    .map((line, lineIndex) => {
      if (lineIndex === 0) return null;

      const values = parseCSVLine(line);
      const row = {};

      headers.forEach((header, index) => {
        row[header.trim()] = (values[index] || "").trim();
      });

      return row;
    })
    .filter(Boolean);
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
  return normalizeText(cellValue).includes(normalizeText(selectedWeather));
}

function matchesPeriod(cellValue, currentPeriod) {
  if (currentPeriod === "全部") return true;
  const digitsOnly = normalizeText(cellValue).replace(/[^\d]/g, "");
  return digitsOnly.includes(String(currentPeriod));
}

function matchesArea(cellValue, selectedArea) {
  if (selectedArea === "全部") return true;
  return normalizeText(cellValue).includes(selectedArea);
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
  if (hour >= 6 && hour < 12) period = "2";
  else if (hour >= 12 && hour < 18) period = "3";
  else if (hour >= 18) period = "4";

  return {
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

  if (
    uniquePeriods.includes("1") &&
    uniquePeriods.includes("2") &&
    uniquePeriods.includes("3") &&
    uniquePeriods.includes("4")
  ) {
    return "全天";
  }

  return uniquePeriods.map((period) => getPeriodName(period)).join("、");
}

function formatWeatherDisplay(cellValue) {
  const text = normalizeText(cellValue);
  const allWeather = ["彩虹", "晴天", "雨天", "雪天"];
  const hasAll = allWeather.every((w) => text.includes(w));

  if (hasAll) return "全天氣";

  const weatherMap = {
    彩虹: "🌈",
    晴天: "☀️",
    雨天: "☔️",
    雪天: "⛄️",
  };

  const result = [];
  for (const key of Object.keys(weatherMap)) {
    if (text.includes(key)) result.push(weatherMap[key]);
  }

  return result.length > 0 ? result.join(" ") : cellValue;
}

function formatFishShadowDisplay(value) {
  const text = String(value || "");

  if (text.includes("金魚影")) {
    return <span style={{ color: "#d97706", fontWeight: 700 }}>{text}</span>;
  }

  if (text.includes("藍魚影")) {
    return <span style={{ color: "#2563eb", fontWeight: 700 }}>{text}</span>;
  }

  return text;
}

function formatPlaceDisplay(value) {
  const text = String(value || "");
  let color = "#222";

  const isEvent = text.includes("事件") || text.includes("⭐️");
  const isRiver = text.includes("河");
  const isLake = text.includes("湖");
  const isSea = text.includes("海");

  const isNorth = text.includes("⬆");
  const isWest = text.includes("⬅");
  const isEast = text.includes("⮕");
  const isSouth = text.includes("⬇");
  const isCenter =
    text.includes("⊡") || text.includes("中心城區") || text.includes("🏘️");

  if (isEvent) {
    color = "#dc2626";
  } else if (isRiver) {
    color = "#38bdf8";
  } else if (isLake) {
    if (isNorth) color = "#15803d";
    else if (isEast) color = "#166534";
    else if (isWest) color = "#22c55e";
    else if (isSouth) color = "#4ade80";
    else color = "#16a34a";
  } else if (isSea) {
    if (isNorth) color = "#1e3a8a";
    else if (isEast) color = "#1e40af";
    else if (isWest) color = "#2563eb";
    else if (isSouth) color = "#3b82f6";
    else color = "#1d4ed8";
  } else {
    if (isNorth) color = "#8b5a2b";
    else if (isWest) color = "#9ad87a";
    else if (isEast) color = "#1f7a3a";
    else if (isSouth) color = "#2563eb";
    else if (isCenter) color = "#eab308";
  }

  return <span style={{ color, fontWeight: 600 }}>{text}</span>;
}

function sortRowsByLevel(rows, order) {
  if (order === "none") return rows;

  const cloned = [...rows];
  cloned.sort((a, b) => {
    const aLevel = Number(getField(a, ["Level", "等級"])) || 0;
    const bLevel = Number(getField(b, ["Level", "等級"])) || 0;
    return order === "asc" ? aLevel - bLevel : bLevel - aLevel;
  });

  return cloned;
}

function getNextLevelSort(current) {
  if (current === "none") return "asc";
  if (current === "asc") return "desc";
  return "none";
}

function getLevelSortIcon(current) {
  if (current === "asc") return "↑";
  if (current === "desc") return "↓";
  return "↕";
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <label
      style={{
        position: "relative",
        display: "inline-block",
        width: "42px",
        height: "24px",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          cursor: "pointer",
          backgroundColor: checked ? "#34C759" : "#ccc",
          transition: "0.2s",
          borderRadius: "999px",
        }}
      />
      <span
        style={{
          position: "absolute",
          width: "20px",
          height: "20px",
          top: "2px",
          left: checked ? "20px" : "2px",
          backgroundColor: "#fff",
          borderRadius: "50%",
          transition: "0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.22)",
        }}
      />
    </label>
  );
}

function InfoPill({ label, value }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        borderRadius: "999px",
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        fontSize: "13px",
        color: "#333",
        lineHeight: 1,
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SourceBlock({ tab }) {
  const sourceMap = {
    魚: "https://www.taptap.cn/moment/749717851794834457",
    蟲: "https://www.taptap.cn/moment/750798610429379688",
    鳥: "https://www.taptap.cn/moment/751907102351427401",
    貓: "https://www.taptap.cn/moment/577453568177472572",
  };

  if (!sourceMap[tab]) return null;

  return (
    <div
      style={{
        marginTop: "18px",
        paddingTop: "12px",
        borderTop: "1px solid #eee",
        fontSize: "13px",
        color: "#777",
        textAlign: "center",
      }}
    >
      資料來源：
      <a
        href={sourceMap[tab]}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginLeft: "6px",
          color: "#2563eb",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        TapTap
      </a>
    </div>
  );
}

function CatGallery() {
  const [catFilter, setCatFilter] = useState("全部");

  const visibleCats =
    catFilter === "全部"
      ? CAT_SECTIONS
      : CAT_SECTIONS.filter((cat) => cat.name === catFilter);

  const catTabs = ["全部", ...CAT_SECTIONS.map((cat) => cat.name)];

  return (
    <section style={panelStyle}>
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 800,
          margin: "0 0 14px 0",
          color: "#111",
        }}
      >
        貓咪圖鑑
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "18px",
        }}
      >
        {catTabs.map((name) => {
          const active = catFilter === name;
          return (
            <button
              key={name}
              onClick={() => setCatFilter(name)}
              style={{
                ...miniChipStyle,
                background: active ? "#111" : "#f3f4f6",
                border: active ? "1px solid #111" : "1px solid #e5e7eb",
                color: active ? "#fff" : "#333",
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: catFilter === "全部" ? "grid" : "block",
          gridTemplateColumns:
            catFilter === "全部"
              ? "repeat(auto-fill, minmax(420px, 1fr))"
              : "none",
          gap: "16px",
        }}
      >
        {visibleCats.map((cat) => (
          <div key={cat.id}>
            <img
              src={cat.img}
              alt={cat.name}
              style={{
                width: "100%",
                display: "block",
                borderRadius: "14px",
              }}
            />
          </div>
        ))}
      </div>

      <SourceBlock tab="貓" />
    </section>
  );
}

function DogGallery({ setTab }) {
  const [showResult, setShowResult] = useState(false);

  if (showResult) {
    return (
      <section
        style={{
          ...panelStyle,
          textAlign: "center",
          padding: "36px 24px",
        }}
      >
        <div
          style={{
            fontSize: "26px",
            fontWeight: 800,
            color: "#111",
          }}
        >
          我是貓派
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        ...panelStyle,
        textAlign: "center",
        padding: "36px 24px",
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "24px",
          color: "#333",
          lineHeight: 1.8,
        }}
      >
        很吵、很黏、超級容易餓，<br />
        一直搞破壞還要幫牠撿屎，<br />
        確定嗎？
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={() => setTab("貓")}
          style={{
            ...actionButtonStyle,
            background: "#111",
            color: "#fff",
            border: "1px solid #111",
          }}
        >
          我選貓
        </button>

        <button
          onClick={() => setShowResult(true)}
          style={{
            ...actionButtonStyle,
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
          }}
        >
          我選狗
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [weatherFilter, setWeatherFilter] = useState("全部");
  const [areaFilter, setAreaFilter] = useState("全部");
  const [placeFilter, setPlaceFilter] = useState("");

  const [fishLevel, setFishLevel] = useState("全部");
  const [bugLevel, setBugLevel] = useState("全部");
  const [birdLevel, setBirdLevel] = useState("全部");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [tab, setTab] = useState("全部");
  const [levelSort, setLevelSort] = useState("none");

  const [now, setNow] = useState(new Date());
  const [autoPeriod, setAutoPeriod] = useState(true);
  const [manualPeriod, setManualPeriod] = useState("全部");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("無法讀取 Google Sheet 資料");

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
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
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
    const baseFiltered = rows.filter((row) => {
      const rowType = getField(row, ["類型"]);
      const rowName = getField(row, ["名稱"]);
      const rowLevel = Number(getField(row, ["Level", "等級"]));
      const rowWeather = getField(row, ["天氣"]);
      const rowPeriod = getField(row, ["時段", "時間"]);
      const rowArea = getField(row, ["地區"]);
      const rowPlace = getField(row, ["地點"]);
      const rowNote = getField(row, ["Note", "備註"]);

      const matchKeyword = keyword.trim()
        ? rowName.toLowerCase().includes(keyword.trim().toLowerCase())
        : true;

      const matchTab =
        tab === "全部"
          ? true
          : tab === "貓" || tab === "狗"
          ? false
          : rowType === tab;

      const matchWeather = matchesWeather(rowWeather, weatherFilter);
      const matchArea = matchesArea(rowArea, areaFilter);
      const matchPeriod = matchesPeriod(rowPeriod, effectivePeriod);
      const matchPlace = placeFilter ? rowPlace === placeFilter : true;

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
        matchTab &&
        matchWeather &&
        matchArea &&
        matchPeriod &&
        matchPlace &&
        matchLevel &&
        rowPlace !== "" &&
        rowNote !== undefined
      );
    });

    return sortRowsByLevel(baseFiltered, levelSort);
  }, [
    rows,
    keyword,
    weatherFilter,
    areaFilter,
    placeFilter,
    fishLevel,
    bugLevel,
    birdLevel,
    effectivePeriod,
    tab,
    levelSort,
  ]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "28px 16px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: "20px" }}>
          <h1
            style={{
              fontSize: "36px",
              lineHeight: 1.1,
              fontWeight: 800,
              margin: "0 0 10px 0",
              color: "#111",
              letterSpacing: "-0.02em",
            }}
          >
            心動小鎮｜生物圖鑑
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            {loading
              ? "資料載入中..."
              : `目前魚圖鑑 ${fishCount} 筆、蟲圖鑑 ${bugCount} 筆、鳥圖鑑 ${birdCount} 筆，共 ${rows.length} 筆圖鑑資料，篩選後 ${filteredRows.length} 筆`}
          </p>
        </header>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {TOP_TABS.map((type, index) => {
              const active = tab === type;
              const showDivider = TOP_TABS[index] === "鳥";

              return (
                <div
                  key={type}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => setTab(type)}
                    style={{
                      ...chipStyle,
                      background: active ? "#111" : "#f1f1f1",
                      color: active ? "#fff" : "#333",
                      border: active
                        ? "1px solid #111"
                        : "1px solid #e5e5e5",
                    }}
                  >
                    {TAB_LABELS[type]}
                  </button>

                  {showDivider && (
                    <span
                      style={{
                        color: "#bbb",
                        fontSize: "18px",
                        fontWeight: 600,
                      }}
                    >
                      ｜
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {tab === "貓" ? (
          <CatGallery />
        ) : tab === "狗" ? (
          <DogGallery setTab={setTab} />
        ) : (
          <>
<section
  style={{
    ...panelStyle,
    marginBottom: "16px",
    padding: "16px",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1.4fr 0.9fr",
      gap: "16px",
      alignItems: "start",
    }}
  >
    <div
      style={{
        display: "grid",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
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
        {placeFilter && (
          <>
            <InfoPill label="📍現在查看的位置" value={placeFilter} />
            <button
              onClick={() => setPlaceFilter("")}
              style={miniChipStyle}
            >
              返回全部位置
            </button>
          </>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "12px",
        }}
      >
        <div>
          <label style={labelStyle}>天氣</label>
          <select
            value={weatherFilter}
            onChange={(e) => setWeatherFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="全部">全部</option>
            <option value="晴天">晴天 ☀️</option>
            <option value="雨天">雨天 ☔️</option>
            <option value="雪天">雪天 ⛄️</option>
            <option value="彩虹">彩虹 🌈</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>地區</label>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            style={selectStyle}
          >
            {["全部", "中心城區", "北部", "東部", "西部", "南部"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <label style={{ ...labelStyle, marginBottom: 0 }}>時段</label>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#444",
                whiteSpace: "nowrap",
              }}
            >
              <ToggleSwitch
                checked={autoPeriod}
                onChange={setAutoPeriod}
              />
              自動判斷
            </div>
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
      </div>

      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            ...miniChipStyle,
            height: "36px",
          }}
        >
          愛好等級 {showAdvanced ? "▲" : "▼"}
        </button>

        {showAdvanced && (
          <div
            style={{
              marginTop: "10px",
              padding: "12px 14px",
              border: "1px solid #eee",
              borderRadius: "12px",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#555",
                }}
              >
                釣魚
              </span>
              <select
                value={fishLevel}
                onChange={(e) => setFishLevel(e.target.value)}
                style={{ ...selectStyle, width: "88px", height: "36px" }}
              >
                <option value="全部">全部</option>
                {fishLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#555",
                }}
              >
                捕蟲
              </span>
              <select
                value={bugLevel}
                onChange={(e) => setBugLevel(e.target.value)}
                style={{ ...selectStyle, width: "88px", height: "36px" }}
              >
                <option value="全部">全部</option>
                {bugLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#555",
                }}
              >
                觀鳥
              </span>
              <select
                value={birdLevel}
                onChange={(e) => setBirdLevel(e.target.value)}
                style={{ ...selectStyle, width: "88px", height: "36px" }}
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
        )}
      </div>
    </div>

    <div>
      <label style={labelStyle}>搜尋</label>
      <input
        type="text"
        placeholder={tab === "全部" ? "輸入生物名稱" : `輸入${tab}名稱`}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={inputStyle}
      />
    </div>
  </div>
</section>

            <section
              style={{
                ...panelStyle,
                padding: "10px 14px",
                overflowX: "auto",
              }}
            >
              {loading ? (
                <div style={{ padding: "20px", color: "#666" }}>資料載入中...</div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "auto",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, width: "30px", textAlign: "center" }}>
                        類型
                      </th>
                      <th style={{ ...thStyle, width: "54px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>等級</span>
                          <button
                            onClick={() => setLevelSort(getNextLevelSort(levelSort))}
                            style={sortIconButtonStyle}
                            title={
                              levelSort === "none"
                                ? "目前：未排序"
                                : levelSort === "asc"
                                ? "目前：低到高"
                                : "目前：高到低"
                            }
                          >
                            {getLevelSortIcon(levelSort)}
                          </button>
                        </div>
                      </th>
                      <th style={thStyle}>名稱</th>
                      <th style={thStyle}>天氣</th>
                      <th style={thStyle}>時段</th>
                      <th style={thStyle}>地點</th>
                      <th style={thStyle}>Note</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: "22px 12px",
                            textAlign: "center",
                            color: "#777",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          沒有符合條件的資料
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, index) => {
                        const place = getField(row, ["地點"]);
                        const isActivePlace = placeFilter === place;

                        return (
                          <tr key={`${getField(row, ["名稱"])}-${index}`}>
                            <td
                              style={{
                                ...tdStyle,
                                width: "30px",
                                textAlign: "center",
                                padding: "6px 2px",
                                fontSize: "16px",
                              }}
                            >
                              {{
                                魚: "🐟",
                                蟲: "🐞",
                                鳥: "🕊",
                              }[getField(row, ["類型"])] || ""}
                            </td>

                            <td
                              style={{
                                ...tdStyle,
                                width: "54px",
                                textAlign: "center",
                                padding: "6px 4px",
                                fontWeight: 500,
                              }}
                            >
                              {getField(row, ["Level", "等級"])}
                            </td>

                            <td style={tdStyleStrong}>
                              {getField(row, ["名稱"])}
                            </td>

                            <td style={tdStyle}>
                              {formatWeatherDisplay(getField(row, ["天氣"]))}
                            </td>

                            <td style={tdStyle}>
                              {formatPeriodDisplay(getField(row, ["時段", "時間"]))}
                            </td>

                            <td style={tdStyle}>
                              <button
                                onClick={() => setPlaceFilter(place)}
                                style={{
                                  background: isActivePlace
                                    ? "#eef2ff"
                                    : "transparent",
                                  border: isActivePlace
                                    ? "1px solid #c7d2fe"
                                    : "1px solid transparent",
                                  borderRadius: "7px",
                                  padding: "2px 4px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  textAlign: "left",
                                  lineHeight: 1.4,
                                }}
                                title="點擊查看該地點所有生物"
                              >
                                {formatPlaceDisplay(place)}
                              </button>
                            </td>

                            <td style={tdStyle}>
                              {formatFishShadowDisplay(
                                getField(row, ["Note", "備註"])
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </section>

            {["魚", "蟲", "鳥"].includes(tab) && <SourceBlock tab={tab} />}
          </>
        )}

        <footer
          style={{
            marginTop: "28px",
            textAlign: "center",
            fontSize: "13px",
            color: "#888",
          }}
        >
          Powered By{" "}
          <a
            href="https://XNy.tw"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#111",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            X.Ny
          </a>
        </footer>
      </div>
    </main>
  );
}

const panelStyle = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 700,
  color: "#444",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  height: "40px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  padding: "0 12px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

const selectStyle = {
  width: "100%",
  height: "40px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  padding: "0 12px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

const sortIconButtonStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "7px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  lineHeight: 1,
  padding: 0,
  flexShrink: 0,
};

const chipStyle = {
  height: "36px",
  padding: "0 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};

const miniChipStyle = {
  height: "34px",
  padding: "0 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  background: "#fff",
  border: "1px solid #ddd",
  color: "#333",
};

const actionButtonStyle = {
  padding: "10px 20px",
  borderRadius: "10px",
  fontWeight: 600,
  cursor: "pointer",
};

const thStyle = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #e8e8e8",
  fontSize: "13px",
  fontWeight: 700,
  color: "#444",
  whiteSpace: "nowrap",
  background: "#fff",
  verticalAlign: "middle",
};

const tdStyle = {
  padding: "8px 6px",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
  color: "#222",
  verticalAlign: "middle",
  lineHeight: 1.45,
};

const tdStyleStrong = {
  ...tdStyle,
  fontWeight: 700,
};