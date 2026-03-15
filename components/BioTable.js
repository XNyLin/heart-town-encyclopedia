"use client";

import { useEffect, useState } from "react";
import {
  sortIconButtonStyle,
  thStyle,
  tdStyle,
  tdStyleStrong,
  panelStyle,
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
  const isCenter =
    text.includes("⊡") || text.includes("中心城區") || text.includes("🏘️");

  if (isEvent) {
    color = "#dc2626";
  } else if (isRiver) {
    color = "#38bdf8";
  } else if (isLake) {
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

export default function BioTable({
  loading,
  filteredRows,
  levelSort,
  setLevelSort,
  placeFilter,
  setPlaceFilter,
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

  const mobileThStyle = {
    ...thStyle,
    padding: isMobile ? "6px 4px" : thStyle.padding,
    fontSize: isMobile ? "12px" : thStyle.fontSize,
  };

  const mobileTdStyle = {
    ...tdStyle,
    padding: isMobile ? "4px 3px" : tdStyle.padding,
    fontSize: isMobile ? "11px" : tdStyle.fontSize,
    lineHeight: isMobile ? 1.3 : tdStyle.lineHeight,
  };

  const mobileTdStyleStrong = {
    ...tdStyleStrong,
    padding: isMobile ? "4px 3px" : tdStyleStrong.padding,
    fontSize: isMobile ? "11px" : tdStyleStrong.fontSize,
    lineHeight: isMobile ? 1.3 : tdStyleStrong.lineHeight,
  };

  return (
    <section
      style={{
        ...panelStyle,
        padding: isMobile ? "8px 8px" : "10px 14px",
        overflowX: "auto",
      }}
    >
      {loading ? (
        <div style={{ padding: "20px", color: "#666" }}>資料載入中...</div>
      ) : (
        <table
          style={{
            width: "100%",
            minWidth: isMobile ? "640px" : "unset",
            borderCollapse: "collapse",
            tableLayout: "auto",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  ...mobileThStyle,
                  width: isMobile ? "22px" : "30px",
                  textAlign: "center",
                }}
              >
                類型
              </th>

              <th
                style={{
                  ...mobileThStyle,
                  width: isMobile ? "40px" : "54px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>等級</span>
                  <button
                    onClick={() => setLevelSort(getNextLevelSort(levelSort))}
                    style={{
                      ...sortIconButtonStyle,
                      width: isMobile ? "20px" : sortIconButtonStyle.width,
                      height: isMobile ? "20px" : sortIconButtonStyle.height,
                      fontSize: isMobile ? "11px" : sortIconButtonStyle.fontSize,
                    }}
                    title={
                      levelSort === "none"
                        ? "目前：未排序"
                        : levelSort === "asc"
                        ? "目前：低到高"
                        : "目前：高到低"
                    }
                  >
                    {getLevelSortIcon(levelSort)}
                  </button>
                </div>
              </th>

              <th style={mobileThStyle}>名稱</th>
              <th style={mobileThStyle}>天氣</th>
              <th style={mobileThStyle}>時段</th>
              <th style={mobileThStyle}>地點</th>
              <th style={mobileThStyle}>Note</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "22px 12px",
                    textAlign: "center",
                    color: "#777",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  沒有符合條件的資料
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => {
                const place = getField(row, ["地點"]);
                const isActivePlace = placeFilter === place;

                return (
                  <tr key={`${getField(row, ["名稱"])}-${index}`}>
                    <td
                      style={{
                        ...mobileTdStyle,
                        width: isMobile ? "22px" : "30px",
                        textAlign: "center",
                        padding: "4px 2px",
                        fontSize: isMobile ? "14px" : "16px",
                      }}
                    >
                      {{
                        魚: "🐟",
                        蟲: "🐞",
                        鳥: "🕊",
                      }[getField(row, ["類型"])] || ""}
                    </td>

                    <td
                      style={{
                        ...mobileTdStyle,
                        width: isMobile ? "40px" : "54px",
                        textAlign: "center",
                        padding: isMobile ? "4px 2px" : "6px 4px",
                        fontWeight: 500,
                      }}
                    >
                      {getField(row, ["Level", "等級"])}
                    </td>

                    <td style={mobileTdStyleStrong}>
                      {getField(row, ["名稱"])}
                    </td>

                    <td style={mobileTdStyle}>
                      {formatWeatherDisplay(getField(row, ["天氣"]))}
                    </td>

                    <td style={mobileTdStyle}>
                      {formatPeriodDisplay(getField(row, ["時段", "時間"]))}
                    </td>

                    <td style={mobileTdStyle}>
                      <button
                        onClick={() => setPlaceFilter(place)}
                        style={{
                          background: isActivePlace ? "#eef2ff" : "transparent",
                          border: isActivePlace
                            ? "1px solid #c7d2fe"
                            : "1px solid transparent",
                          borderRadius: "7px",
                          padding: isMobile ? "2px 3px" : "2px 4px",
                          cursor: "pointer",
                          fontSize: isMobile ? "11px" : "14px",
                          textAlign: "left",
                          lineHeight: isMobile ? 1.25 : 1.4,
                        }}
                        title="點擊查看該地點所有生物"
                      >
                        {formatPlaceDisplay(place)}
                      </button>
                    </td>

                    <td style={mobileTdStyle}>
                      {formatFishShadowDisplay(getField(row, ["Note", "備註"]))}
                    </td>
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