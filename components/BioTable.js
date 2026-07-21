"use client";

import { useEffect, useState } from "react";
import {
  sortIconButtonStyle,
  thStyle,
  tdStyle,
  tdStyleStrong,
  panelStyle,
  miniChipStyle,
} from "@/styles/bioStyles";
import {
  formatPeriodDisplay,
  formatWeatherDisplay,
  getLevelSortIcon,
  getNextLevelSort,
  getField,
} from "@/lib/bio-utils";

function formatFishShadowDisplay(value) {
  const text = String(value || "");
  if (text.includes("金魚影")) {
    return <span style={{ color: "#d97706", fontWeight: 700 }}>{text}</span>;
  }
  if (text.includes("藍魚影")) {
    return <span style={{ color: "#2563eb", fontWeight: 700 }}>{text}</span>;
  }
  return text;
}

function formatPlaceDisplay(value) {
  const text = String(value || "");
  let color = "#222";
  const isEvent = text.includes("事件") || text.includes("⭐️");
  const isRiver = text.includes("河");
  const isLake = text.includes("湖");
  const isSea = text.includes("海");
  const isNorth = text.includes("⬆");
  const isWest = text.includes("⬅");
  const isEast = text.includes("⮕");
  const isSouth = text.includes("⬇");
  const isCenter = text.includes("⊡") || text.includes("中心城區") || text.includes("🏘️");

  if (isEvent) color = "#dc2626";
  else if (isRiver) color = "#38bdf8";
  else if (isLake) {
    if (isNorth) color = "#15803d";
    else if (isEast) color = "#166534";
    else if (isWest) color = "#22c55e";
    else if (isSouth) color = "#4ade80";
    else color = "#16a34a";
  } else if (isSea) {
    if (isNorth) color = "#1e3a8a";
    else if (isEast) color = "#1e40af";
    else if (isWest) color = "#2563eb";
    else if (isSouth) color = "#3b82f6";
    else color = "#1d4ed8";
  } else {
    if (isNorth) color = "#8b5a2b";
    else if (isWest) color = "#9ad87a";
    else if (isEast) color = "#1f7a3a";
    else if (isSouth) color = "#2563eb";
    else if (isCenter) color = "#eab308";
  }

  return <span style={{ color, fontWeight: 600 }}>{text}</span>;
}

function getTypeEmoji(type) {
  return { 魚: "🐟", 蟲: "🐞", 鳥: "🕊", 貝: "🐚" }[type] || "";
}

