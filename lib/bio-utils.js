export function formatPeriodDisplay(cellValue) {
  const digitsOnly = String(cellValue || "")
    .replace(/\s+/g, "")
    .replace(/[^\d]/g, "");

  const uniquePeriods = [...new Set(digitsOnly.split("").filter(Boolean))].sort();

  if (uniquePeriods.length === 0) return "";

  const joined = uniquePeriods.join("");

  const mergedMap = {
    "1": "00:00 - 06:00",
    "2": "06:00 - 12:00",
    "3": "12:00 - 18:00",
    "4": "18:00 - 24:00",

    "12": "00:00 - 12:00",
    "23": "06:00 - 18:00",
    "34": "12:00 - 24:00",
    "14": "18:00 - 06:00",

    "123": "00:00 - 18:00",
    "234": "06:00 - 24:00",
    "124": "18:00 - 12:00",
    "134": "12:00 - 06:00",

    "1234": "全天",
  };

  return mergedMap[joined] || cellValue;
}