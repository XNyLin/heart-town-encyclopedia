"use client";

import { useEffect, useMemo, useState } from "react";

import CatGallery from "@/components/CatGallery";
import DogGallery from "@/components/DogGallery";
import ControlPanel from "@/components/ControlPanel";
import BioTable from "@/components/BioTable";
import SourceBlock from "@/components/SourceBlock";
import { CHANGELOG } from "@/lib/changelog";

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

const TOP_TABS = ["全部", "魚", "蟲", "鳥", "貝", "貓", "狗"];

const TAB_LABELS = {
  全部: "全部",
  魚: "🐟 魚",
  蟲: "🐞 蟲",
  鳥: "🕊 鳥",
  貝: "🐚 貝",
  貓: "🐱 貓",
  狗: "🐶 狗",
};

const PLACE_GROUPS = {
  河流: ["巨木河", "淺水河", "霞光河", "靜河"],
  海洋: ["東海", "舊海", "緩風海", "鯨魚海"],
  湖泊: ["城郊湖", "草原湖", "森林湖", "溫泉山湖"],
};

const FILTER_SETTINGS_STORAGE_KEY = "heartTownFilterSettings";

const DEFAULT_FILTER_SETTINGS = {
  weatherFilter: "全部",
  seasonFilter: "全部",
  fishLevel: "全部",
  bugLevel: "全部",
  birdLevel: "全部",
  shellLevel: "全部",
};

function getValidStoredValue(value, fallback) {
  return typeof value === "string" && value !== "" ? value : fallback;
}

function normalizePlaceName(value) {
  return String(value || "")
    .replace(/^[^\u4e00-\u9fff]+/u, "")
    .trim();
}

function getPlaceFilterTargets(placeFilter) {
  if (!placeFilter) return null;

  const normalizedPlaceFilter = normalizePlaceName(placeFilter);
  const groupEntry = Object.entries(PLACE_GROUPS).find(
    ([basePlace, subPlaces]) =>
      basePlace === normalizedPlaceFilter || subPlaces.includes(normalizedPlaceFilter)
  );

  if (!groupEntry) return [normalizedPlaceFilter];

  const [basePlace, subPlaces] = groupEntry;
  return basePlace === normalizedPlaceFilter
    ? [basePlace, ...subPlaces]
    : [basePlace, normalizedPlaceFilter];
}

