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
  seasonFilter,
  setSeasonFilter,
  areaFilter,
  setAreaFilter,
  keyword,
  setKeyword,
  fishCount,
  bugCount,
  birdCount,
  shellCount,
  fishOwnedStars,
  bugOwnedStars,
  birdOwnedStars,
  shellOwnedStars,
  ownedStars,
  totalStars,
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
  shellLevel,
  setShellLevel,
  fishLevels,
  bugLevels,
  birdLevels,
  filteredCount,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showOlderLogs, setShowOlderLogs] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const latestLog = CHANGELOG?.[0];
  const olderLogs = CHANGELOG?.slice(1) ?? [];
  const collectionProgress = totalStars > 0 ? Math.round((ownedStars / totalStars) * 100) : 0;
  const fishTotalStars = fishCount * 5;
  const bugTotalStars = bugCount * 5;
  const birdTotalStars = birdCount * 5;
  const shellTotalStars = shellCount * 5;
  const safeFishOwnedStars = Number(fishOwnedStars || 0);
  const safeBugOwnedStars = Number(bugOwnedStars || 0);
  const safeBirdOwnedStars = Number(birdOwnedStars || 0);
  const safeShellOwnedStars = Number(shellOwnedStars || 0);
  const fishProgress = fishTotalStars > 0 ? Math.round((safeFishOwnedStars / fishTotalStars) * 100) : 0;
  const bugProgress = bugTotalStars > 0 ? Math.round((safeBugOwnedStars / bugTotalStars) * 100) : 0;
  const birdProgress = birdTotalStars > 0 ? Math.round((safeBirdOwnedStars / birdTotalStars) * 100) : 0;
  const shellProgress = shellTotalStars > 0 ? Math.round((safeShellOwnedStars / shellTotalStars) * 100) : 0;

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
  const compactSelectStyle = { ...selectStyle, height: "36px" };
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
    width: "100%",
    maxWidth: "100%",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
    columnGap: "8px",
  };
  const rightColumnCardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#fff",
    padding: "12px 14px",
  };
  const progressPercentStyle = { fontSize: "11px", fontWeight: 400 };

  function getProgressColor(progress) {
    const rainbowScale = [
      "#7f00ff", "#5f27ff", "#2e86ff", "#00b8ff", "#00c9a7",
      "#00d26a", "#7bdc00", "#c7e000", "#ffd600", "#ffb300",
      "#ff8c00", "#ff5e57", "#ff2d55",
    ];
    const normalizedProgress = Math.max(0, Math.min(Number(progress) || 0, 100));
    const index = Math.min(
      Math.floor(normalizedProgress / (100 / rainbowScale.length)),
      rainbowScale.length - 1
    );
    return rainbowScale[index];
  }

  function renderLog(log) {
    return (
      <div key={`${log.date}-${log.version || ""}`}>
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
          {log.version ? `${log.date} · ${log.version}` : log.date}
        </div>
        <div style={{ display: "grid", gap: "4px", fontSize: "13px", color: "#555", lineHeight: 1.5 }}>
          {log.items.map((item, index) => (
            <div
              key={index}
              style={{ whiteSpace: "normal", overflow: "visible", textOverflow: "unset" }}
              dangerouslySetInnerHTML={{ __html: `• ${item}` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const levelSelect = (label, value, setter, levels) => (
    <div style={filterItemStyle}>
      <span style={filterLabelStyle}>{label}</span>
      <select value={value} onChange={(e) => setter(e.target.value)} style={levelSelectStyle}>
        <option value="全部">全部</option>
        {levels.map((level) => (
          <option key={level} value={level}>{level}</option>
        ))}
      </select>
    </div>
  );

  return (
    <section style={{ ...panelStyle, marginBottom: "16px", padding: "16px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "minmax(320px, 0.82fr) minmax(280px, 0.75fr) minmax(260px, 0.72fr)",
          gap: "16px",
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: "12px", minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
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
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginLeft: "8px", whiteSpace: "nowrap", fontSize: "12px", color: "#444" }}>
                <ToggleSwitch checked={autoPeriod} onChange={setAutoPeriod} />
                自動
              </div>
            </InfoPill>
            {placeFilter && (
              <>
                <InfoPill label="📍現在查看的位置" value={placeFilter} />
                <button onClick={() => setPlaceFilter("")} style={miniChipStyle}>返回全部位置</button>
              </>
            )}
          </div>

          <div style={filterGridStyle}>
            <div style={filterItemStyle}>
              <span style={filterLabelStyle}>天氣</span>
              <select value={weatherFilter} onChange={(e) => setWeatherFilter(e.target.value)} style={compactSelectStyle}>
                <option value="全部">全部</option>
                <option value="晴天">晴天 ☀️</option>
                <option value="雨天">雨天 ☔️</option>
                <option value="雪天">雪天 ⛄️</option>
                <option value="彩虹">彩虹 🌈</option>
              </select>
            </div>

            <div style={filterItemStyle}>
              <span style={filterLabelStyle}>地區</span>
              <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} style={compactSelectStyle}>
                {["全部", "中心城區", "北部", "東部", "西部", "南部", "鯨落峽谷"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div style={filterItemStyle}>
              <span style={filterLabelStyle}>季節</span>
              <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} style={compactSelectStyle}>
                <option value="全部">全部</option>
                <option value="常駐">常駐</option>
                <option value="尋鯨季">尋鯨季</option>
              </select>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ ...miniChipStyle, height: "36px" }}>
              愛好等級 {showAdvanced ? "-" : "+"}
            </button>
            {showAdvanced && (
              <div style={{ ...levelGridStyle, marginTop: "8px" }}>
                {levelSelect("釣魚", fishLevel, setFishLevel, fishLevels)}
                {levelSelect("捕蟲", bugLevel, setBugLevel, bugLevels)}
                {levelSelect("觀鳥", birdLevel, setBirdLevel, birdLevels)}
                <div style={{ ...filterItemStyle, gridColumn: isMobile ? "auto" : "1 / -1" }}>
                  <span style={filterLabelStyle}>海洋清潔</span>
                  <select value={shellLevel} onChange={(e) => setShellLevel(e.target.value)} style={levelSelectStyle}>
                    <option value="全部">全部</option>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={{ marginTop: "12px" }}>
              <button type="button" onClick={() => setShowSearch((value) => !value)} style={{ ...miniChipStyle, height: "36px" }}>
                搜尋 {showSearch ? "-" : "+"}
              </button>
              {showSearch && (
                <div style={{ marginTop: "8px", maxWidth: "360px" }}>
                  <label style={labelStyle}>搜尋</label>
                  <input type="text" placeholder="輸入生物名稱" value={keyword} onChange={(e) => setKeyword(e.target.value)} style={inputStyle} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ minWidth: 0, width: "100%", display: "grid", gap: "12px" }}>
          <div style={rightColumnCardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#111", marginBottom: "6px" }}>圖鑑筆數</div>
            <div style={{ display: "grid", gap: "4px", fontSize: "13px", color: "#555", lineHeight: 1.5 }}>
              <div>🐟 {fishCount} 筆｜🐞 {bugCount} 筆｜🕊 {birdCount} 筆｜🐚 {shellCount} 筆</div>
              <div>總圖鑑 {fishCount + bugCount + birdCount + shellCount} 筆｜<strong>篩選後 {filteredCount} 筆</strong></div>
            </div>
          </div>

          <div style={rightColumnCardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#111", marginBottom: "6px" }}>圖鑑進度</div>
            <div style={{ display: "grid", gap: "4px", fontSize: "13px", color: "#555", lineHeight: 1.5 }}>
              <div>⭐️ 總數 {ownedStars} / {totalStars}｜<strong style={{ color: getProgressColor(collectionProgress) }}>完成度 {collectionProgress}%</strong></div>
              <div style={{ display: "grid", gap: "3px" }}>
                <div>🐟 {safeFishOwnedStars} / {fishTotalStars}｜<span style={{ ...progressPercentStyle, color: getProgressColor(fishProgress) }}>完成度 {fishProgress}%</span></div>
                <div>🐞 {safeBugOwnedStars} / {bugTotalStars}｜<span style={{ ...progressPercentStyle, color: getProgressColor(bugProgress) }}>完成度 {bugProgress}%</span></div>
                <div>🕊 {safeBirdOwnedStars} / {birdTotalStars}｜<span style={{ ...progressPercentStyle, color: getProgressColor(birdProgress) }}>完成度 {birdProgress}%</span></div>
                <div>🐚 {safeShellOwnedStars} / {shellTotalStars}｜<span style={{ ...progressPercentStyle, color: getProgressColor(shellProgress) }}>完成度 {shellProgress}%</span></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ minWidth: 0, width: "100%" }}>
          <div style={rightColumnCardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#111", marginBottom: "6px" }}>更新日誌</div>
            {latestLog ? (
              <>
                {renderLog(latestLog)}
                {showOlderLogs && olderLogs.length > 0 && (
                  <div style={{ display: "grid", gap: "12px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee", maxHeight: "180px", overflowY: "auto", paddingRight: "4px" }}>
                    {olderLogs.map(renderLog)}
                  </div>
                )}
                {olderLogs.length > 0 && (
                  <button type="button" onClick={() => setShowOlderLogs((value) => !value)} style={{ border: "none", background: "transparent", padding: "8px 0 0", fontSize: "12px", fontWeight: 600, color: "#555", cursor: "pointer" }}>
                    More {showOlderLogs ? "-" : "+"}
                  </button>
                )}
              </>
            ) : (
              <div style={{ fontSize: "13px", color: "#888" }}>尚無更新紀錄</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
