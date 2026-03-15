"use client";

import ToggleSwitch from "@/components/ui/ToggleSwitch";
import InfoPill from "@/components/ui/InfoPill";
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
}) {
  const filterItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  };

  const filterLabelStyle = {
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

  const filterGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    alignItems: "center",
  };

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
          gridTemplateColumns: "minmax(0, 1.45fr) minmax(280px, 0.95fr)",
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

            <InfoPill label="目前時段" value={effectivePeriodName}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginLeft: "4px",
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

            <div style={filterItemStyle}>
              <span style={filterLabelStyle}>時段</span>
              <select
                value={manualPeriod}
                onChange={(e) => setManualPeriod(e.target.value)}
                style={{
                  ...compactSelectStyle,
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
              愛好等級 {showAdvanced ? "+" : "-"}
            </button>

            {showAdvanced && (
              <div
                style={{
                  ...filterGridStyle,
                  marginTop: "8px",
                }}
              >
                <div style={filterItemStyle}>
                  <span style={filterLabelStyle}>釣魚</span>
                  <select
                    value={fishLevel}
                    onChange={(e) => setFishLevel(e.target.value)}
                    style={compactSelectStyle}
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
                    style={compactSelectStyle}
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
                    style={compactSelectStyle}
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

        <div style={{ minWidth: 0 }}>
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
  );
}