export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starRecords, setStarRecords] = useState({});
  const [starRecordsReady, setStarRecordsReady] = useState(false);
  const [filterSettingsReady, setFilterSettingsReady] = useState(false);
  const [hideFullStars, setHideFullStars] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [weatherFilter, setWeatherFilter] = useState("全部");
  const [seasonFilter, setSeasonFilter] = useState("全部");
  const [areaFilter, setAreaFilter] = useState("全部");
  const [placeFilter, setPlaceFilter] = useState("");

  const [fishLevel, setFishLevel] = useState("全部");
  const [bugLevel, setBugLevel] = useState("全部");
  const [birdLevel, setBirdLevel] = useState("全部");
  const [shellLevel, setShellLevel] = useState("全部");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [tab, setTab] = useState("全部");
  const [levelSort, setLevelSort] = useState("none");
  const [now, setNow] = useState(new Date());
  const [autoPeriod, setAutoPeriod] = useState(true);
  const [manualPeriod, setManualPeriod] = useState("全部");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("heartTownStarRecords");
      if (saved) setStarRecords(JSON.parse(saved));
    } catch (error) {
      console.error("讀取星數紀錄失敗:", error);
    } finally {
      setStarRecordsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!starRecordsReady) return;
    try {
      window.localStorage.setItem("heartTownStarRecords", JSON.stringify(starRecords));
    } catch (error) {
      console.error("儲存星數紀錄失敗:", error);
    }
  }, [starRecords, starRecordsReady]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FILTER_SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setWeatherFilter(
          getValidStoredValue(parsed.weatherFilter, DEFAULT_FILTER_SETTINGS.weatherFilter)
        );
        setSeasonFilter(
          getValidStoredValue(parsed.seasonFilter, DEFAULT_FILTER_SETTINGS.seasonFilter)
        );
        setFishLevel(
          getValidStoredValue(parsed.fishLevel, DEFAULT_FILTER_SETTINGS.fishLevel)
        );
        setBugLevel(
          getValidStoredValue(parsed.bugLevel, DEFAULT_FILTER_SETTINGS.bugLevel)
        );
        setBirdLevel(
          getValidStoredValue(parsed.birdLevel, DEFAULT_FILTER_SETTINGS.birdLevel)
        );
        setShellLevel(
          getValidStoredValue(parsed.shellLevel, DEFAULT_FILTER_SETTINGS.shellLevel)
        );
      }
    } catch (error) {
      console.error("讀取篩選設定失敗:", error);
    } finally {
      setFilterSettingsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!filterSettingsReady) return;
    try {
      window.localStorage.setItem(
        FILTER_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          weatherFilter,
          seasonFilter,
          fishLevel,
          bugLevel,
          birdLevel,
          shellLevel,
        })
      );
    } catch (error) {
      console.error("儲存篩選設定失敗:", error);
    }
  }, [
    weatherFilter,
    seasonFilter,
    fishLevel,
    bugLevel,
    birdLevel,
    shellLevel,
    filterSettingsReady,
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("無法讀取 Google Sheet 資料");

        const csvText = await res.text();
        const parsedRows = parseCSV(csvText)
          .filter((row) => {
            const name = getField(row, ["名稱"]);
            return name !== "" && name !== "???";
          })
          .map((row) => {
            const name = getField(row, ["名稱"]);
            const type = getField(row, ["類型"]);
            const level = Number(getField(row, ["Level", "等級"])) || 0;
            const weather = getField(row, ["天氣"]);
            const period = getField(row, ["時段", "時間"]);
            const area = getField(row, ["地區"]);
            const place = getField(row, ["地點"]);
            const note = getField(row, ["Note", "備註"]);
            const season = getField(row, ["季節"]);

            return {
              ...row,
              _name: name,
              _nameLower: String(name).toLowerCase(),
              _type: type,
              _level: level,
              _weather: weather,
              _period: period,
              _area: area,
              _place: place,
              _normalizedPlace: normalizePlaceName(place),
              _note: note,
              _season: season,
            };
          });

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 250);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const latestVersion = CHANGELOG?.[0]?.version ?? "v0.0.0";
  const currentTimeInfo = useMemo(() => getCurrentTimeInfo(now), [now]);
  const effectivePeriod = autoPeriod ? currentTimeInfo.period : manualPeriod;
  const effectivePeriodName =
    effectivePeriod === "全部" ? "全部" : getPeriodName(effectivePeriod);

  const fishLevels = useMemo(() => getUniqueSortedLevels(rows, "魚"), [rows]);
  const bugLevels = useMemo(() => getUniqueSortedLevels(rows, "蟲"), [rows]);
  const birdLevels = useMemo(() => getUniqueSortedLevels(rows, "鳥"), [rows]);
  const shellLevels = useMemo(() => getUniqueSortedLevels(rows, "貝"), [rows]);

  const fishCount = useMemo(() => rows.filter((row) => row._type === "魚").length, [rows]);
  const bugCount = useMemo(() => rows.filter((row) => row._type === "蟲").length, [rows]);
  const birdCount = useMemo(() => rows.filter((row) => row._type === "鳥").length, [rows]);
  const shellCount = useMemo(() => rows.filter((row) => row._type === "貝").length, [rows]);

  function setStarRecord(name, star) {
    if (!name) return;
    setStarRecords((prev) => ({ ...prev, [name]: Number(star) }));
  }

  const filteredRows = useMemo(() => {
    const baseFiltered = rows.filter((row) => {
      const rowType = row._type;
      const rowName = row._name;
      const rowLevel = row._level;
      const rowWeather = row._weather;
      const rowPeriod = row._period;
      const rowArea = row._area;
      const rowPlace = row._place;
      const rowNormalizedPlace = row._normalizedPlace;
      const rowNote = row._note;
      const rowSeason = row._season;

      const matchKeyword = debouncedKeyword.trim()
        ? row._nameLower.includes(debouncedKeyword.trim().toLowerCase())
        : true;
      const matchTab =
        tab === "全部" ? true : tab === "貓" || tab === "狗" ? false : rowType === tab;
      const matchWeather = matchesWeather(rowWeather, weatherFilter);
      const matchSeason = seasonFilter === "全部" ? true : rowSeason === seasonFilter;
      const matchArea = matchesArea(rowArea, areaFilter);
      const matchPeriod = matchesPeriod(rowPeriod, effectivePeriod);
      const placeFilterTargets = getPlaceFilterTargets(placeFilter);
      const matchPlace = placeFilterTargets
        ? placeFilterTargets.includes(rowNormalizedPlace)
        : true;
      const maxStars = rowName === "破損的海貝" ? 1 : 5;
      const matchFullStar = hideFullStars
        ? Number(starRecords[rowName] ?? 0) !== maxStars
        : true;

      let matchLevel = true;
      if (rowType === "魚" && fishLevel !== "全部") {
        matchLevel = rowLevel <= Number(fishLevel);
      } else if (rowType === "蟲" && bugLevel !== "全部") {
        matchLevel = rowLevel <= Number(bugLevel);
      } else if (rowType === "鳥" && birdLevel !== "全部") {
        matchLevel = rowLevel <= Number(birdLevel);
      } else if (rowType === "貝" && shellLevel !== "全部") {
        matchLevel = rowLevel <= Number(shellLevel);
      }

      return (
        rowName !== "" &&
        matchKeyword &&
        matchTab &&
        matchWeather &&
        matchSeason &&
        matchArea &&
        matchPeriod &&
        matchPlace &&
        matchLevel &&
        matchFullStar &&
        rowPlace !== "" &&
        rowNote !== undefined
      );
    });

    return sortRowsByLevel(baseFiltered, levelSort);
  }, [
    rows,
    debouncedKeyword,
    weatherFilter,
    seasonFilter,
    areaFilter,
    placeFilter,
    fishLevel,
    bugLevel,
    birdLevel,
    shellLevel,
    effectivePeriod,
    tab,
    levelSort,
    starRecords,
    hideFullStars,
  ]);

  const seasonGroups = useMemo(() => {
    const groupedRows = filteredRows.reduce((groups, row) => {
      const season = row._season || "其他季節";
      if (!groups[season]) groups[season] = [];
      groups[season].push(row);
      return groups;
    }, {});

    const orderedSeasons = [
      "常駐",
      "尋鯨季",
      ...Object.keys(groupedRows).filter(
        (season) => season !== "常駐" && season !== "尋鯨季"
      ),
    ];

    return orderedSeasons
      .filter((season) => groupedRows[season]?.length)
      .map((season) => ({ season, rows: groupedRows[season] }));
  }, [filteredRows]);

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
      <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}>
        <header style={{ marginBottom: "20px" }}>
          <h1
            style={{
              fontSize: isMobile ? "30px" : "34px",
              lineHeight: 1.1,
              fontWeight: 800,
              margin: "0 0 10px 0",
              color: "#111",
              letterSpacing: "-0.02em",
            }}
          >
            心動小鎮｜生物圖鑑
            <span
              style={{
                marginLeft: "10px",
                fontSize: isMobile ? "14px" : "15px",
                fontWeight: 400,
                color: "#666",
                letterSpacing: 0,
              }}
            >
              · {latestVersion}
            </span>
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? "14px" : "15px",
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            {loading ? "資料載入中..." : ""}
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
              const showDivider = !isMobile && TOP_TABS[index] === "貝";
              return (
                <div
                  key={type}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    onClick={() => setTab(type)}
                    style={{
                      ...chipStyle,
                      background: active ? "#111" : "#f1f1f1",
                      color: active ? "#fff" : "#333",
                      border: active ? "1px solid #111" : "1px solid #e5e5e5",
                    }}
                  >
                    {TAB_LABELS[type]}
                  </button>
                  {showDivider && (
                    <span style={{ color: "#bbb", fontSize: "18px", fontWeight: 600 }}>
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
              seasonFilter={seasonFilter}
              setSeasonFilter={setSeasonFilter}
              areaFilter={areaFilter}
              setAreaFilter={setAreaFilter}
              keyword={keyword}
              setKeyword={setKeyword}
              fishCount={fishCount}
              bugCount={bugCount}
              birdCount={birdCount}
              shellCount={shellCount}
              fishOwnedStars={rows
                .filter((row) => row._type === "魚")
                .reduce((sum, row) => sum + Number(starRecords[row._name] ?? 0), 0)}
              bugOwnedStars={rows
                .filter((row) => row._type === "蟲")
                .reduce((sum, row) => sum + Number(starRecords[row._name] ?? 0), 0)}
              birdOwnedStars={rows
                .filter((row) => row._type === "鳥")
                .reduce((sum, row) => sum + Number(starRecords[row._name] ?? 0), 0)}
              shellOwnedStars={rows
                .filter((row) => row._type === "貝")
                .reduce((sum, row) => sum + Number(starRecords[row._name] ?? 0), 0)}
              ownedStars={rows.reduce(
                (sum, row) => sum + Number(starRecords[row._name] ?? 0),
                0
              )}
              totalStars={rows.length * 5}
              filteredCount={filteredRows.length}
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
              shellLevel={shellLevel}
              setShellLevel={setShellLevel}
              fishLevels={fishLevels}
              bugLevels={bugLevels}
              birdLevels={birdLevels}
              shellLevels={shellLevels}
              hideFullStars={hideFullStars}
              setHideFullStars={setHideFullStars}
            />

            {seasonGroups.map(({ season, rows: seasonRows }) => (
              <div key={season}>
                <h2
                  style={{
                    margin: "20px 0 10px",
                    fontSize: "20px",
                    color: "#111",
                  }}
                >
                  {season}圖鑑
                </h2>
                <BioTable
                  loading={loading}
                  filteredRows={seasonRows}
                  levelSort={levelSort}
                  setLevelSort={setLevelSort}
                  placeFilter={placeFilter}
                  setPlaceFilter={setPlaceFilter}
                  starRecords={starRecords}
                  setStarRecord={setStarRecord}
                  hideFullStars={hideFullStars}
                  setHideFullStars={setHideFullStars}
                />
              </div>
            ))}

            {!["魚", "蟲", "鳥"].includes(tab) ? null : <SourceBlock tab={tab} />}
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
            style={{ color: "#111", fontWeight: 700, textDecoration: "none" }}
          >
            X.Ny
          </a>
        </footer>
      </div>
    </main>
  );
}