function StarSelector({ name, value, onChange, maxStars = 5 }) {
  const safeMaxStars = Math.max(1, Number(maxStars) || 5);
  const currentValue = Math.min(Number(value ?? 0), safeMaxStars);

  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: "1px", whiteSpace: "nowrap" }}
      aria-label={`${name} 星數 ${currentValue}`}
    >
      {Array.from({ length: safeMaxStars }, (_, index) => index + 1).map((star) => {
        const active = star <= currentValue;
        return (
          <button
            key={`${name}-${star}`}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (typeof onChange === "function") {
                onChange(name, star === currentValue ? 0 : star);
              }
            }}
            style={{
              border: "none",
              background: "transparent",
              color: active ? "#111" : "#c7c7c7",
              padding: "0 1px",
              fontSize: "16px",
              lineHeight: 1,
              cursor: "pointer",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
            }}
            title={`${star} 星`}
            aria-label={`${star} 星`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function BioTable({
  loading,
  filteredRows,
  levelSort,
  setLevelSort,
  placeFilter,
  setPlaceFilter,
  starRecords = {},
  setStarRecord,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobileThStyle = { ...thStyle, padding: "6px 6px", fontSize: "12px" };
  const mobileTdStyle = {
    ...tdStyle,
    padding: "8px 6px",
    fontSize: "12px",
    lineHeight: 1.5,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const mobileTdStrongStyle = {
    ...tdStyleStrong,
    padding: "8px 6px",
    fontSize: "12px",
    lineHeight: 1.5,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  if (isMobile) {
    return (
      <section style={{ ...panelStyle, padding: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "8px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#333" }}>圖鑑資料</div>
          <button onClick={() => setLevelSort(getNextLevelSort(levelSort))} style={{ ...miniChipStyle, height: "32px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            等級 {getLevelSortIcon(levelSort)}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "16px 4px", color: "#666" }}>資料載入中...</div>
        ) : filteredRows.length === 0 ? (
          <div style={{ padding: "16px 4px", color: "#777", fontSize: "13px", textAlign: "center" }}>沒有符合條件的資料</div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {filteredRows.map((row, index) => {
              const type = getField(row, ["類型"]);
              const name = getField(row, ["名稱"]);
              const level = getField(row, ["Level", "等級"]);
              const weather = getField(row, ["天氣"]);
              const period = getField(row, ["時段", "時間"]);
              const place = getField(row, ["地點"]);
              const note = getField(row, ["Note", "備註"]);
              const starValue = Number(starRecords[name] ?? 0);
              const isActivePlace = placeFilter === place;

              const infoRow = (label, content) => (
                <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr)", gap: "8px", alignItems: "start" }}>
                  <span style={{ color: "#888" }}>{label}</span>
                  <span style={{ minWidth: 0 }}>{content}</span>
                </div>
              );

              return (
                <div key={`${name}-${index}`} style={{ border: "1px solid #ececec", borderRadius: "14px", padding: "12px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", minWidth: 0 }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>{getTypeEmoji(type)}</span>
                    <span style={{ flexShrink: 0, fontSize: "13px", fontWeight: 700, color: "#444" }}>Lv.{level}</span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#111", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                    <span style={{ flexShrink: 0 }}>
                      <StarSelector name={name} value={starValue} onChange={setStarRecord} maxStars={name === "破損的海貝" ? 1 : 5} />
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "12px", fontSize: "13px", color: "#444", lineHeight: 1.45 }}>
                    <div style={{ display: "grid", gap: "6px", minWidth: 0 }}>
                      {infoRow("天氣", formatWeatherDisplay(weather))}
                      {infoRow("時段", formatPeriodDisplay(period))}
                      <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr)", gap: "8px", alignItems: "start" }}>
                        <span style={{ color: "#888" }}>地點</span>
                        <button
                          onClick={() => setPlaceFilter(place)}
                          style={{
                            background: isActivePlace ? "#eef2ff" : "transparent",
                            border: isActivePlace ? "1px solid #c7d2fe" : "1px solid transparent",
                            borderRadius: "8px",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: "13px",
                            textAlign: "left",
                            lineHeight: 1.4,
                            justifySelf: "start",
                            minWidth: 0,
                          }}
                          title="點擊查看該地點所有生物"
                        >
                          {formatPlaceDisplay(place)}
                        </button>
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#888", marginBottom: "6px" }}>Note.</div>
                      <div style={{ whiteSpace: "pre-line", lineHeight: 1.5, overflowWrap: "break-word" }}>{formatFishShadowDisplay(note)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <section style={{ ...panelStyle, padding: "10px 14px", overflowX: "auto" }}>
      {loading ? (
        <div style={{ padding: "20px", color: "#666" }}>資料載入中...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...mobileThStyle, width: "34px", textAlign: "center" }}>類型</th>
              <th style={{ ...mobileThStyle, width: "54px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px" }}>
                  等級
                  <button onClick={() => setLevelSort(getNextLevelSort(levelSort))} style={{ ...sortIconButtonStyle, width: "20px", height: "20px", fontSize: "11px" }}>
                    {getLevelSortIcon(levelSort)}
                  </button>
                </div>
              </th>
              <th style={{ ...mobileThStyle, width: "112px" }}>名稱</th>
              <th style={{ ...mobileThStyle, width: "68px" }}>天氣</th>
              <th style={{ ...mobileThStyle, width: "108px" }}>時段</th>
              <th style={{ ...mobileThStyle, width: "106px" }}>地點</th>
              <th style={{ ...mobileThStyle, width: "118px" }}>星數</th>
              <th style={{ ...mobileThStyle }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "20px", textAlign: "center", color: "#777", fontSize: "13px" }}>沒有符合條件的資料</td>
              </tr>
            ) : (
              filteredRows.map((row, index) => {
                const name = getField(row, ["名稱"]);
                const place = getField(row, ["地點"]);
                const starValue = Number(starRecords[name] ?? 0);
                const isActivePlace = placeFilter === place;
                const rowBackground = index % 2 === 0 ? "#ffffff" : "#f7f7f7";
                const cell = (content, style = {}) => (
                  <td style={{ ...mobileTdStyle, background: rowBackground, ...style }}>{content}</td>
                );

                return (
                  <tr key={`${name}-${index}`} style={{ background: rowBackground }}>
                    {cell(getTypeEmoji(getField(row, ["類型"])), { textAlign: "center", fontSize: "15px" })}
                    {cell(getField(row, ["Level", "等級"]), { textAlign: "center" })}
                    <td style={{ ...mobileTdStrongStyle, background: rowBackground }}>{name}</td>
                    {cell(formatWeatherDisplay(getField(row, ["天氣"])))}
                    {cell(formatPeriodDisplay(getField(row, ["時段", "時間"])))}
                    {cell(
                      <button
                        onClick={() => setPlaceFilter(place)}
                        style={{ background: isActivePlace ? "#eef2ff" : "transparent", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit" }}
                      >
                        {formatPlaceDisplay(place)}
                      </button>
                    )}
                    {cell(
                      <StarSelector name={name} value={starValue} onChange={setStarRecord} maxStars={name === "破損的海貝" ? 1 : 5} />,
                      { overflow: "visible", textOverflow: "unset", textAlign: "center" }
                    )}
                    {cell(formatFishShadowDisplay(getField(row, ["Note", "備註"])), {
                      whiteSpace: "pre-line",
                      wordBreak: "normal",
                      overflowWrap: "break-word",
                      overflow: "visible",
                      textOverflow: "unset",
                      lineHeight: 1.5,
                      fontSize: "11.5px",
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
