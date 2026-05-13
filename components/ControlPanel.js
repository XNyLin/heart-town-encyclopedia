"use client";

import { useEffect, useState } from "react";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import InfoPill from "@/components/ui/InfoPill";
import { CHANGELOG } from "@/lib/changelog";
import {
  panelStyle,
  labelStyle,
  inputStyle,
  selectStyle,
  miniChipStyle,
} from "@/styles/bioStyles";

export default function ControlPanel({
  currentTimeInfo,
  effectivePeriodName,
  autoPeriod,
  setAutoPeriod,
  manualPeriod,
  setManualPeriod,
  weatherFilter,
  setWeatherFilter,
  areaFilter,
  setAreaFilter,
  keyword,
  setKeyword,
  fishCount,
  bugCount,
  birdCount,
  fishOwnedStars,
  bugOwnedStars,
  birdOwnedStars,
  ownedStars,
  totalStars,
  tab,
  placeFilter,
  setPlaceFilter,
  showAdvanced,
  setShowAdvanced,
  fishLevel,
  setFishLevel,
  bugLevel,
  setBugLevel,
  birdLevel,
  setBirdLevel,
  fishLevels,
  bugLevels,
  birdLevels,
  filteredCount,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const latestLog = CHANGELOG?.[0];
  const collectionProgress = totalStars > 0 ? Math.round((ownedStars / totalStars) * 1000) / 10 : 0;
  const fishTotalStars = fishCount * 5;
  const bugTotalStars = bugCount * 5;
  const birdTotalStars = birdCount * 5;
  const safeFishOwnedStars = Number(fishOwnedStars || 0);
  const safeBugOwnedStars = Number(bugOwnedStars || 0);
  const safeBirdOwnedStars = Number(birdOwnedStars || 0);
  const fishProgress = fishTotalStars > 0 ? Math.round((safeFishOwnedStars / fishTotalStars) * 1000) / 10 : 0;
  const bugProgress = bugTotalStars > 0 ? Math.round((safeBugOwnedStars / bugTotalStars) * 1000) / 10 : 0;
  const birdProgress = birdTotalStars > 0 ? Math.round((safeBirdOwnedStars / birdTotalStars) * 1000) / 10 : 0;

  const filterItemStyle = {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: "8px",
    minWidth: 0,
  };

  const filterLabelStyle = {
    fontSize: "13px",
    fontWeight: 600,
    color: "#555",
    whiteSpace: "nowrap",
    flexShrink: 0,
    width: "auto",
  };

  const compactSelectStyle = {
    ...selectStyle,
    height: "36px",
  };

  const levelSelectStyle = {
    ...compactSelectStyle,
    width: "72px",
    minWidth: "72px",
    flex: "0 0 72px",
  };

  const filterGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    alignItems: "center",
  };

  const levelGridStyle = {
    ...filterGridStyle,
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, max-content)",
    columnGap: "18px",
  };

  const rightColumnCardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#fff",
    padding: "12px 14px",
  };

  const progressPercentStyle = {
    fontSize: "11px",
    fontWeight: 400,
  };

  function getProgressColor(progress) {
    const rainbowScale = [
      "#7f00ff", // 0–7.6 紫
      "#5f27ff", // 7.7–15.3 紫藍
      "#2e86ff", // 15.4–23 藍
      "#00b8ff", // 23.1–30.7 淺藍
      "#00c9a7", // 30.8–38.4 青綠
      "#00d26a", // 38.5–46.1 綠
      "#7bdc00", // 46.2–53.8 黃綠
      "#c7e000", // 53.9–61.5 萊姆黃
      "#ffd600", // 61.6–69.2 黃
      "#ffb300", // 69.3–76.9 金橘
      "#ff8c00", // 77–84.6 橘
      "#ff5e57", // 84.7–92.3 橘紅
      "#ff2d55", // 92.4–100 紅
    ];

    const normalizedProgress = Math.max(0, Math.min(Number(progress) || 0, 100));
    const index = Math.min(
      Math.floor(normalizedProgress / (100 / rainbowScale.length)),
      rainbowScale.length - 1
    );

    return rainbowScale[index];
  }

  return (
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
          gridTemplateColumns: isMobile
            ? "1fr"
            : "minmax(360px, 0.95fr) minmax(240px, 0.62fr) minmax(260px, 0.72fr)",
          gap: "16px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "12px",
            minWidth: 0,
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

            <InfoPill label="目前時段" value={autoPeriod ? effectivePeriodName : ""}>
              {!autoPeriod && (
                <select
                  value={manualPeriod}
                  onChange={(e) => setManualPeriod(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#333",
                    outline: "none",
                    padding: 0,
                    marginLeft: "2px",
                    cursor: "pointer",
                  }}
                >
                  <option value="全部">全部</option>
                  <option value="1">清晨</option>
                  <option value="2">上午</option>
                  <option value="3">下午</option>
                  <option value="4">晚上</option>
                </select>
              )}

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginLeft: "8px",
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                  color: "#444",
                }}
              >
                <ToggleSwitch checked={autoPeriod} onChange={setAutoPeriod} />
                自動判斷
              </div>
            </InfoPill>

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

          <div style={filterGridStyle}>
            <div style={filterItemStyle}>
              <span style={filterLabelStyle}>天氣</span>
              <select
                value={weatherFilter}
                onChange={(e) => setWeatherFilter(e.target.value)}
                style={compactSelectStyle}
              >
                <option value="全部">全部</option>
                <option value="晴天">晴天 ☀️</option>
                <option value="雨天">雨天 ☔️</option>
                <option value="雪天">雪天 ⛄️</option>
                <option value="彩虹">彩虹 🌈</option>
              </select>
            </div>

            <div style={filterItemStyle}>
              <span style={filterLabelStyle}>地區</span>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                style={compactSelectStyle}
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

          </div>

          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                ...miniChipStyle,
                height: "36px",
              }}
            >
              愛好等級 {showAdvanced ? "-" : "+"}
            </button>

            {showAdvanced && (
              <div
                style={{
                  ...levelGridStyle,
                  marginTop: "8px",
                }}
              >
                <div style={filterItemStyle}>
                  <span style={filterLabelStyle}>釣魚</span>
                  <select
                    value={fishLevel}
                    onChange={(e) => setFishLevel(e.target.value)}
                    style={levelSelectStyle}
                  >
                    <option value="全部">全部</option>
                    {fishLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={filterItemStyle}>
                  <span style={filterLabelStyle}>捕蟲</span>
                  <select
                    value={bugLevel}
                    onChange={(e) => setBugLevel(e.target.value)}
                    style={levelSelectStyle}
                  >
                    <option value="全部">全部</option>
                    {bugLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={filterItemStyle}>
                  <span style={filterLabelStyle}>觀鳥</span>
                  <select
                    value={birdLevel}
                    onChange={(e) => setBirdLevel(e.target.value)}
                    style={levelSelectStyle}
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

            <div style={{ marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => setShowSearch((value) => !value)}
                style={{
                  ...miniChipStyle,
                  height: "36px",
                }}
              >
                搜尋 {showSearch ? "-" : "+"}
              </button>

              {showSearch && (
                <div
                  style={{
                    marginTop: "8px",
                    maxWidth: "360px",
                  }}
                >
                  <label style={labelStyle}>搜尋</label>
                  <input
                    type="text"
                    placeholder="輸入生物名稱"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            minWidth: 0,
            width: "100%",
            display: "grid",
            gap: "12px",
          }}
        >
          <div style={rightColumnCardStyle}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#111",
                marginBottom: "6px",
              }}
            >
              圖鑑筆數
            </div>

            <div
              style={{
                display: "grid",
                gap: "4px",
                fontSize: "13px",
                color: "#555",
                lineHeight: 1.5,
              }}
            >
              <div>
                🐟 {fishCount} 筆｜🐞 {bugCount} 筆｜🕊 {birdCount} 筆
              </div>
              <div>
                總圖鑑 {fishCount + bugCount + birdCount} 筆｜
                <strong>篩選後 {filteredCount} 筆</strong>
              </div>
            </div>
          </div>

          <div style={rightColumnCardStyle}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#111",
                marginBottom: "6px",
              }}
            >
              圖鑑進度
            </div>

            <div
              style={{
                display: "grid",
                gap: "4px",
                fontSize: "13px",
                color: "#555",
                lineHeight: 1.5,
              }}
            >
              <div>
                ⭐️ 總數 {ownedStars} / {totalStars}｜
                <strong style={{ color: getProgressColor(collectionProgress) }}>
                  完成度 {collectionProgress}%
                </strong>
              </div>
              <div
                style={{
                  display: "grid",
                  gap: "3px",
                }}
              >
                <div>
                  🐟 {safeFishOwnedStars} / {fishTotalStars}｜
                  <span
                    style={{
                      ...progressPercentStyle,
                      color: getProgressColor(fishProgress),
                    }}
                  >
                    完成度 {fishProgress}%
                  </span>
                </div>
                <div>
                  🐞 {safeBugOwnedStars} / {bugTotalStars}｜
                  <span
                    style={{
                      ...progressPercentStyle,
                      color: getProgressColor(bugProgress),
                    }}
                  >
                    完成度 {bugProgress}%
                  </span>
                </div>
                <div>
                  🕊 {safeBirdOwnedStars} / {birdTotalStars}｜
                  <span
                    style={{
                      ...progressPercentStyle,
                      color: getProgressColor(birdProgress),
                    }}
                  >
                    完成度 {birdProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            minWidth: 0,
            width: "100%",
          }}
        >
          <div style={rightColumnCardStyle}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#111",
                marginBottom: "6px",
              }}
            >
              更新日誌
            </div>

            {latestLog ? (
              <>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "8px",
                  }}
                >
                  {latestLog.version ? `${latestLog.date} · ${latestLog.version}` : latestLog.date}
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "4px",
                    fontSize: "13px",
                    color: "#555",
                    lineHeight: 1.5,
                  }}
                >
                  {latestLog.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        whiteSpace: "normal",
                        overflow: "visible",
                        textOverflow: "unset",
                      }}
                      dangerouslySetInnerHTML={{ __html: `• ${item}` }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: "13px",
                  color: "#888",
                }}
              >
                尚無更新紀錄
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}