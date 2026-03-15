"use client";

import { useEffect, useMemo, useState } from "react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1dCQmBErMhSXriigbgKQma1dQ2q7qNAo2AUTWiFv_AsQ/export?format=csv&gid=1514414564";

function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim() || "";
    });

    return obj;
  });
}

function getField(row, keys) {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return "";
}

function getPeriod(hour) {
  if (hour < 6) return 1;
  if (hour < 12) return 2;
  if (hour < 18) return 3;
  return 4;
}

function periodName(p) {
  return ["清晨", "上午", "下午", "晚上"][p - 1];
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <label
      style={{
        position: "relative",
        width: 44,
        height: 24,
        display: "inline-block",
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
          background: checked ? "#34C759" : "#ccc",
          borderRadius: 24,
          transition: ".2s",
        }}
      />

      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          background: "#fff",
          borderRadius: "50%",
          transition: ".2s",
          boxShadow: "0 1px 3px rgba(0,0,0,.3)",
        }}
      />
    </label>
  );
}

export default function Page() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("魚");
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState("全部");
  const [area, setArea] = useState("全部");

  const [fishLevel, setFishLevel] = useState("全部");
  const [bugLevel, setBugLevel] = useState("全部");
  const [birdLevel, setBirdLevel] = useState("全部");

  const [sort, setSort] = useState("none");

  const [autoPeriod, setAutoPeriod] = useState(true);
  const [manualPeriod, setManualPeriod] = useState("全部");

  const now = new Date();
  const currentPeriod = getPeriod(now.getHours());

  useEffect(() => {
    async function load() {
      const res = await fetch(SHEET_URL);
      const text = await res.text();
      setRows(parseCSV(text));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let data = rows.filter((r) => getField(r, ["類型"]) === tab);

    if (search)
      data = data.filter((r) =>
        getField(r, ["名稱"]).toLowerCase().includes(search.toLowerCase())
      );

    if (weather !== "全部")
      data = data.filter((r) =>
        getField(r, ["天氣"]).includes(weather)
      );

    if (area !== "全部")
      data = data.filter((r) =>
        getField(r, ["地區"]).includes(area)
      );

    const p = autoPeriod ? currentPeriod : manualPeriod;

    if (p !== "全部")
      data = data.filter((r) =>
        getField(r, ["時段"]).includes(String(p))
      );

    data = data.filter((r) => {
      const level = Number(getField(r, ["Level"]));

      if (tab === "魚" && fishLevel !== "全部") return level <= fishLevel;
      if (tab === "蟲" && bugLevel !== "全部") return level <= bugLevel;
      if (tab === "鳥" && birdLevel !== "全部") return level <= birdLevel;

      return true;
    });

    if (sort !== "none") {
      data.sort((a, b) => {
        const la = Number(getField(a, ["Level"]));
        const lb = Number(getField(b, ["Level"]));

        return sort === "asc" ? la - lb : lb - la;
      });
    }

    return data;
  }, [
    rows,
    tab,
    search,
    weather,
    area,
    fishLevel,
    bugLevel,
    birdLevel,
    sort,
    autoPeriod,
    manualPeriod,
  ]);

  const fishCount = rows.filter((r) => r["類型"] === "魚").length;
  const bugCount = rows.filter((r) => r["類型"] === "蟲").length;
  const birdCount = rows.filter((r) => r["類型"] === "鳥").length;

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>心動小鎮｜生物圖鑑</h1>

      <p>
        目前魚圖鑑 {fishCount} 筆、蟲圖鑑 {bugCount} 筆、鳥圖鑑 {birdCount} 筆，
        共 {rows.length} 筆資料，篩選後 {filtered.length} 筆
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["魚", "蟲", "鳥"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "6px 12px",
              background: tab === t ? "#000" : "#eee",
              color: tab === t ? "#fff" : "#000",
              borderRadius: 8,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="搜尋"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setWeather(e.target.value)}>
          <option>全部</option>
          <option>晴天</option>
          <option>雨天</option>
          <option>雪天</option>
          <option>彩虹</option>
        </select>

        <select onChange={(e) => setArea(e.target.value)}>
          <option>全部</option>
          <option>中心城區</option>
          <option>北部</option>
          <option>東部</option>
          <option>西部</option>
          <option>南部</option>
        </select>

        <select
          disabled={autoPeriod}
          onChange={(e) => setManualPeriod(e.target.value)}
        >
          <option value="全部">全部</option>
          <option value="1">清晨</option>
          <option value="2">上午</option>
          <option value="3">下午</option>
          <option value="4">晚上</option>
        </select>

        <ToggleSwitch checked={autoPeriod} onChange={setAutoPeriod} />
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>類型</th>

            <th>
              Level
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ marginLeft: 6 }}
              >
                <option value="none">預設</option>
                <option value="asc">低→高</option>
                <option value="desc">高→低</option>
              </select>
            </th>

            <th>名稱</th>
            <th>天氣</th>
            <th>時段</th>
            <th>地點</th>
            <th>地區</th>
            <th>Note</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((r, i) => (
            <tr key={i}>
              <td>{getField(r, ["類型"])}</td>
              <td>{getField(r, ["Level"])}</td>
              <td>{getField(r, ["名稱"])}</td>
              <td>{getField(r, ["天氣"])}</td>
              <td>{getField(r, ["時段"])}</td>
              <td>{getField(r, ["地點"])}</td>
              <td>{getField(r, ["地區"])}</td>
              <td>{getField(r, ["Note"])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}