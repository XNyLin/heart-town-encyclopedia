"use client";

import { useEffect, useMemo, useState } from "react";

import CatGallery from "@/components/CatGallery";
import DogGallery from "@/components/DogGallery";
import ControlPanel from "@/components/ControlPanel";
import BioTable from "@/components/BioTable";

import {
  parseCSV,
  normalizeText,
  getField,
  matchesWeather,
  matchesPeriod,
  matchesArea,
  getPeriodName,
  getCurrentTimeInfo,
  getUniqueSortedLevels,
  sortRowsByLevel,
} from "@/lib/bio-utils";

import {
  chipStyle,
  miniChipStyle,
  actionButtonStyle,
} from "@/styles/bioStyles";

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

  const inlineFilterItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  };

  const inlineFilterLabelStyle = {
    fontSize: "13px",
    fontWeight: 600,
    color: "#555",
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  const compactSelectStyle = {
    ...selectStyle,
    height: "36px",
  };

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

const panelStyle = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
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