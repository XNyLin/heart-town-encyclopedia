import Papa from "papaparse";

export function parseCSV(text) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data.map((row) => {
    const cleanedRow = {};

    Object.keys(row).forEach((key) => {
      cleanedRow[String(key || "").trim()] =
        typeof row[key] === "string"
          ? row[key].replace(/\r\n?/g, "\n")
          : row[key];
    });

    return cleanedRow;
  });
}

export function normalizeText(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

export function getField(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }
  return "";
}

export function matchesWeather(cellValue, selectedWeather) {
  if (selectedWeather === "全部") return true;
  return normalizeText(cellValue).includes(normalizeText(selectedWeather));
}

export function matchesPeriod(cellValue, currentPeriod) {
  if (currentPeriod === "全部") return true;
  const digitsOnly = normalizeText(cellValue).replace(/[^\d]/g, "");
  return digitsOnly.includes(String(currentPeriod));
}

export function matchesArea(cellValue, selectedArea) {
  if (selectedArea === "全部") return true;
  return normalizeText(cellValue).includes(selectedArea);
}

export function getPeriodName(period) {
  const map = {
    "1": "清晨",
    "2": "上午",
    "3": "下午",
    "4": "晚上",
  };
  return map[String(period)] || "";
}

export function getCurrentTimeInfo(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();

  let period = "1";
  if (hour >= 6 && hour < 12) period = "2";
  else if (hour >= 12 && hour < 18) period = "3";
  else if (hour >= 18) period = "4";

  return {
    period,
    periodName: getPeriodName(period),
    timeText: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function formatPeriodDisplay(cellValue) {
  const digitsOnly = String(cellValue || "")
    .replace(/\s+/g, "")
    .replace(/[^\d]/g, "");

  const uniquePeriods = [...new Set(digitsOnly.split("").filter(Boolean))].sort();

  if (uniquePeriods.length === 0) return "";

  const mergedMap = {
    "124": "18:00 - 12:00",
    "134": "12:00 - 06:00",
    "1234": "全天",
  };

  const joined = uniquePeriods.join("");
  if (mergedMap[joined]) return mergedMap[joined];

  return "";
}

export function formatWeatherDisplay(cellValue) {
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

export function getUniqueSortedLevels(rows, type) {
  const values = rows
    .filter((row) => getField(row, ["類型"]) === type)
    .map((row) => Number(getField(row, ["Level", "等級"])))
    .filter((value) => !Number.isNaN(value));

  return [...new Set(values)].sort((a, b) => a - b);
}

export function sortRowsByLevel(rows, order) {
  if (order === "none") return rows;

  const cloned = [...rows];
  cloned.sort((a, b) => {
    const aLevel = Number(getField(a, ["Level", "等級"])) || 0;
    const bLevel = Number(getField(b, ["Level", "等級"])) || 0;
    return order === "asc" ? aLevel - bLevel : bLevel - aLevel;
  });

  return cloned;
}

export function getNextLevelSort(current) {
  if (current === "none") return "asc";
  if (current === "asc") return "desc";
  return "none";
}

export function getLevelSortIcon(current) {
  if (current === "asc") return "↑";
  if (current === "desc") return "↓";
  return "↕";
}