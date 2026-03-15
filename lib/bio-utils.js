export function parseCSVLine(line) {
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

export function parseCSV(text) {
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