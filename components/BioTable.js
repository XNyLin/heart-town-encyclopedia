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

  if (text.includes("河")) color = "#38bdf8";
  else if (text.includes("湖")) color = "#22c55e";
  else if (text.includes("海")) color = "#3b82f6";
  else if (text.includes("中心")) color = "#eab308";

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

  const thCompact = {
    ...thStyle,
    padding: "6px 6px",
    fontSize: isMobile ? "12px" : "13px",
  };

  const tdCompact = {
    ...tdStyle,
    padding: "5px 6px",
    fontSize: isMobile ? "12px" : "13px",
    lineHeight: 1.3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const tdStrongCompact = {
    ...tdStyleStrong,
    padding: "5px 6px",
    fontSize: isMobile ? "12px" : "13px",
    lineHeight: 1.3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <section
      style={{
        ...panelStyle,
        padding: isMobile ? "8px" : "10px 14px",
        overflowX: "auto",
      }}
    >
      {loading ? (
        <div style={{ padding: "20px", color: "#666" }}>資料載入中...</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thCompact, width: "36px", textAlign: "center" }}>
                類型
              </th>

              <th style={{ ...thCompact, width: "60px", textAlign: "center" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  等級
                  <button
                    onClick={() => setLevelSort(getNextLevelSort(levelSort))}
                    style={{
                      ...sortIconButtonStyle,
                      width: "20px",
                      height: "20px",
                      fontSize: "11px",
                    }}
                  >
                    {getLevelSortIcon(levelSort)}
                  </button>
                </div>
              </th>

              <th style={{ ...thCompact, width: "120px" }}>名稱</th>

              <th style={{ ...thCompact, width: "80px" }}>天氣</th>

              <th style={{ ...thCompact, width: "90px" }}>時段</th>

              <th style={{ ...thCompact, width: "120px" }}>地點</th>

              <th style={thCompact}>Note</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#777",
                    fontSize: "13px",
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
                        ...tdCompact,
                        textAlign: "center",
                        fontSize: "15px",
                      }}
                    >
                      {{
                        魚: "🐟",
                        蟲: "🐞",
                        鳥: "🕊",
                      }[getField(row, ["類型"])] || ""}
                    </td>

                    <td style={{ ...tdCompact, textAlign: "center" }}>
                      {getField(row, ["Level", "等級"])}
                    </td>

                    <td style={tdStrongCompact}>
                      {getField(row, ["名稱"])}
                    </td>

                    <td style={tdCompact}>
                      {formatWeatherDisplay(getField(row, ["天氣"]))}
                    </td>

                    <td style={tdCompact}>
                      {formatPeriodDisplay(getField(row, ["時段", "時間"]))}
                    </td>

                    <td style={tdCompact}>
                      <button
                        onClick={() => setPlaceFilter(place)}
                        style={{
                          background: isActivePlace ? "#eef2ff" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "0",
                          fontSize: "inherit",
                        }}
                      >
                        {formatPlaceDisplay(place)}
                      </button>
                    </td>

                    <td style={tdCompact}>
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