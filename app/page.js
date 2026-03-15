"use client";

import { useEffect, useMemo, useState } from "react";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1dCQmBErMhSXriigbgKQma1dQ2q7qNAo2AUTWiFv_AsQ/export?format=csv&gid=1514414564";

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

  const cell = normalizeText(cellValue);
  const target = normalizeText(selectedWeather);

  return cell.includes(target);
}

function matchesPeriod(cellValue, currentPeriod) {
  if (currentPeriod === "全部") return true;

  const cell = normalizeText(cellValue);
  const digitsOnly = cell.replace(/[^\d]/g, "");

  return digitsOnly.includes(String(currentPeriod));
}

function matchesArea(cellValue, selectedArea) {
  if (selectedArea === "全部") return true;

  const cell = normalizeText(cellValue);
  return cell.includes(selectedArea);
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
    if (text.includes(key)) {
      result.push(weatherMap[key]);
    }
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

/* 新增：地點顏色 */
function formatPlaceDisplay(value) {
  const text = String(value || "");

  let color = "#333";

  if (text.includes("⬆")) {
    color = "#8B5A2B";
  } else if (text.includes("⬅")) {
    color = "#9AD87A";
  } else if (text.includes("⮕")) {
    color = "#1F7A3A";
  } else if (text.includes("⬇")) {
    color = "#2563EB";
  } else if (text.includes("⊡") || text.includes("🏘️")) {
    color = "#EAB308";
  } else if (text.includes("河")) {
    color = "#38BDF8";
  }

  return <span style={{ color, fontWeight: 600 }}>{text}</span>;
}

function sortRowsByLevel(rows, order) {
  if (order === "none") return rows;

  const cloned = [...rows];

  cloned.sort((a, b) => {
    const aLevel = Number(getField(a, ["Level", "等級"])) || 0;
    const bLevel = Number(getField(b, ["Level", "等級"])) || 0;

    if (order === "asc") return aLevel - bLevel;
    return bLevel - aLevel;
  });

  return cloned;
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <label
      style={{
        position: "relative",
        display: "inline-block",
        width: "44px",
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: checked ? "#34C759" : "#ccc",
          borderRadius: "24px",
        }}
      />

      <span
        style={{
          position: "absolute",
          height: "20px",
          width: "20px",
          left: checked ? "22px" : "2px",
          top: "2px",
          backgroundColor: "white",
          borderRadius: "50%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
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

export default function Home() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [weatherFilter, setWeatherFilter] = useState("全部");
  const [areaFilter, setAreaFilter] = useState("全部");

  const [fishLevel, setFishLevel] = useState("全部");
  const [bugLevel, setBugLevel] = useState("全部");
  const [birdLevel, setBirdLevel] = useState("全部");

  const [tab, setTab] = useState("全部");
  const [levelSort, setLevelSort] = useState("none");

  const [now, setNow] = useState(new Date());
  const [autoPeriod, setAutoPeriod] = useState(true);
  const [manualPeriod, setManualPeriod] = useState("全部");

  useEffect(() => {
    async function loadData() {
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      const csvText = await res.text();
      const parsedRows = parseCSV(csvText).filter(
        (row) => getField(row, ["名稱"]) !== ""
      );
      setRows(parsedRows);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const currentTimeInfo = useMemo(() => getCurrentTimeInfo(now), [now]);

  const effectivePeriod = autoPeriod ? currentTimeInfo.period : manualPeriod;

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

      const matchTab = tab === "全部" ? true : rowType === tab;
      const matchWeather = matchesWeather(rowWeather, weatherFilter);
      const matchArea = matchesArea(rowArea, areaFilter);
      const matchPeriod = matchesPeriod(rowPeriod, effectivePeriod);

      let matchLevel = true;

      if (tab !== "全部") {
        if (rowType === "魚" && fishLevel !== "全部") {
          matchLevel = rowLevel <= Number(fishLevel);
        } else if (rowType === "蟲" && bugLevel !== "全部") {
          matchLevel = rowLevel <= Number(bugLevel);
        } else if (rowType === "鳥" && birdLevel !== "全部") {
          matchLevel = rowLevel <= Number(birdLevel);
        }
      }

      return (
        rowName !== "" &&
        matchKeyword &&
        matchTab &&
        matchWeather &&
        matchArea &&
        matchPeriod &&
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
    fishLevel,
    bugLevel,
    birdLevel,
    effectivePeriod,
    tab,
    levelSort,
  ]);

  return (
    <main style={{ padding: "40px 20px", fontFamily: "system-ui" }}>
      <table>
        <thead>
          <tr>
            <th>類型</th>
            <th>Level</th>
            <th>名稱</th>
            <th>天氣</th>
            <th>時段</th>
            <th>地點</th>
            <th>Note</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((row, index) => (
            <tr key={index}>
              <td>{getField(row, ["類型"])}</td>
              <td>{getField(row, ["Level", "等級"])}</td>
              <td>{getField(row, ["名稱"])}</td>
              <td>{formatWeatherDisplay(getField(row, ["天氣"]))}</td>
              <td>{formatPeriodDisplay(getField(row, ["時段", "時間"]))}</td>
              <td>{formatPlaceDisplay(getField(row, ["地點"]))}</td>
              <td>{formatFishShadowDisplay(getField(row, ["Note", "備註"]))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}