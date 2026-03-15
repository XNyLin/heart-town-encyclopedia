"use client";

import { useEffect, useMemo, useState } from "react";

import CatGallery from "@/components/CatGallery";
import DogGallery from "@/components/DogGallery";
import ControlPanel from "@/components/ControlPanel";
import BioTable from "@/components/BioTable";
import SourceBlock from "@/components/SourceBlock";

import {
  parseCSV,
  getField,
  matchesWeather,
  matchesPeriod,
  matchesArea,
  getPeriodName,
  getCurrentTimeInfo,
  getUniqueSortedLevels,
  sortRowsByLevel,
} from "@/lib/bio-utils";

import { chipStyle } from "@/styles/bioStyles";

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
            <ControlPanel
              currentTimeInfo={currentTimeInfo}
              effectivePeriodName={effectivePeriodName}
              autoPeriod={autoPeriod}
              setAutoPeriod={setAutoPeriod}
              manualPeriod={manualPeriod}
              setManualPeriod={setManualPeriod}
              weatherFilter={weatherFilter}
              setWeatherFilter={setWeatherFilter}
              areaFilter={areaFilter}
              setAreaFilter={setAreaFilter}
              keyword={keyword}
              setKeyword={setKeyword}
              tab={tab}
              placeFilter={placeFilter}
              setPlaceFilter={setPlaceFilter}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              fishLevel={fishLevel}
              setFishLevel={setFishLevel}
              bugLevel={bugLevel}
              setBugLevel={setBugLevel}
              birdLevel={birdLevel}
              setBirdLevel={setBirdLevel}
              fishLevels={fishLevels}
              bugLevels={bugLevels}
              birdLevels={birdLevels}
            />

            <BioTable
              loading={loading}
              filteredRows={filteredRows}
              levelSort={levelSort}
              setLevelSort={setLevelSort}
              placeFilter={placeFilter}
              setPlaceFilter={setPlaceFilter}
            />

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